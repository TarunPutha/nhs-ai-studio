import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Banknote, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  Search,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Order } from '../types/ecommerce';

interface CheckoutViewProps {
  onBackToShop: () => void;
  onTrackOrder: (orderNumber: string, email: string) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi NCR'
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onBackToShop, onTrackOrder }) => {
  const { cart, subtotal, appliedCoupon, discountAmount, clearCart, freeShippingThreshold } = useCart();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('card');
  const [notes, setNotes] = useState('');

  // Card details (Sandbox)
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('789');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Delivery calculation
  const deliveryFee = deliveryMethod === 'express' ? 250 : (subtotal >= freeShippingThreshold ? 0 : 150);
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!fullName.trim()) return setFormError('Please enter your full recipient name.');
    if (!email.trim() || !email.includes('@')) return setFormError('Please provide a valid email address.');
    if (!phone.trim() || phone.trim().length < 10) return setFormError('Please enter a valid 10-digit mobile number.');
    if (!addressLine1.trim()) return setFormError('Please provide flat/house number and street name.');
    if (!city.trim()) return setFormError('Please enter your city/town.');
    if (!postalCode.trim() || postalCode.trim().length < 6) return setFormError('Please enter a valid 6-digit postal PIN code.');

    if (cart.length === 0) {
      return setFormError('Your cart is empty. Please add items before checking out.');
    }

    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        return setFormError('Please enter a valid card number (or use the test sandbox card provided).');
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: phone.trim(),
        shippingAddress: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state,
          postalCode: postalCode.trim(),
          country: 'India'
        },
        deliveryMethod,
        items: cart.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod,
        cardDetails: paymentMethod === 'card' ? {
          cardNumber,
          expMonth: cardExp.split('/')[0] || '12',
          expYear: cardExp.split('/')[1] || '28',
          cvc: cardCvc
        } : undefined,
        notes: notes.trim() || undefined
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Failed to place order. Please review your details.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully
      setConfirmedOrder(data.order);
      clearCart();
    } catch (err: any) {
      setFormError(err.message || 'Network communication error during checkout.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order is confirmed, display the Confirmation Receipt screen
  if (confirmedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-[#E8DFC8] p-6 sm:p-10 shadow-xl space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-[#F5ECE8] text-[#145A32] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#6A1A24] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Weaving Guild Order Confirmed</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
              Thank You for Celebrating Pure Handlooms
            </h1>
            <p className="text-sm text-[#5A483E] max-w-md mx-auto">
              Your order <strong className="font-mono text-[#6A1A24]">{confirmedOrder.orderNumber}</strong> has been allocated to our master weavers and dispatch team.
            </p>
          </div>

          {/* Key Order Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-xs">
            <div>
              <span className="text-[#8E7864] block">Order Number</span>
              <span className="font-mono font-bold text-sm text-[#2B1E16]">{confirmedOrder.orderNumber}</span>
            </div>
            <div>
              <span className="text-[#8E7864] block">Date Placed</span>
              <span className="font-semibold text-[#2B1E16]">{new Date(confirmedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div>
              <span className="text-[#8E7864] block">Payment Method</span>
              <span className="font-semibold text-[#2B1E16] uppercase">{confirmedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment (Verified)'}</span>
            </div>
            <div>
              <span className="text-[#8E7864] block">Total Amount</span>
              <span className="font-serif font-bold text-sm text-[#6A1A24] tabular-nums">₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Items Purchased Snapshot */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-semibold text-[#2B1E16]">Handloom Sarees in this Order</h3>
            <div className="divide-y divide-[#E8DFC8] border-y border-[#E8DFC8]">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded border border-[#E8DFC8]"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-[#2B1E16]">{item.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#7A6453]">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.colorHex }} />
                        <span>{item.colorName}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px]">SKU: {item.sku}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#7A6453]">Qty: {item.quantity}</div>
                    <div className="font-serif text-sm font-bold text-[#2B1E16] tabular-nums">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-[#6A1A24] block mb-1">Dispatch Destination</span>
              <p className="font-semibold text-[#2B1E16]">{confirmedOrder.shippingAddress.fullName}</p>
              <p className="text-[#5A483E]">{confirmedOrder.shippingAddress.addressLine1}</p>
              {confirmedOrder.shippingAddress.addressLine2 && <p className="text-[#5A483E]">{confirmedOrder.shippingAddress.addressLine2}</p>}
              <p className="text-[#5A483E]">{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.postalCode}</p>
              <p className="text-[#5A483E] mt-1">Phone: {confirmedOrder.customerPhone}</p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-[#6A1A24] block mb-1">Authenticity & Delivery</span>
              <p className="text-[#5A483E]">
                Shipped via <strong className="text-[#2B1E16]">{confirmedOrder.deliveryMethod === 'express' ? 'VIP Express Air Courier' : 'Complimentary Insured Courier'}</strong> with Silk Mark certification seal intact.
              </p>
              <p className="text-[#5A483E] mt-2">
                Order confirmation and tracking updates have been dispatched to <strong className="text-[#2B1E16]">{confirmedOrder.customerEmail}</strong>.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E8DFC8]">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#D9CEC1] text-xs font-semibold uppercase tracking-wider text-[#4A3B32] rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onTrackOrder(confirmedOrder.orderNumber, confirmedOrder.customerEmail)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FAF8F5] hover:bg-[#F3ECE2] border border-[#6A1A24] text-[#6A1A24] text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Track Order Live</span>
              </button>

              <button
                onClick={onBackToShop}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#6A1A24] hover:bg-[#52131B] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active Checkout Form
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6A1A24] hover:text-[#2B1E16] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collection</span>
        </button>
        <span className="text-xs text-[#8E7864] font-medium tracking-wider uppercase">
          Step 2 of 2 · Secure Handloom Checkout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-7 space-y-8">
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {formError && (
              <div className="p-4 bg-[#FADBD8] border border-[#E74C3C]/40 rounded-xl flex items-center gap-3 text-xs text-[#922B21] animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* 1. Customer Contact */}
            <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2B1E16] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6A1A24] text-white text-xs flex items-center justify-center font-sans font-bold">1</span>
                <span>Contact & Recipient Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#5A483E] font-medium mb-1">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smt. Radhika Sundaram"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A483E] font-medium mb-1">Mobile Phone (for Delivery OTP) *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98401 22345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[#5A483E] font-medium mb-1">Email Address (for Invoice & Tracking) *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. radhika@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2B1E16] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6A1A24] text-white text-xs flex items-center justify-center font-sans font-bold">2</span>
                <span>Dispatch & Delivery Address</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#5A483E] font-medium mb-1">Flat / House No., Apartment / Building *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 3A, Temple View Residency"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                  />
                </div>

                <div>
                  <label className="block text-[#5A483E] font-medium mb-1">Street, Area, Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Varadaraja Perumal Temple, Gandhi Road"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[#5A483E] font-medium mb-1">City / Town *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kanchipuram / Chennai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A483E] font-medium mb-1">State *</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#5A483E] font-medium mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 631501"
                      maxLength={6}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A483E] font-medium mb-1">Special Delivery / Gift Wrap Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Auspicious muhurtham gift wrap with turmeric & kumkum packet"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[#D9CEC1] rounded-lg bg-[#FAF8F5] focus:outline-none focus:border-[#6A1A24]"
                  />
                </div>
              </div>
            </div>

            {/* 3. Delivery Method Selection */}
            <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2B1E16] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6A1A24] text-white text-xs flex items-center justify-center font-sans font-bold">3</span>
                <span>Delivery Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <label className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  deliveryMethod === 'standard'
                    ? 'border-[#6A1A24] bg-[#F5ECE8] ring-1 ring-[#6A1A24]'
                    : 'border-[#D9CEC1] hover:border-[#8E7864] bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#2B1E16] text-sm">Insured Standard Delivery</div>
                      <div className="text-[#7A6453] mt-0.5">3–5 Business Days (All-India)</div>
                    </div>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="accent-[#6A1A24] mt-1"
                    />
                  </div>
                  <div className="font-serif text-sm font-bold text-[#145A32] mt-3">
                    {subtotal >= freeShippingThreshold ? 'COMPLIMENTARY' : '₹150'}
                  </div>
                </label>

                <label className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  deliveryMethod === 'express'
                    ? 'border-[#6A1A24] bg-[#F5ECE8] ring-1 ring-[#6A1A24]'
                    : 'border-[#D9CEC1] hover:border-[#8E7864] bg-white'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#2B1E16] text-sm">VIP Express Air Courier</div>
                      <div className="text-[#7A6453] mt-0.5">1–2 Business Days (Priority Dispatch)</div>
                    </div>
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'express'}
                      onChange={() => setDeliveryMethod('express')}
                      className="accent-[#6A1A24] mt-1"
                    />
                  </div>
                  <div className="font-serif text-sm font-bold text-[#2B1E16] mt-3">
                    ₹250
                  </div>
                </label>
              </div>
            </div>

            {/* 4. Payment Gateway */}
            <div className="bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#2B1E16] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#6A1A24] text-white text-xs flex items-center justify-center font-sans font-bold">4</span>
                <span>Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'card'
                      ? 'border-[#6A1A24] bg-[#F5ECE8] ring-1 ring-[#6A1A24]'
                      : 'border-[#D9CEC1] bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#6A1A24]" />
                  <div>
                    <div className="font-bold text-[#2B1E16]">Online Payment Gateway</div>
                    <div className="text-[11px] text-[#7A6453]">Credit/Debit Cards, UPI, NetBanking</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-[#6A1A24] bg-[#F5ECE8] ring-1 ring-[#6A1A24]'
                      : 'border-[#D9CEC1] bg-white'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#145A32]" />
                  <div>
                    <div className="font-bold text-[#2B1E16]">Cash on Delivery (COD)</div>
                    <div className="text-[11px] text-[#7A6453]">Pay cash/UPI upon verified delivery</div>
                  </div>
                </button>
              </div>

              {/* Sandbox Card Inputs if Card chosen */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8DFC8] space-y-3 mt-3 text-xs">
                  <div className="flex items-center justify-between text-[#6A1A24] font-semibold text-[11px]">
                    <span>🔒 256-Bit SSL Encrypted Sandbox Gateway</span>
                    <span className="bg-[#FAF8F5] border border-[#6A1A24]/30 px-2 py-0.5 rounded text-[10px]">
                      Test Mode Active
                    </span>
                  </div>

                  <div>
                    <label className="block text-[#5A483E] font-medium mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#5A483E] font-medium mb-1">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="12/28"
                        className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[#5A483E] font-medium mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="789"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-[#D9CEC1] rounded-lg bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-3 bg-[#EAF2EC] rounded-lg border border-[#145A32]/20 text-xs text-[#145A32]">
                  ℹ️ Cash on Delivery requires OTP phone confirmation prior to artisan dispatch.
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isSubmitting || cart.length === 0}
              className="w-full py-4 bg-[#6A1A24] hover:bg-[#52131B] text-white text-sm font-semibold tracking-wider uppercase rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Confirming Order with Handloom Guild...</span>
              ) : (
                <>
                  <span>Place Order · ₹{totalAmount.toLocaleString('en-IN')}</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary Sticky Box */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white rounded-xl border border-[#E8DFC8] p-6 shadow-sm space-y-5">
            <h3 className="font-serif text-lg font-bold text-[#2B1E16] border-b border-[#E8DFC8] pb-3">
              Order Summary ({cart.length} {cart.length === 1 ? 'Saree' : 'Sarees'})
            </h3>

            {/* Item list */}
            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 object-cover rounded border border-[#E8DFC8] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <h4 className="font-serif font-semibold text-[#2B1E16] line-clamp-1">{item.name}</h4>
                    <div className="flex items-center gap-1.5 text-[#7A6453] mt-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.colorHex }} />
                      <span>{item.colorName}</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1">
                      <span className="text-[#8E7864]">Qty: {item.quantity}</span>
                      <span className="font-serif font-bold text-[#2B1E16] tabular-nums">
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-4 border-t border-[#E8DFC8] text-xs text-[#5A483E]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#2B1E16] tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-[#6A1A24]">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="font-semibold tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold tabular-nums">
                  {deliveryFee === 0 ? <span className="text-[#145A32] font-bold">COMPLIMENTARY</span> : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-[#E8DFC8] text-base">
                <span className="font-serif font-bold text-[#2B1E16]">Final Amount</span>
                <span className="font-serif text-2xl font-bold text-[#6A1A24] tabular-nums">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8DFC8] text-[11px] text-[#7A6453] space-y-1">
              <div className="font-semibold text-[#2B1E16]">Nagalakshmi Authenticity Promise:</div>
              <div>• Silk Mark India registered certificate included.</div>
              <div>• Tamper-proof insured transit packing.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
