import React, { useState, useEffect } from 'react';
import { Search, Filter, X, RefreshCw, Heart } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product, ProductVariant, ProductCategory } from '../types/ecommerce';
import { useCart } from '../context/CartContext';

interface ShopViewProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onQuickView: (product: Product, variant?: ProductVariant) => void;
}

const CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Kanchipuram Silk',
  'Dharmavaram Pattu',
  'Banarasi Katan',
  'Pochampally Ikkat',
  'Gadwal Silk',
  'Bridal Collection'
];

const COLOR_FILTERS = [
  { name: 'All', hex: '' },
  { name: 'Crimson / Red', hex: '#8E1624' },
  { name: 'Emerald Green', hex: '#145A32' },
  { name: 'Sapphire Blue', hex: '#1B3F8B' },
  { name: 'Haldi Turmeric', hex: '#D28C1B' },
  { name: 'Rani Pink', hex: '#C2185B' }
];

export const ShopView: React.FC<ShopViewProps> = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onQuickView
}) => {
  const { wishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedColor, setSelectedColor] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState<number>(35000);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedColor && selectedColor !== 'All') params.append('color', selectedColor.split(' ')[0]);
      if (inStockOnly) params.append('inStockOnly', 'true');
      if (searchQuery) params.append('search', searchQuery);
      if (sortBy) params.append('sort', sortBy);
      if (maxPrice) params.append('maxPrice', maxPrice.toString());

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to load products');
      } else {
        setProducts(data.products || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedColor, inStockOnly, searchQuery, sortBy, maxPrice]);

  const displayedProducts = showWishlistOnly
    ? products.filter(p => wishlist.includes(p.id))
    : products;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedColor('');
    setInStockOnly(false);
    setShowWishlistOnly(false);
    setSearchQuery('');
    setSortBy('featured');
    setMaxPrice(35000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Category Heading & Kicker */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A1A24]">
          Generational Pit Loom Weaves
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2B1E16]">
          {selectedCategory === 'All' ? 'Complete Handloom Saree Collection' : selectedCategory}
        </h1>
        <p className="text-xs sm:text-sm text-[#7A6453]">
          Pure mulberry silk, authentic 2-ply real gold zari, and timeless South Indian & Banarasi weaving traditions.
        </p>
      </div>

      {/* Interactive Category Segmented Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-full transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#6A1A24] text-white shadow-sm'
                : 'bg-white border border-[#E8DFC8] text-[#4A3B32] hover:bg-[#F3ECE2]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DFC8] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Left: Active Filters & Count */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#6A1A24]" />
          <span className="font-semibold text-[#2B1E16]">
            Showing {displayedProducts.length} Heirloom Saree{displayedProducts.length === 1 ? '' : 's'}
          </span>
          {(selectedCategory !== 'All' || selectedColor || inStockOnly || searchQuery || showWishlistOnly) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-[#6A1A24] hover:underline font-medium cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear filters</span>
            </button>
          )}
        </div>

        {/* Right: Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Wishlist toggle */}
          <button
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              showWishlistOnly
                ? 'border-[#6A1A24] bg-[#F5ECE8] text-[#6A1A24]'
                : 'border-[#D9CEC1] bg-white text-[#4A3B32] hover:bg-[#FAF8F5]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showWishlistOnly ? 'fill-current' : ''}`} />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          {/* In Stock toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[#4A3B32]">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-[#6A1A24] rounded"
            />
            <span>In Stock Only</span>
          </label>

          {/* Color filter */}
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-2.5 py-1.5 border border-[#D9CEC1] rounded-lg bg-white text-[#4A3B32] focus:outline-none"
          >
            <option value="">All Color Weaves</option>
            {COLOR_FILTERS.filter(c => c.name !== 'All').map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 border border-[#D9CEC1] rounded-lg bg-white text-[#4A3B32] focus:outline-none"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest Weaves</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#6A1A24] animate-spin mx-auto" />
          <p className="font-serif text-lg text-[#2B1E16]">Retrieving Handloom Masterpieces...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center space-y-3 bg-[#FADBD8] rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-xs text-[#922B21]">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-[#6A1A24] text-white text-xs font-semibold rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : displayedProducts.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-[#E8DFC8] p-8 max-w-md mx-auto">
          <h3 className="font-serif text-xl font-bold text-[#2B1E16]">No Matching Sarees Found</h3>
          <p className="text-xs text-[#7A6453]">
            {showWishlistOnly
              ? 'You have not added any sarees to your wishlist yet.'
              : 'Try relaxing your filter criteria or searching for other traditional weaves.'}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-2 px-5 py-2.5 bg-[#6A1A24] text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#52131B] transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </div>
  );
};
