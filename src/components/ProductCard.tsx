import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import type { Product, ProductVariant } from '../types/ecommerce';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product, initialVariant?: ProductVariant) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  // Find default or first variant
  const defaultVar = product.variants.find(v => v.isDefault) || product.variants[0];
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVar);
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedToast, setIsAddedToast] = useState(false);

  const isFavorited = isInWishlist(product.id);
  const currentPrice = selectedVariant.priceOverride ?? product.salePrice ?? product.basePrice;
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount 
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100) 
    : 0;

  // Active image: first image of selected variant
  const activeImage = selectedVariant.images[0] || '/src/assets/images/saree_kanchipuram_crimson_1793221388969.jpg';
  // Secondary image for hover effect if available
  const hoverImage = selectedVariant.images[1] || selectedVariant.images[0] || activeImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedVariant.stock <= 0) return;
    addToCart(product, selectedVariant, 1);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 1800);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onQuickView(product, selectedVariant)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col bg-white rounded-xl border border-[#E8DFC8] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >
      {/* Visual Image Container (65-75% height) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5EFEB]">
        <img
          src={isHovered && hoverImage !== activeImage ? hoverImage : activeImage}
          alt={`${product.name} in ${selectedVariant.colorName}`}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Discount Tag */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-[#6A1A24] text-white text-[11px] font-semibold tracking-wider px-2.5 py-1 rounded">
            {discountPercent}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isFavorited
              ? 'bg-[#6A1A24] text-white shadow-md'
              : 'bg-white/80 text-[#2B1E16] hover:bg-white hover:text-[#6A1A24]'
          }`}
          title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Quick View / Add to Cart Overlay on Hover */}
        <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleAddToCart}
            disabled={selectedVariant.stock <= 0}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedVariant.stock <= 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : isAddedToast
                ? 'bg-[#145A32] text-white'
                : 'bg-[#6A1A24] hover:bg-[#52131B] text-white'
            }`}
          >
            {selectedVariant.stock <= 0 ? (
              <span>Out of Loom Stock</span>
            ) : isAddedToast ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product, selectedVariant);
            }}
            className="p-2.5 bg-white/90 hover:bg-white text-[#2B1E16] rounded-lg shadow-md transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata (Zero-pill discipline) */}
          <div className="flex items-center gap-2 text-xs text-[#8E7864] font-medium tracking-wider uppercase mb-1">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>Silk Mark Certified</span>
          </div>

          {/* Product Name */}
          <h3 className="font-serif text-lg font-semibold text-[#2B1E16] group-hover:text-[#6A1A24] transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-[#7A6453] line-clamp-1 mt-0.5">
            {product.tagline}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-[#F0E8DC]">
          {/* Color Variations Swatches */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.variants.map((v) => {
                const isSelected = v.id === selectedVariant.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    title={`${v.colorName} (${v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'})`}
                    className={`relative w-4 h-4 rounded-full transition-all cursor-pointer ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-[#6A1A24] scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: v.colorHex }}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-[#8E7864] truncate max-w-[130px]">
              {selectedVariant.colorName}
            </span>
          </div>

          {/* Pricing & Stock Status */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold text-[#2B1E16] tabular-nums">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-xs text-[#9B8A78] line-through tabular-nums">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {selectedVariant.stock <= 4 && selectedVariant.stock > 0 ? (
              <span className="text-[10px] text-[#A93226] font-medium">
                Only {selectedVariant.stock} left
              </span>
            ) : selectedVariant.stock === 0 ? (
              <span className="text-[10px] text-gray-500 font-medium">Sold Out</span>
            ) : (
              <span className="text-[10px] text-[#145A32] font-medium">In Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
