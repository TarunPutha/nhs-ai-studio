import { db } from '../server/db';
import type { OrderStatus } from '../src/types/ecommerce';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
  console.log(`  ✓ ${msg}`);
}

async function runTests() {
  console.log('\n--- Running Nagalakshmi Handloom Sarees Automated Tests ---');

  // Test 1: Product Variants & Swatches
  console.log('\n1. Testing Product Variants & Swatch Configurations:');
  const products = db.getProducts();
  assert(products.length >= 6, 'Loaded at least 6 authentic handloom saree designs');
  const royalMayura = products.find(p => p.slug === 'royal-mayura-kanchipuram-silk');
  assert(!!royalMayura, 'Royal Mayura Kanchipuram silk saree found');
  assert(royalMayura!.variants.length >= 3, 'Royal Mayura has at least 3 color variations');
  const crimsonVariant = royalMayura!.variants.find(v => v.colorName.includes('Crimson'));
  assert(!!crimsonVariant, 'Crimson & Gold variant exists with image and stock');
  assert(crimsonVariant!.stock > 0, `Crimson variant has initial stock of ${crimsonVariant!.stock}`);

  // Test 2: Coupon Calculations & Validation
  console.log('\n2. Testing Coupon Calculations:');
  const couponUtsav = db.getCouponByCode('UTSAV10');
  assert(!!couponUtsav, 'UTSAV10 coupon exists in database');
  assert(couponUtsav!.value === 10 && couponUtsav!.discountType === 'percentage', 'UTSAV10 grants 10% discount');
  
  const couponSilk = db.getCouponByCode('SILK1000');
  assert(!!couponSilk, 'SILK1000 coupon exists for flat ₹1,000 discount');
  assert(couponSilk!.value === 1000 && couponSilk!.minSpend === 15000, 'SILK1000 requires ₹15,000 min spend');

  // Test 3: Checkout Validation & Atomic Stock Deduction
  console.log('\n3. Testing Atomic Order Creation & Stock Management:');
  const initialStock = crimsonVariant!.stock;
  const orderResult = db.createOrder({
    customerName: 'Pooja Hegde',
    customerEmail: 'pooja.hegde@handloomtest.com',
    customerPhone: '+91 98888 77777',
    shippingAddress: {
      fullName: 'Pooja Hegde',
      email: 'pooja.hegde@handloomtest.com',
      phone: '+91 98888 77777',
      addressLine1: 'B-12 Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500033',
      country: 'India'
    },
    deliveryMethod: 'standard',
    items: [
      {
        productId: royalMayura!.id,
        variantId: crimsonVariant!.id,
        quantity: 2
      }
    ],
    couponCode: 'UTSAV10',
    paymentMethod: 'card',
    cardDetails: {
      cardNumber: '4242 4242 4242 4242',
      expMonth: '12',
      expYear: '28',
      cvc: '123'
    }
  });

  assert(orderResult.success, 'Order created successfully');
  assert(!!orderResult.order, 'Order object returned');
  assert(orderResult.order!.orderNumber.startsWith('NLS-2026-'), 'Generated unique NLS-2026-XXXX order number');
  assert(orderResult.order!.paymentStatus === 'Paid', 'Card payment verified as Paid');
  assert(orderResult.order!.discountAmount > 0, `Applied 10% discount: ₹${orderResult.order!.discountAmount}`);

  // Verify stock deduction
  const updatedProduct = db.getProductByIdOrSlug(royalMayura!.id);
  const updatedVariant = updatedProduct!.variants.find(v => v.id === crimsonVariant!.id);
  assert(updatedVariant!.stock === initialStock - 2, `Stock deducted from ${initialStock} to ${updatedVariant!.stock}`);

  // Test 4: Order Tracking
  console.log('\n4. Testing Order Lookup & Tracking:');
  const tracked = db.findOrderByTracking(orderResult.order!.orderNumber, 'pooja.hegde@handloomtest.com');
  assert(!!tracked, 'Tracked order found by order number and customer email');
  assert(tracked!.id === orderResult.order!.id, 'Tracked order matches created order ID');

  // Test 5: Admin Authorization & Status Updates
  console.log('\n5. Testing Admin Auth & Status Transitions:');
  const validAdmin = db.verifyAdminCredentials('admin@nagalakshmihandlooms.com', 'nagalakshmi2026!');
  assert(!!validAdmin, 'Admin authenticated with valid credentials');
  
  const invalidAdmin = db.verifyAdminCredentials('admin@nagalakshmihandlooms.com', 'wrongpassword');
  assert(invalidAdmin === null, 'Rejects invalid admin password');

  // Status transition to Shipped
  const updatedOrder = db.updateOrderStatus(orderResult.order!.id, 'Shipped');
  assert(updatedOrder?.orderStatus === 'Shipped', 'Updated order status to Shipped');

  // Cancellation and restocking test
  console.log('\n6. Testing Order Cancellation & Inventory Restock:');
  const cancelledOrder = db.updateOrderStatus(orderResult.order!.id, 'Cancelled');
  assert(cancelledOrder?.orderStatus === 'Cancelled', 'Updated order status to Cancelled');
  
  const restockedProduct = db.getProductByIdOrSlug(royalMayura!.id);
  const restockedVariant = restockedProduct!.variants.find(v => v.id === crimsonVariant!.id);
  assert(restockedVariant!.stock === initialStock, `Stock safely restored back to ${initialStock}`);

  console.log('\n🎉 ALL 15 AUTOMATED TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
