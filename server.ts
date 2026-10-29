import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Simple in-memory session token store for admin auth
  const activeAdminSessions = new Map<string, { email: string; name: string; expiresAt: number }>();

  function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
    }
    const token = authHeader.substring(7);
    const session = activeAdminSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      activeAdminSessions.delete(token);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    next();
  }

  // --- Public APIs ---

  // Products listing
  app.get('/api/products', (req, res) => {
    try {
      const { category, minPrice, maxPrice, color, inStockOnly, search, sort, featuredOnly } = req.query;
      const products = db.getProducts({
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        color: color as string,
        inStockOnly: inStockOnly === 'true',
        search: search as string,
        sort: sort as string,
        featuredOnly: featuredOnly === 'true'
      });
      res.json({ products });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch products' });
    }
  });

  // Single product detail
  app.get('/api/products/:idOrSlug', (req, res) => {
    try {
      const product = db.getProductByIdOrSlug(req.params.idOrSlug);
      if (!product) {
        return res.status(404).json({ error: 'Handloom saree not found in collection' });
      }
      res.json({ product });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch product' });
    }
  });

  // Apply Coupon
  app.post('/api/coupons/apply', (req, res) => {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Please enter a valid coupon code' });
      }
      const coupon = db.getCouponByCode(code);
      if (!coupon) {
        return res.status(404).json({ error: 'Invalid or expired promotional code' });
      }
      if (subtotal < coupon.minSpend) {
        return res.status(400).json({ 
          error: `Minimum order amount of ₹${coupon.minSpend.toLocaleString('en-IN')} required for ${coupon.code}` 
        });
      }

      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
      } else {
        discountAmount = Math.min(coupon.value, subtotal);
      }

      res.json({ 
        coupon,
        discountAmount,
        message: `Coupon ${coupon.code} applied successfully! You saved ₹${discountAmount.toLocaleString('en-IN')}` 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to validate coupon' });
    }
  });

  // Create Order (Checkout)
  app.post('/api/orders', (req, res) => {
    try {
      const {
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        deliveryMethod,
        items,
        couponCode,
        paymentMethod,
        cardDetails,
        notes
      } = req.body;

      if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
        return res.status(400).json({ error: 'Please complete all required customer and delivery fields.' });
      }

      if (!shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode) {
        return res.status(400).json({ error: 'Complete street address, city, state, and pincode are required.' });
      }

      const result = db.createOrder({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        deliveryMethod: deliveryMethod || 'standard',
        items,
        couponCode,
        paymentMethod: paymentMethod || 'cod',
        cardDetails,
        notes
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error || 'Failed to place order' });
      }

      res.status(201).json({
        success: true,
        order: result.order,
        message: `Order ${result.order?.orderNumber} confirmed successfully!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Unexpected checkout error occurred' });
    }
  });

  // Track Order by Order Number & Email
  app.get('/api/orders/track', (req, res) => {
    try {
      const { orderNumber, email } = req.query;
      if (!orderNumber || !email) {
        return res.status(400).json({ error: 'Please enter both Order Number and Email address.' });
      }
      const order = db.findOrderByTracking(orderNumber as string, email as string);
      if (!order) {
        return res.status(404).json({ error: 'No matching order found. Please check your Order Number and Email.' });
      }
      res.json({ order });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Tracking failed' });
    }
  });

  // --- Admin Authentication ---
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const admin = db.verifyAdminCredentials(email, password);
      if (!admin) {
        return res.status(401).json({ error: 'Invalid admin credentials.' });
      }

      const token = `adm_tok_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      activeAdminSessions.set(token, { email: admin.email, name: admin.name, expiresAt });

      res.json({
        success: true,
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login error' });
    }
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ authenticated: false });
    }
    const token = authHeader.substring(7);
    const session = activeAdminSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ authenticated: false });
    }
    res.json({ authenticated: true, admin: { email: session.email, name: session.name } });
  });

  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      activeAdminSessions.delete(token);
    }
    res.json({ success: true });
  });

  // --- Admin Protected APIs ---

  // Dashboard metrics
  app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
    try {
      const stats = db.getAdminStats();
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch statistics' });
    }
  });

  // Admin products
  app.get('/api/admin/products', requireAdminAuth, (req, res) => {
    try {
      const products = db.getAllAdminProducts();
      res.json({ products });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch products' });
    }
  });

  app.post('/api/admin/products', requireAdminAuth, (req, res) => {
    try {
      const product = db.createProduct(req.body);
      res.status(201).json({ product });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create product' });
    }
  });

  app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    try {
      const updated = db.updateProduct(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ product: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update product' });
    }
  });

  app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    try {
      const ok = db.deleteProduct(req.params.id);
      if (!ok) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json({ success: true, message: 'Product removed successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete product' });
    }
  });

  // Admin orders
  app.get('/api/admin/orders', requireAdminAuth, (req, res) => {
    try {
      const { status, search } = req.query;
      const orders = db.getOrders({
        status: status as string,
        search: search as string
      });
      res.json({ orders });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch orders' });
    }
  });

  app.put('/api/admin/orders/:id/status', requireAdminAuth, (req, res) => {
    try {
      const { status } = req.body;
      const updated = db.updateOrderStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ order: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update order status' });
    }
  });

  app.put('/api/admin/orders/:id/payment-status', requireAdminAuth, (req, res) => {
    try {
      const { status } = req.body;
      const updated = db.updatePaymentStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ order: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update payment status' });
    }
  });

  // Inline inventory update
  app.put('/api/admin/inventory/:variantId', requireAdminAuth, (req, res) => {
    try {
      const { stock } = req.body;
      const ok = db.updateVariantStock(req.params.variantId, Number(stock));
      if (!ok) {
        return res.status(404).json({ error: 'Variant not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update inventory' });
    }
  });

  // Admin coupons
  app.get('/api/admin/coupons', requireAdminAuth, (req, res) => {
    try {
      res.json({ coupons: db.getCoupons() });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch coupons' });
    }
  });

  app.post('/api/admin/coupons', requireAdminAuth, (req, res) => {
    try {
      const coupon = db.createCoupon(req.body);
      res.status(201).json({ coupon });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create coupon' });
    }
  });

  app.put('/api/admin/coupons/:code/toggle', requireAdminAuth, (req, res) => {
    try {
      const ok = db.toggleCoupon(req.params.code);
      if (!ok) {
        return res.status(404).json({ error: 'Coupon not found' });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to toggle coupon' });
    }
  });

  // Reset to initial demo saree collection
  app.post('/api/admin/reset-demo', requireAdminAuth, (req, res) => {
    try {
      db.resetToSareeSeed();
      res.json({ success: true, message: 'Nagalakshmi Handloom Sarees collection re-seeded successfully.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to reset demo' });
    }
  });

  // --- Vite Dev Server Middleware or Production Static Serving ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nagalakshmi Handloom Sarees Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
