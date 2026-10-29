import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, X, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { ProductCategory } from '../types/ecommerce';

interface HeaderProps {
  activeView: 'home' | 'shop' | 'tracking' | 'admin' | 'checkout';
  setActiveView: (view: 'home' | 'shop' | 'tracking' | 'admin' | 'checkout') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  setActiveView,
  setSelectedCategory,
  searchQuery,
  setSearchQuery
}) => {
  const { cartCount, setIsCartOpen, wishlist } = useCart();
  const [showSearch, setShowSearch] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const handleNavClick = (category?: ProductCategory | 'All') => {
    if (category) {
      setSelectedCategory(category);
    }
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8DFC8]">
      {/* Subtle Announcement Strip */}
      {!bannerDismissed && (
        <div className="bg-[#6A1A24] text-[#FAF8F5] text-xs font-medium py-1.5 px-4 flex items-center justify-between tracking-wide">
          <div className="mx-auto flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5C158]" />
            <span>Festive Season: Use code <strong className="text-[#E5C158] font-bold">UTSAV10</strong> for 10% off · Silk Mark India Certified Pure Silks</span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-white/70 hover:text-white p-0.5 ml-2 cursor-pointer transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar Contract (3 Zones) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setSelectedCategory('All');
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <div className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#2B1E16] group-hover:text-[#6A1A24] transition-colors whitespace-nowrap">
              NAGALAKSHMI
            </div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#8E7864] font-medium whitespace-nowrap">
              Handloom Sarees · Est. 1978
            </div>
          </button>
        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium tracking-wider uppercase text-[#4A3B32]">
          <button
            onClick={() => handleNavClick('All')}
            className="hover:text-[#6A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            All Sarees
          </button>
          <button
            onClick={() => handleNavClick('Kanchipuram Silk')}
            className="hover:text-[#6A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kanchipuram
          </button>
          <button
            onClick={() => handleNavClick('Dharmavaram Pattu')}
            className="hover:text-[#6A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Dharmavaram
          </button>
          <button
            onClick={() => handleNavClick('Banarasi Katan')}
            className="hover:text-[#6A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Banarasi
          </button>
          <button
            onClick={() => handleNavClick('Bridal Collection')}
            className="text-[#6A1A24] font-semibold hover:text-[#8E2835] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Bridal Muhurtham
          </button>
          <button
            onClick={() => {
              setActiveView('tracking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#6A1A24] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Track Order
          </button>
        </nav>

        {/* Zone 3: Interactive Affordances */}
        <div className="flex items-center gap-4 sm:gap-5 shrink-0">
          {/* Search Trigger */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-[#4A3B32] hover:text-[#6A1A24] hover:bg-[#F3ECE2] rounded-full transition-colors cursor-pointer"
            title="Search sarees"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => {
              setActiveView('shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="relative p-2 text-[#4A3B32] hover:text-[#6A1A24] hover:bg-[#F3ECE2] rounded-full transition-colors cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#6A1A24] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-2 bg-[#F3ECE2] hover:bg-[#EBE2D4] text-[#2B1E16] rounded-full transition-colors cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-[#6A1A24]" />
            <span className="text-xs font-semibold tabular-nums text-[#2B1E16]">
              {cartCount}
            </span>
          </button>

          {/* Admin Link */}
          <button
            onClick={() => {
              setActiveView('admin');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#7A6453] hover:text-[#2B1E16] hover:bg-[#F3ECE2] border border-[#D9CEC1] rounded-md transition-colors cursor-pointer whitespace-nowrap"
            title="Master Weaver & Store Management"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#6A1A24]" />
            <span>Store Admin</span>
          </button>
        </div>
      </div>

      {/* Slide-down Search Bar */}
      {showSearch && (
        <div className="bg-[#FAF8F5] border-t border-[#E8DFC8] px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Search className="w-5 h-5 text-[#8E7864] shrink-0" />
            <input
              type="text"
              placeholder="Search by weave, silk type, zari motifs, color (e.g. Kanchipuram, Crimson, Brocade)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0) {
                  setActiveView('shop');
                }
              }}
              autoFocus
              className="w-full bg-transparent border-none text-[#2B1E16] placeholder-[#A39281] focus:outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#8E7864] hover:text-[#2B1E16] p-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowSearch(false)}
              className="text-[#8E7864] hover:text-[#2B1E16] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
