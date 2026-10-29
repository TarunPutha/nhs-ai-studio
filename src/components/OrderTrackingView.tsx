import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, Home, AlertCircle, ArrowLeft } from 'lucide-react';
import type { Order, OrderStatus } from '../types/ecommerce';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  initialEmail?: string;
  onBackToShop: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: any }[] = [
  { key: 'Pending', label: 'Order Received', icon: Clock },
  { key: 'Confirmed', label: 'Confirmed by Guild', icon: CheckCircle2 },
  { key: 'Processing', label: 'Artisan Loom Packing', icon: Package },
  { key: 'Shipped', label: 'In Transit / Dispatched', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: Home },
];

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  initialEmail = '',
  onBackToShop
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTracking = async (num: string, mail: string) => {
    if (!num.trim() || !mail.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(num.trim())}&email=${encodeURIComponent(mail.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No matching order found');
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch (err: any) {
      setError(err.message || 'Tracking service unavailable');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialEmail) {
      fetchTracking(initialOrderNumber, initialEmail);
    }
  }, [initialOrderNumber, initialEmail]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderNumber, email);
  };

  const getStepStatus = (stepKey: OrderStatus) => {
    if (!order) return 'upcoming';
    if (order.orderStatus === 'Cancelled') return 'cancelled';

    const orderIndex = STATUS_STEPS.findIndex(s => s.key === order.orderStatus);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);

    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6A1A24] hover:text-[#2B1E16] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Sarees</span>
        </button>
        <span className="text-xs text-[#8E7864] font-medium tracking-wider uppercase">
          Live Artisan Dispatch Tracking
        </span>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
          Track Your Handloom Order
        </h1>
        <p className="text-sm text-[#7A6453] max-w-md mx-auto">
          Enter your unique Nagalakshmi order reference (e.g. <strong className="font-mono text-[#6A1A24]">NLS-2026-7814</strong>) and contact email to view real-time artisan dispatch status.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 shadow-sm">
        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-5 text-xs">
            <label className="block text-[#5A483E] font-medium mb-1">Order Number *</label>
            <input
              type="text"
              required
              placeholder="e.g. NLS-2026-7814"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] font-mono uppercase focus:outline-none focus:border-[#6A1A24]"
            />
          </div>

          <div className="sm:col-span-5 text-xs">
            <label className="block text-[#5A483E] font-medium mb-1">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. ananya.seshadri@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
            />
          </div>

          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#6A1A24] hover:bg-[#52131B] text-white text-xs font-semibold tracking-wider uppercase rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Locating...' : 'Track'}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-[#FADBD8] border border-[#E74C3C]/40 rounded-xl flex items-center gap-2.5 text-xs text-[#922B21]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Result View */}
      {order && (
        <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 sm:p-8 shadow-md space-y-8 animate-in fade-in">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8DFC8]">
            <div>
              <div className="text-xs text-[#8E7864] uppercase tracking-wider">Order Reference</div>
              <div className="font-mono text-xl font-bold text-[#6A1A24]">{order.orderNumber}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#7A6453]">Current Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                order.orderStatus === 'Delivered'
                  ? 'bg-[#EAF2EC] text-[#145A32]'
                  : order.orderStatus === 'Cancelled'
                  ? 'bg-[#FADBD8] text-[#922B21]'
                  : 'bg-[#F5ECE8] text-[#6A1A24]'
              }`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Stepper Timeline */}
          {order.orderStatus !== 'Cancelled' ? (
            <div className="py-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {STATUS_STEPS.map((step, idx) => {
                  const state = getStepStatus(step.key);
                  const Icon = step.icon;

                  return (
                    <div key={idx} className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        state === 'completed'
                          ? 'bg-[#145A32] border-[#145A32] text-white'
                          : state === 'current'
                          ? 'bg-[#6A1A24] border-[#6A1A24] text-white ring-4 ring-[#6A1A24]/20 animate-pulse'
                          : 'bg-[#FAF8F5] border-[#D9CEC1] text-[#A39281]'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-[#2B1E16]">{step.label}</div>
                      {state === 'completed' && (
                        <span className="text-[10px] text-[#145A32] font-medium">Completed</span>
                      )}
                      {state === 'current' && (
                        <span className="text-[10px] text-[#6A1A24] font-bold">Active Stage</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FADBD8] text-[#922B21] rounded-xl text-center text-xs">
              This order has been cancelled and its inventory restored to the loom collection.
            </div>
          )}

          {/* Order Details & Delivery Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-xs">
            <div>
              <div className="font-semibold text-[#6A1A24] uppercase tracking-wider mb-1">Recipient Destination</div>
              <p className="font-bold text-[#2B1E16]">{order.shippingAddress.fullName}</p>
              <p className="text-[#5A483E]">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p className="text-[#5A483E]">{order.shippingAddress.addressLine2}</p>}
              <p className="text-[#5A483E]">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
              <p className="text-[#5A483E] mt-1">Contact: {order.customerPhone}</p>
            </div>

            <div>
              <div className="font-semibold text-[#6A1A24] uppercase tracking-wider mb-1">Invoice Breakdown</div>
              <div className="space-y-1 text-[#5A483E]">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-[#2B1E16] tabular-nums">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-[#6A1A24]">
                    <span>Discount ({order.couponCode}):</span>
                    <span className="font-semibold tabular-nums">-₹{order.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-semibold tabular-nums">{order.deliveryFee === 0 ? 'Complimentary' : `₹${order.deliveryFee}`}</span>
                </div>
                <div className="flex justify-between border-t border-[#E8DFC8] pt-1 text-sm font-bold text-[#2B1E16]">
                  <span>Total Amount:</span>
                  <span className="text-[#6A1A24] tabular-nums">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Package items */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#2B1E16]">Items in Package</h3>
            <div className="divide-y divide-[#E8DFC8] border-y border-[#E8DFC8]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded border border-[#E8DFC8]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#2B1E16]">{item.name}</h4>
                      <div className="flex items-center gap-2 text-[#7A6453] mt-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.colorHex }} />
                        <span>{item.colorName}</span>
                        <span>·</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="font-serif text-sm font-bold text-[#2B1E16] tabular-nums">
                    ₹{item.subtotal.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
