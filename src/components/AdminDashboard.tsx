import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  LogOut, 
  ChevronRight,
  Layers,
  Tag,
  DollarSign,
  Eye,
  X
} from 'lucide-react';
import type { 
  Product, 
  ProductVariant, 
  Order, 
  Coupon, 
  AdminStats, 
  OrderStatus, 
  PaymentStatus, 
  ProductCategory 
} from '../types/ecommerce';

interface AdminDashboardProps {
  onReturnToStore: () => void;
}

const CATEGORIES: ProductCategory[] = [
  'Kanchipuram Silk',
  'Dharmavaram Pattu',
  'Banarasi Katan',
  'Pochampally Ikkat',
  'Gadwal Silk',
  'Bridal Collection'
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onReturnToStore }) => {
  // Auth state
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('nls_admin_token'));
  const [adminEmail, setAdminEmail] = useState('admin@nagalakshmihandlooms.com');
  const [adminPassword, setAdminPassword] = useState('nagalakshmi2026!');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tabs: 'overview' | 'products' | 'orders' | 'inventory' | 'coupons'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'inventory' | 'coupons'>('overview');

  // Data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
      } else {
        setAdminToken(data.token);
        localStorage.setItem('nls_admin_token', data.token);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Server connection failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (adminToken) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }
    setAdminToken(null);
    localStorage.removeItem('nls_admin_token');
  };

  // Fetch dashboard data
  const loadDashboardData = async () => {
    if (!adminToken) return;
    setLoading(true);

    try {
      const headers = { Authorization: `Bearer ${adminToken}` };

      const [statsRes, productsRes, ordersRes, couponsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/admin/products', { headers }),
        fetch(`/api/admin/orders?status=${orderStatusFilter}&search=${encodeURIComponent(orderSearch)}`, { headers }),
        fetch('/api/admin/coupons', { headers })
      ]);

      if (statsRes.status === 401 || productsRes.status === 401) {
        handleLogout();
        return;
      }

      const [statsData, prodData, ordData, cpnData] = await Promise.all([
        statsRes.json(),
        productsRes.json(),
        ordersRes.json(),
        couponsRes.json()
      ]);

      setStats(statsData.stats);
      setProducts(prodData.products || []);
      setOrders(ordData.orders || []);
      setCoupons(cpnData.coupons || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) {
      loadDashboardData();
    }
  }, [adminToken, orderStatusFilter, orderSearch]);

  const showNotification = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`Order status updated to ${newStatus}`);
        loadDashboardData();
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(data.order);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Payment status update
  const handleUpdatePaymentStatus = async (orderId: string, newStatus: PaymentStatus) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`Payment status updated to ${newStatus}`);
        loadDashboardData();
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails(data.order);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick inline stock edit
  const handleStockUpdate = async (variantId: string, newStock: number) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/inventory/${variantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        showNotification('Inventory stock updated');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the active collection?`)) return;
    if (!adminToken) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        showNotification('Saree deleted successfully');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    if (!window.confirm('Reset catalog and orders to original Nagalakshmi Handloom Sarees seed state?')) return;
    if (!adminToken) return;

    try {
      const res = await fetch('/api/admin/reset-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        showNotification('Store demo reset to pristine seed state');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle coupon
  const handleToggleCoupon = async (code: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        showNotification('Coupon status toggled');
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // If not logged in, render the login card
  if (!adminToken) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E8DFC8] p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#F5ECE8] text-[#6A1A24] rounded-xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#2B1E16]">
              Nagalakshmi Store Portal
            </h1>
            <p className="text-xs text-[#7A6453]">
              Authorized Master Weaver & Order Administration
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-[#FADBD8] border border-[#E74C3C]/40 rounded-lg text-xs text-[#922B21]">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#5A483E] font-medium mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
              />
            </div>

            <div>
              <label className="block text-[#5A483E] font-medium mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
              />
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8DFC8] text-[11px] text-[#7A6453]">
              <strong>Default Demo Credentials:</strong><br />
              Email: <code className="text-[#6A1A24]">admin@nagalakshmihandlooms.com</code><br />
              Password: <code className="text-[#6A1A24]">nagalakshmi2026!</code>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-[#6A1A24] hover:bg-[#52131B] text-white font-semibold uppercase tracking-wider rounded-lg shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              {isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Admin'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={onReturnToStore}
              className="text-xs text-[#6A1A24] hover:underline cursor-pointer"
            >
              ← Back to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast notification */}
      {feedbackMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2B1E16] text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-[#C5A880]" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DFC8]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#8E7864] uppercase tracking-wider">
            <span>Nagalakshmi Handloom Sarees</span>
            <span>·</span>
            <span className="text-[#6A1A24] font-semibold">Store Management Console</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16]">
            Administrative Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2 border border-[#D9CEC1] rounded-lg text-[#4A3B32] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onReturnToStore}
            className="px-4 py-2 border border-[#8E7864] text-[#2B1E16] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#F3ECE2] transition-colors cursor-pointer"
          >
            View Storefront
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#FADBD8] text-[#922B21] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#F5B7B1] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Subnav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E8DFC8]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#6A1A24] text-white shadow-sm'
              : 'text-[#4A3B32] hover:bg-[#F3ECE2]'
          }`}
        >
          Overview & Metrics
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'bg-[#6A1A24] text-white shadow-sm'
              : 'text-[#4A3B32] hover:bg-[#F3ECE2]'
          }`}
        >
          Saree Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#6A1A24] text-white shadow-sm'
              : 'text-[#4A3B32] hover:bg-[#F3ECE2]'
          }`}
        >
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'inventory'
              ? 'bg-[#6A1A24] text-white shadow-sm'
              : 'text-[#4A3B32] hover:bg-[#F3ECE2]'
          }`}
        >
          Live Inventory
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-[#6A1A24] text-white shadow-sm'
              : 'text-[#4A3B32] hover:bg-[#F3ECE2]'
          }`}
        >
          Coupons ({coupons.length})
        </button>
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6 animate-in fade-in">
          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E8DFC8] shadow-sm">
              <div className="flex items-center justify-between text-[#8E7864] text-xs">
                <span>Total Revenue</span>
                <DollarSign className="w-4 h-4 text-[#145A32]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#2B1E16] tabular-nums mt-2">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-[#145A32] font-medium">Real DB transactions</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8DFC8] shadow-sm">
              <div className="flex items-center justify-between text-[#8E7864] text-xs">
                <span>Total Orders</span>
                <ShoppingBag className="w-4 h-4 text-[#6A1A24]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#2B1E16] tabular-nums mt-2">
                {stats.totalOrders}
              </div>
              <span className="text-[11px] text-[#7A6453]">Lifetime orders placed</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8DFC8] shadow-sm">
              <div className="flex items-center justify-between text-[#8E7864] text-xs">
                <span>Pending Orders</span>
                <Package className="w-4 h-4 text-[#B7791F]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#B7791F] tabular-nums mt-2">
                {stats.pendingOrders}
              </div>
              <span className="text-[11px] text-[#7A6453]">Requires artisan dispatch</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8DFC8] shadow-sm">
              <div className="flex items-center justify-between text-[#8E7864] text-xs">
                <span>Low Loom Stock</span>
                <AlertTriangle className="w-4 h-4 text-[#A93226]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#A93226] tabular-nums mt-2">
                {stats.lowStockCount}
              </div>
              <span className="text-[11px] text-[#A93226]">Variants with ≤5 left</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8DFC8] shadow-sm">
              <div className="flex items-center justify-between text-[#8E7864] text-xs">
                <span>Saree Designs</span>
                <Layers className="w-4 h-4 text-[#2B1E16]" />
              </div>
              <div className="font-serif text-2xl font-bold text-[#2B1E16] tabular-nums mt-2">
                {stats.totalProducts}
              </div>
              <span className="text-[11px] text-[#7A6453]">Active master weaves</span>
            </div>
          </div>

          {/* Revenue in Past 7 Days & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-[#E8DFC8] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-[#2B1E16]">Daily Sales Trend (Past 7 Days)</h3>
                <TrendingUp className="w-4 h-4 text-[#145A32]" />
              </div>
              <div className="h-44 flex items-end gap-3 pt-6 border-b border-[#E8DFC8]">
                {stats.revenueByDay.map((d, idx) => {
                  const maxAmt = Math.max(...stats.revenueByDay.map(x => x.amount), 50000);
                  const heightPercent = Math.max(12, Math.round((d.amount / maxAmt) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="text-[10px] font-mono text-[#6A1A24] font-bold tabular-nums">
                        {d.amount > 0 ? `₹${Math.round(d.amount / 1000)}k` : '0'}
                      </div>
                      <div
                        className="w-full bg-[#6A1A24] hover:bg-[#52131B] rounded-t transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[10px] text-[#7A6453] mt-1 whitespace-nowrap">
                        {d.date.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#E8DFC8] shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2B1E16]">Administrative Controls</h3>
                <p className="text-xs text-[#7A6453] mt-1">
                  Manage inventory, test checkout transactions, or reset demo database.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setIsCreatingProduct(true)}
                  className="w-full py-2.5 px-4 bg-[#6A1A24] hover:bg-[#52131B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Saree Weave</span>
                </button>

                <button
                  onClick={handleResetDemo}
                  className="w-full py-2.5 px-4 bg-[#FAF8F5] hover:bg-[#F3ECE2] text-[#6A1A24] border border-[#6A1A24] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset Demo Handloom Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-[#2B1E16]">Recent Saree Orders</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-[#6A1A24] font-semibold hover:underline cursor-pointer"
              >
                View All Orders →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#8E7864] uppercase tracking-wider border-y border-[#E8DFC8]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Order #</th>
                    <th className="py-2.5 px-3 font-semibold">Customer</th>
                    <th className="py-2.5 px-3 font-semibold">Items</th>
                    <th className="py-2.5 px-3 font-semibold">Total</th>
                    <th className="py-2.5 px-3 font-semibold">Payment</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-mono font-bold text-[#6A1A24]">{ord.orderNumber}</td>
                      <td className="py-3 px-3 font-medium text-[#2B1E16]">{ord.customerName}</td>
                      <td className="py-3 px-3 text-[#5A483E]">{ord.items.length} Saree(s)</td>
                      <td className="py-3 px-3 font-serif font-bold text-[#2B1E16] tabular-nums">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ord.paymentStatus === 'Paid' ? 'bg-[#EAF2EC] text-[#145A32]' : 'bg-[#FEF5E7] text-[#B7791F]'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-[#F5ECE8] text-[#6A1A24] text-[10px] font-semibold">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="text-[#6A1A24] hover:underline cursor-pointer font-semibold"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8E7864]" />
              <input
                type="text"
                placeholder="Search products by title, category, or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-white text-xs"
              />
            </div>

            <button
              onClick={() => setIsCreatingProduct(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#6A1A24] hover:bg-[#52131B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Saree Weave</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-[#E8DFC8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#8E7864] uppercase tracking-wider border-b border-[#E8DFC8]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Image</th>
                    <th className="py-3 px-4 font-semibold">Product Name</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 font-semibold">Price</th>
                    <th className="py-3 px-4 font-semibold">Colors & Stock</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]">
                  {products
                    .filter(p => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.category.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((p) => {
                      const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                      const thumb = p.variants[0]?.images[0] || '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg';

                      return (
                        <tr key={p.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-3 px-4">
                            <img
                              src={thumb}
                              alt={p.name}
                              className="w-12 h-14 object-cover rounded border border-[#E8DFC8]"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-serif font-bold text-sm text-[#2B1E16]">{p.name}</div>
                            <div className="text-[10px] text-[#8E7864] font-mono">Base SKU: {p.baseSku}</div>
                          </td>
                          <td className="py-3 px-4 text-[#4A3B32]">{p.category}</td>
                          <td className="py-3 px-4 font-serif font-bold text-[#2B1E16] tabular-nums">
                            ₹{(p.salePrice ?? p.basePrice).toLocaleString('en-IN')}
                            {p.salePrice && (
                              <span className="block text-[10px] text-[#9B8A78] line-through">
                                ₹{p.basePrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 mb-1">
                              {p.variants.map((v) => (
                                <span
                                  key={v.id}
                                  className="w-3.5 h-3.5 rounded-full border border-black/15"
                                  style={{ backgroundColor: v.colorHex }}
                                  title={`${v.colorName}: ${v.stock} in stock`}
                                />
                              ))}
                            </div>
                            <span className={`text-[11px] font-semibold ${totalStock <= 5 ? 'text-[#A93226]' : 'text-[#145A32]'}`}>
                              Total {totalStock} units
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.isActive ? 'bg-[#EAF2EC] text-[#145A32]' : 'bg-gray-100 text-gray-500'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 text-[#4A3B32] hover:text-[#6A1A24] cursor-pointer"
                              title="Edit product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-[#A39281] hover:text-[#A93226] cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8E7864]" />
              <input
                type="text"
                placeholder="Search by order #, customer, email, or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-white text-xs"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#7A6453]">Status Filter:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[#D9CEC1] rounded-lg bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#E8DFC8] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#8E7864] uppercase tracking-wider border-b border-[#E8DFC8]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Order #</th>
                    <th className="py-3 px-4 font-semibold">Date</th>
                    <th className="py-3 px-4 font-semibold">Customer Details</th>
                    <th className="py-3 px-4 font-semibold">Items</th>
                    <th className="py-3 px-4 font-semibold">Total Amount</th>
                    <th className="py-3 px-4 font-semibold">Payment</th>
                    <th className="py-3 px-4 font-semibold">Fulfillment Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFC8]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-mono font-bold text-[#6A1A24]">{ord.orderNumber}</td>
                      <td className="py-3 px-4 text-[#7A6453]">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2B1E16]">{ord.customerName}</div>
                        <div className="text-[11px] text-[#7A6453]">{ord.customerEmail}</div>
                        <div className="text-[10px] text-[#8E7864]">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.colorHex }} />
                              <span className="line-clamp-1">{it.name} (x{it.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-serif font-bold text-[#2B1E16] tabular-nums">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.paymentStatus}
                          onChange={(e) => handleUpdatePaymentStatus(ord.id, e.target.value as PaymentStatus)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                            ord.paymentStatus === 'Paid' ? 'border-[#145A32] bg-[#EAF2EC] text-[#145A32]' : 'border-[#B7791F] bg-[#FEF5E7] text-[#B7791F]'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 rounded text-[11px] font-semibold border border-[#D9CEC1] bg-white text-[#2B1E16]"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled (Restock)</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="p-1.5 text-[#6A1A24] hover:bg-[#F3ECE2] rounded cursor-pointer"
                          title="View order details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVENTORY MANAGEMENT TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2B1E16]">Real-time Loom Inventory Tracker</h2>
              <p className="text-xs text-[#7A6453]">Directly update stock counts for each handloom color variation.</p>
            </div>
            <div className="text-xs text-[#A93226] font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Low-stock alert active for ≤ 5 units</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF8F5] text-[#8E7864] uppercase tracking-wider border-y border-[#E8DFC8]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Saree Name</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Color Weave</th>
                  <th className="py-2.5 px-3 font-semibold">SKU</th>
                  <th className="py-2.5 px-3 font-semibold">Price Override</th>
                  <th className="py-2.5 px-3 font-semibold">Current Stock</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Quick Edit Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFC8]">
                {products.flatMap((prod) =>
                  prod.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-serif font-bold text-[#2B1E16]">{prod.name}</td>
                      <td className="py-3 px-3 text-[#7A6453]">{prod.category}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/15" style={{ backgroundColor: v.colorHex }} />
                          <span>{v.colorName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[#8E7864]">{v.sku}</td>
                      <td className="py-3 px-3 font-serif tabular-nums">
                        {v.priceOverride ? `₹${v.priceOverride.toLocaleString('en-IN')}` : 'Base Price'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold tabular-nums ${
                          v.stock <= 5 ? 'bg-[#FADBD8] text-[#922B21]' : 'bg-[#EAF2EC] text-[#145A32]'
                        }`}>
                          {v.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleStockUpdate(v.id, v.stock - 1)}
                            disabled={v.stock <= 0}
                            className="px-2 py-1 bg-white border border-[#D9CEC1] rounded hover:bg-[#F3ECE2] disabled:opacity-40 cursor-pointer"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={v.stock}
                            onChange={(e) => handleStockUpdate(v.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-[#D9CEC1] rounded text-center font-bold font-mono"
                          />
                          <button
                            onClick={() => handleStockUpdate(v.id, v.stock + 1)}
                            className="px-2 py-1 bg-white border border-[#D9CEC1] rounded hover:bg-[#F3ECE2] cursor-pointer"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2B1E16]">Promotional Coupon Codes</h2>
              <p className="text-xs text-[#7A6453]">Active promo vouchers accepted at customer checkout.</p>
            </div>
          </div>

          <div className="divide-y divide-[#E8DFC8] border-y border-[#E8DFC8]">
            {coupons.map((cpn) => (
              <div key={cpn.code} className="py-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#6A1A24] bg-[#F5ECE8] px-2.5 py-0.5 rounded border border-[#6A1A24]/20">
                      {cpn.code}
                    </span>
                    <span className="font-semibold text-[#2B1E16]">
                      {cpn.discountType === 'percentage' ? `${cpn.value}% Off` : `₹${cpn.value} Off`}
                    </span>
                    <span className="text-[#8E7864]">· Min Spend: ₹{cpn.minSpend.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-[#5A483E] mt-1">{cpn.description}</p>
                </div>

                <button
                  onClick={() => handleToggleCoupon(cpn.code)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                    cpn.isActive
                      ? 'bg-[#EAF2EC] text-[#145A32] hover:bg-[#D4EFDF]'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cpn.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Enable)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E8DFC8] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
              <div>
                <span className="text-xs text-[#8E7864] uppercase tracking-wider">Order Audit</span>
                <h3 className="font-mono text-xl font-bold text-[#6A1A24]">{selectedOrderDetails.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-[#8E7864] hover:text-[#2B1E16] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8DFC8]">
                <span className="text-[#8E7864] block font-semibold mb-1">Customer & Destination</span>
                <p className="font-bold text-[#2B1E16]">{selectedOrderDetails.customerName}</p>
                <p className="text-[#5A483E]">{selectedOrderDetails.customerEmail}</p>
                <p className="text-[#5A483E]">{selectedOrderDetails.customerPhone}</p>
                <p className="text-[#5A483E] mt-1">
                  {selectedOrderDetails.shippingAddress.addressLine1}, {selectedOrderDetails.shippingAddress.city}, {selectedOrderDetails.shippingAddress.state} - {selectedOrderDetails.shippingAddress.postalCode}
                </p>
              </div>

              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8DFC8]">
                <span className="text-[#8E7864] block font-semibold mb-1">Fulfillment & Payment</span>
                <div className="space-y-1 text-[#5A483E]">
                  <div>Payment Method: <strong className="text-[#2B1E16] uppercase">{selectedOrderDetails.paymentMethod}</strong></div>
                  <div>Payment Status: <strong className="text-[#145A32]">{selectedOrderDetails.paymentStatus}</strong></div>
                  <div>Order Status: <strong className="text-[#6A1A24]">{selectedOrderDetails.orderStatus}</strong></div>
                  <div>Delivery: <strong>{selectedOrderDetails.deliveryMethod}</strong></div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 text-xs">
              <h4 className="font-serif font-bold text-[#2B1E16]">Handloom Sarees Snapshot</h4>
              <div className="divide-y divide-[#E8DFC8] border-y border-[#E8DFC8]">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={it.image} alt={it.name} className="w-10 h-12 object-cover rounded border" />
                      <div>
                        <div className="font-bold text-[#2B1E16]">{it.name}</div>
                        <div className="text-[11px] text-[#7A6453]">{it.colorName} · SKU: {it.sku} · Qty: {it.quantity}</div>
                      </div>
                    </div>
                    <div className="font-serif font-bold text-[#2B1E16] tabular-nums">
                      ₹{it.subtotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-[#E8DFC8]">
              <span className="font-bold text-[#2B1E16] text-sm">Total Invoice Amount:</span>
              <span className="font-serif text-xl font-bold text-[#6A1A24] tabular-nums">
                ₹{selectedOrderDetails.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Saree Modal */}
      {(isCreatingProduct || editingProduct) && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => {
            setEditingProduct(null);
            setIsCreatingProduct(false);
          }}
          onSave={async (prodData) => {
            try {
              const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`
              };

              if (editingProduct) {
                await fetch(`/api/admin/products/${editingProduct.id}`, {
                  method: 'PUT',
                  headers,
                  body: JSON.stringify(prodData)
                });
                showNotification('Saree details updated successfully');
              } else {
                await fetch('/api/admin/products', {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(prodData)
                });
                showNotification('New handloom saree added to collection');
              }
              setEditingProduct(null);
              setIsCreatingProduct(false);
              loadDashboardData();
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}
    </div>
  );
};

// Sub-component: Product Edit / Create Modal
const ProductEditModal: React.FC<{
  product: Product | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}> = ({ product, onClose, onSave }) => {
  const [name, setName] = useState(product?.name || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [category, setCategory] = useState<ProductCategory>(product?.category || 'Kanchipuram Silk');
  const [tagline, setTagline] = useState(product?.tagline || '');
  const [description, setDescription] = useState(product?.description || '');
  const [basePrice, setBasePrice] = useState(product?.basePrice || 18000);
  const [salePrice, setSalePrice] = useState<number | string>(product?.salePrice || '');
  const [baseSku, setBaseSku] = useState(product?.baseSku || 'NLS-NEW-01');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? true);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  // Specifications
  const [dimensions, setDimensions] = useState(product?.specifications.dimensions || 'Length: 6.3 meters with contrast blouse piece, Width: 1.16 meters');
  const [material, setMaterial] = useState(product?.specifications.material || '100% Pure Mulberry Silk');
  const [hardware, setHardware] = useState(product?.specifications.hardware || 'Authentic 2-Ply Gold Zari');
  const [origin, setOrigin] = useState(product?.specifications.origin || 'Kanchipuram, Tamil Nadu');

  // Variants
  const [variants, setVariants] = useState<ProductVariant[]>(
    product?.variants || [
      {
        id: `var-${Date.now()}`,
        productId: product?.id || 'temp',
        colorName: 'Royal Crimson & Gold',
        colorHex: '#8E1624',
        sku: 'NLS-CRM-01',
        priceOverride: null,
        stock: 5,
        isDefault: true,
        images: ['/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg']
      }
    ]
  );

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      tagline,
      description,
      basePrice: Number(basePrice),
      salePrice: salePrice ? Number(salePrice) : null,
      baseSku,
      isFeatured,
      isActive,
      rating: product?.rating || 4.9,
      reviewCount: product?.reviewCount || 1,
      specifications: {
        dimensions,
        strapDrop: 'Silk Mark India Certified',
        material,
        hardware,
        lining: 'Unstitched matching silk blouse piece included',
        weight: '800 grams',
        origin,
        careGuide: 'Dry clean only. Wrap in soft unbleached cotton.'
      },
      variants
    };

    await onSave(payload);
    setSaving(false);
  };

  const handleAddVariant = () => {
    const newV: ProductVariant = {
      id: `var-${Date.now()}`,
      productId: product?.id || 'temp',
      colorName: 'Emerald Green',
      colorHex: '#145A32',
      sku: `${baseSku}-EMR`,
      priceOverride: null,
      stock: 4,
      isDefault: false,
      images: ['/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg']
    };
    setVariants([...variants, newV]);
  };

  const handleUpdateVariant = (index: number, updates: Partial<ProductVariant>) => {
    const copy = [...variants];
    copy[index] = { ...copy[index], ...updates };
    setVariants(copy);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) return alert('At least 1 color variant is required.');
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8DFC8]">
          <h2 className="font-serif text-xl font-bold text-[#2B1E16]">
            {product ? 'Edit Saree Design' : 'Add New Handloom Saree'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#8E7864] hover:text-[#2B1E16] cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#5A483E] font-medium mb-1">Saree Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Royal Mayura Kanchipuram Silk"
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5]"
              />
            </div>

            <div>
              <label className="block text-[#5A483E] font-medium mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5]"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#5A483E] font-medium mb-1">Base Price (₹) *</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] font-mono"
              />
            </div>

            <div>
              <label className="block text-[#5A483E] font-medium mb-1">Sale Price (₹ Optional)</label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="Discounted price"
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#5A483E] font-medium mb-1">Short Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Pure mulberry silk handwoven with authentic 2-ply gold zari"
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#5A483E] font-medium mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed weaving heritage, motifs, and drape description..."
                className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] space-y-3">
            <h4 className="font-serif font-bold text-[#2B1E16]">Handloom Specifications</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5A483E] mb-1">Fabric & Yarn</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D9CEC1] rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[#5A483E] mb-1">Zari Composition</label>
                <input
                  type="text"
                  value={hardware}
                  onChange={(e) => setHardware(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D9CEC1] rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[#5A483E] mb-1">Weaving Atelier Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D9CEC1] rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-[#5A483E] mb-1">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D9CEC1] rounded bg-white"
                />
              </div>
            </div>
          </div>

          {/* Color Variations Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-[#2B1E16]">Color Variations & Loom Stock</h4>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 text-xs text-[#6A1A24] font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Color Variation</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={v.id} className="p-3 bg-white rounded-xl border border-[#E8DFC8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#6A1A24]">Color #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-[#A93226] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div>
                      <label className="block text-[#7A6453] text-[10px]">Color Name</label>
                      <input
                        type="text"
                        value={v.colorName}
                        onChange={(e) => handleUpdateVariant(idx, { colorName: e.target.value })}
                        className="w-full px-2 py-1 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-[#7A6453] text-[10px]">Color Hex</label>
                      <input
                        type="color"
                        value={v.colorHex}
                        onChange={(e) => handleUpdateVariant(idx, { colorHex: e.target.value })}
                        className="w-full h-7 px-1 py-0.5 border rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[#7A6453] text-[10px]">Variant SKU</label>
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleUpdateVariant(idx, { sku: e.target.value })}
                        className="w-full px-2 py-1 border rounded font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[#7A6453] text-[10px]">Stock Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariant(idx, { stock: Number(e.target.value) })}
                        className="w-full px-2 py-1 border rounded font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[#7A6453] text-[10px]">Price Override</label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={v.priceOverride || ''}
                        onChange={(e) => handleUpdateVariant(idx, { priceOverride: e.target.value ? Number(e.target.value) : null })}
                        className="w-full px-2 py-1 border rounded font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#7A6453] text-[10px]">Image URL</label>
                    <input
                      type="text"
                      value={v.images[0] || ''}
                      onChange={(e) => handleUpdateVariant(idx, { images: [e.target.value] })}
                      className="w-full px-2 py-1 border rounded font-mono text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8DFC8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D9CEC1] text-xs font-semibold rounded-lg hover:bg-[#FAF8F5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#6A1A24] hover:bg-[#52131B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Saree'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
