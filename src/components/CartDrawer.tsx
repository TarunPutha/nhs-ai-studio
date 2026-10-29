import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingDiff = freeShippingThreshold - subtotal;
  const isFreeShipping = freeShippingDiff <= 0;
  const deliveryFee = cart.length === 0 ? 0 : (isFreeShipping ? 0 : 150);
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponMessage(null);

    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);

    if (res.success) {
      setCouponMessage({ text: res.message, isError: false });
      setCouponInput('');
    } else {
      setCouponMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] shadow-2xl border-l border-[#E8DFC8] flex flex-col justify-between">
          {/* Header */}
          <div className="p-6 border-b border-[#E8DFC8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#6A1A24]" />
              <h2 className="font-serif text-xl font-bold text-[#2B1E16]">
                Your Saree Bag ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#7A6453] hover:text-[#2B1E16] rounded-full hover:bg-[#F3ECE2] transition-colors cursor-pointer"
              title="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="px-6 py-3 bg-[#F5ECE8] border-b border-[#E8DFC8]">
            <div className="flex items-center justify-between text-xs font-medium text-[#2B1E16] mb-1.5">
              <span>
                {isFreeShipping
                  ? '🎉 You unlocked Complimentary All-India Express Delivery!'
                  : `Add ₹${freeShippingDiff.toLocaleString('en-IN')} more for Complimentary Delivery`}
              </span>
              <span className="font-bold text-[#6A1A24]">
                {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#E8DFC8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#6A1A24] transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#8E7864]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#2B1E16]">Your Saree Bag is Empty</h3>
                <p className="text-xs text-[#7A6453] max-w-xs mx-auto">
                  Explore our authentic Kanchipuram, Dharmavaram, and Banarasi handwoven silk sarees.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6A1A24] text-white text-xs font-semibold rounded-lg hover:bg-[#52131B] transition-colors cursor-pointer"
                >
                  <span>Explore Masterpieces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-white rounded-xl border border-[#E8DFC8] shadow-sm"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg shrink-0 border border-[#E8DFC8]"
                    referrerPolicy="no-referrer"
                  />

                  {/* Item info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-serif text-sm font-semibold text-[#2B1E16] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#A39281] hover:text-[#A93226] p-1 cursor-pointer transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#7A6453] mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <span>{item.colorName}</span>
                      </div>

                      <div className="text-[10px] text-[#8E7864] font-mono mt-0.5">
                        SKU: {item.sku}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5EFEB]">
                      {/* Quantity control */}
                      <div className="flex items-center border border-[#D9CEC1] rounded bg-[#FAF8F5]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#4A3B32] hover:bg-[#F3ECE2] cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#2B1E16]">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.quantity >= item.stockAvailable}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#4A3B32] hover:bg-[#F3ECE2] disabled:opacity-40 cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <div className="font-serif text-sm font-bold text-[#2B1E16] tabular-nums">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Calculation */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E8DFC8] space-y-4">
              {/* Coupon Code Input */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-[#F5ECE8] border border-[#6A1A24]/30 rounded-lg text-xs">
                    <div className="flex items-center gap-2 text-[#6A1A24] font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code} applied (-₹{discountAmount.toLocaleString('en-IN')})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-[#A93226] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code (e.g. UTSAV10, SILK1000)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24] uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F3ECE2] text-[#2B1E16] border border-[#D9CEC1] text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isApplying ? 'Checking...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <div className={`text-[11px] ${couponMessage.isError ? 'text-[#A93226]' : 'text-[#145A32]'}`}>
                    {couponMessage.text}
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-[#5A483E] pt-2 border-t border-[#E8DFC8]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-[#2B1E16] tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-[#6A1A24]">
                    <span>Promotional Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold tabular-nums">
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>All-India Delivery</span>
                  <span className="font-semibold tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-[#145A32] font-bold">COMPLIMENTARY</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#E8DFC8] text-base">
                  <span className="font-serif font-bold text-[#2B1E16]">Total Amount</span>
                  <span className="font-serif text-xl font-bold text-[#6A1A24] tabular-nums">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-[#6A1A24] hover:bg-[#52131B] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="text-[11px] text-center text-[#8E7864] flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Silk Mark Authenticity Certified & Insured Transit</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
