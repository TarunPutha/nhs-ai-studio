import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Check, 
  Award, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star,
  Sparkles,
  ChevronRight,
  ZoomIn
} from 'lucide-react';
import type { Product, ProductVariant } from '../types/ecommerce';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  initialVariant?: ProductVariant;
  onClose: () => void;
  onNavigateToCheckout: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialVariant,
  onClose,
  onNavigateToCheckout
}) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'specifications' | 'reviews'>('details');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      const v = initialVariant || product.variants.find(item => item.isDefault) || product.variants[0];
      setSelectedVariant(v);
      setActiveImageIndex(0);
      setQuantity(1);
      setAddedSuccess(false);
    }
  }, [product, initialVariant]);

  // When selected variant changes, reset active image index to 0
  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setActiveImageIndex(0);
    setQuantity(1);
  };

  if (!product || !selectedVariant) return null;

  const isFavorited = isInWishlist(product.id);
  const currentPrice = selectedVariant.priceOverride ?? product.salePrice ?? product.basePrice;
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const currentStock = selectedVariant.stock;
  const isOutOfStock = currentStock <= 0;

  const currentImages = selectedVariant.images.length > 0
    ? selectedVariant.images
    : ['/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg'];

  const mainImage = currentImages[activeImageIndex] || currentImages[0];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedVariant, quantity);
    onClose();
    onNavigateToCheckout();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomCoords({ x, y });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-[#FAF8F5] rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#E8DFC8] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-[#FAF8F5]/80 hover:bg-[#FAF8F5] text-[#2B1E16] rounded-full border border-[#D9CEC1] transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-10">
          {/* Left Column: Image Gallery & Zoom */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Main Image with Hover Zoom */}
            <div
              className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#F5EFEB] border border-[#E8DFC8] cursor-crosshair group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={mainImage}
                alt={`${product.name} - ${selectedVariant.colorName}`}
                className="w-full h-full object-cover object-center transition-transform duration-200"
                style={{
                  transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  transform: isZoomed ? 'scale(1.8)' : 'scale(1)'
                }}
                referrerPolicy="no-referrer"
              />

              {/* Zoom hint badge */}
              <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md text-white px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Hover to zoom weave</span>
              </div>

              {/* Silk Mark Seal */}
              <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#E8DFC8] text-[11px] font-semibold tracking-wider text-[#6A1A24] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#C5A880]" />
                <span>Silk Mark India</span>
              </div>
            </div>

            {/* Thumbnail switcher */}
            {currentImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {currentImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-[#6A1A24] scale-95 shadow-md'
                        : 'border-[#E8DFC8] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`View ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Weaver Authenticity Box */}
            <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#E8DFC8] text-xs text-[#5A483E] space-y-1.5 mt-2">
              <div className="flex items-center gap-2 font-semibold text-[#2B1E16]">
                <Sparkles className="w-4 h-4 text-[#C5A880]" />
                <span>Master Weaver Note</span>
              </div>
              <p>
                Each saree is handwoven by our master weavers in {product.specifications.origin}. Subtle irregularities in weave are the hallmark of authentic handloom pit looms.
              </p>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-5">
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-[#8E7864] font-medium tracking-wider uppercase">
                <div className="flex items-center gap-2">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>Pure Handloom</span>
                </div>
                <div className="flex items-center gap-1 text-[#6A1A24] font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
                  <span>{product.rating}</span>
                  <span className="text-[#8E7864]">({product.reviewCount})</span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B1E16] leading-snug">
                  {product.name}
                </h2>
                <p className="text-sm text-[#7A6453] mt-1">
                  {product.tagline}
                </p>
              </div>

              {/* Price & SKU */}
              <div className="flex items-baseline justify-between py-2 border-y border-[#E8DFC8]">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-[#2B1E16] tabular-nums">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-[#9B8A78] line-through tabular-nums">
                      ₹{product.basePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-xs text-[#7A6453] font-medium">(Incl. all taxes)</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#8E7864] font-mono tracking-wider block">
                    SKU: {selectedVariant.sku}
                  </span>
                </div>
              </div>

              {/* Color Swatches Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2B1E16] uppercase tracking-wider">
                    Selected Color: <span className="text-[#6A1A24] font-bold">{selectedVariant.colorName}</span>
                  </span>
                  <span className="text-[#7A6453]">
                    {selectedVariant.stock > 0 ? (
                      <span className="text-[#145A32] font-medium">
                        {selectedVariant.stock <= 4 ? `Only ${selectedVariant.stock} left in loom` : 'In Stock'}
                      </span>
                    ) : (
                      <span className="text-[#A93226] font-medium">Sold Out</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  {product.variants.map((v) => {
                    const isSelected = v.id === selectedVariant.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleVariantSelect(v)}
                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#6A1A24] bg-[#F5ECE8] text-[#6A1A24] font-semibold ring-1 ring-[#6A1A24]'
                            : 'border-[#D9CEC1] bg-white text-[#4A3B32] hover:border-[#8E7864]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span>{v.colorName}</span>
                        {v.priceOverride && (
                          <span className="text-[10px] text-[#8E7864] tabular-nums">
                            (₹{v.priceOverride.toLocaleString('en-IN')})
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Wishlist */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-[#D9CEC1] rounded-lg bg-white">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 text-[#4A3B32] hover:bg-[#F5EFEB] disabled:opacity-40 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold text-[#2B1E16] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= currentStock || isOutOfStock}
                    onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                    className="px-3 py-2 text-[#4A3B32] hover:bg-[#F5EFEB] disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-xs font-semibold tracking-wider uppercase transition-colors cursor-pointer ${
                    isFavorited
                      ? 'border-[#6A1A24] bg-[#F5ECE8] text-[#6A1A24]'
                      : 'border-[#D9CEC1] hover:border-[#8E7864] text-[#4A3B32] bg-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                  <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>
              </div>

              {/* Action Buttons: Add to Cart & Buy Now */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-6 rounded-lg text-sm font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                    isOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : addedSuccess
                      ? 'bg-[#145A32] text-white'
                      : 'bg-[#6A1A24] hover:bg-[#52131B] text-white hover:shadow-md'
                  }`}
                >
                  {isOutOfStock ? (
                    <span>Loom Stock Exhausted</span>
                  ) : addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Saree Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-lg text-sm font-semibold tracking-wider uppercase bg-[#C5A880] hover:bg-[#B39366] text-[#2B1E16] transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              {/* Reassurance Badges */}
              <div className="pt-3 border-t border-[#E8DFC8] grid grid-cols-2 gap-3 text-xs text-[#5A483E]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#6A1A24]" />
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#6A1A24]" />
                  <span>100% Handloom Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#6A1A24]" />
                  <span>7-Day Return Assistance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#6A1A24]" />
                  <span>Silk Mark Label Included</span>
                </div>
              </div>
            </div>

            {/* Product Details & Specifications Tabs */}
            <div className="mt-6 pt-5 border-t border-[#E8DFC8]">
              <div className="flex items-center gap-6 border-b border-[#E8DFC8] pb-2 text-xs font-semibold uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'details'
                      ? 'border-[#6A1A24] text-[#6A1A24]'
                      : 'border-transparent text-[#7A6453] hover:text-[#2B1E16]'
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('specifications')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'specifications'
                      ? 'border-[#6A1A24] text-[#6A1A24]'
                      : 'border-transparent text-[#7A6453] hover:text-[#2B1E16]'
                  }`}
                >
                  Weaving Specs
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'reviews'
                      ? 'border-[#6A1A24] text-[#6A1A24]'
                      : 'border-transparent text-[#7A6453] hover:text-[#2B1E16]'
                  }`}
                >
                  Reviews ({product.reviewCount})
                </button>
              </div>

              <div className="py-3 text-xs text-[#5A483E] leading-relaxed">
                {activeTab === 'details' && (
                  <p>{product.description}</p>
                )}

                {activeTab === 'specifications' && (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <dt className="text-[#8E7864] font-medium">Dimensions & Blouse:</dt>
                      <dd className="font-semibold text-[#2B1E16]">{product.specifications.dimensions}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8E7864] font-medium">Fabric & Yarn:</dt>
                      <dd className="font-semibold text-[#2B1E16]">{product.specifications.material}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8E7864] font-medium">Zari Composition:</dt>
                      <dd className="font-semibold text-[#2B1E16]">{product.specifications.hardware}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8E7864] font-medium">Weaving Atelier:</dt>
                      <dd className="font-semibold text-[#2B1E16]">{product.specifications.origin}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8E7864] font-medium">Approximate Weight:</dt>
                      <dd className="font-semibold text-[#2B1E16]">{product.specifications.weight}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8E7864] font-medium">Care Recommendation:</dt>
                      <dd className="font-semibold text-[#2B1E16]">{product.specifications.careGuide}</dd>
                    </div>
                  </dl>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="flex text-[#C5A880]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="font-bold text-[#2B1E16]">{product.rating} out of 5</span>
                      <span className="text-[#8E7864]">· 100% Verified Handloom Buyers</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#E8DFC8]">
                      <div className="flex items-center justify-between font-semibold text-[#2B1E16]">
                        <span>Gayathri Ramaswamy (Chennai)</span>
                        <span className="text-[10px] text-[#8E7864]">Feb 2026</span>
                      </div>
                      <p className="mt-1 text-[#5A483E]">
                        "The zari luster and pure mulberry silk hand-feel are completely unmatched. The Korvai border is immaculate. Wore it for my daughter’s engagement and received endless compliments."
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
