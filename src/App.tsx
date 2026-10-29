import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ShopView } from './components/ShopView';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutView } from './components/CheckoutView';
import { OrderTrackingView } from './components/OrderTrackingView';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import type { Product, ProductVariant } from './types/ecommerce';
import { ArrowRight, Sparkles, Star, Award, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'shop' | 'tracking' | 'admin' | 'checkout'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected product for PDP modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  // Featured products for homepage
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Tracking query params
  const [trackingParams, setTrackingParams] = useState<{ orderNumber: string; email: string }>({
    orderNumber: '',
    email: ''
  });

  // Sync hash routing on load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['home', 'shop', 'tracking', 'admin', 'checkout'].includes(hash)) {
        setActiveView(hash as any);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when activeView changes
  const handleViewChange = (view: 'home' | 'shop' | 'tracking' | 'admin' | 'checkout') => {
    setActiveView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load featured products on initial load
  useEffect(() => {
    fetch('/api/products?featuredOnly=true')
      .then(res => res.json())
      .then(data => {
        setFeaturedProducts(data.products || []);
        setLoadingFeatured(false);
      })
      .catch(err => {
        console.error('Failed to load featured products', err);
        setLoadingFeatured(false);
      });
  }, []);

  const handleOpenProduct = (product: Product, variant?: ProductVariant) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
  };

  const handleTrackSpecificOrder = (orderNumber: string, email: string) => {
    setTrackingParams({ orderNumber, email });
    handleViewChange('tracking');
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2B1E16]">
        {/* Navigation Bar (hidden in full admin if desired, but accessible for quick toggle) */}
        <Header
          activeView={activeView}
          setActiveView={handleViewChange}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSelectedCategory(cat);
            handleViewChange('shop');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Dynamic Main View */}
        <main className="flex-1">
          {activeView === 'home' && (
            <div className="space-y-16 lg:space-y-24 pb-16">
              {/* Hero Banner */}
              <Hero
                onShopClick={(category) => {
                  if (category) setSelectedCategory(category);
                  handleViewChange('shop');
                }}
              />

              {/* Curated Featured Weaves Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A1A24]">
                      Curated Masterpieces
                    </div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16] mt-1">
                      Featured Pure Silk Sarees
                    </h2>
                    <p className="text-xs sm:text-sm text-[#7A6453] mt-1">
                      Handcrafted on wooden pit looms with authentic 2-ply real gold zari.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      handleViewChange('shop');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6A1A24] hover:text-[#2B1E16] transition-colors cursor-pointer group"
                  >
                    <span>View Complete Collection</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

                {loadingFeatured ? (
                  <div className="py-16 text-center text-xs text-[#7A6453]">
                    Loading heirloom weaves...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {featuredProducts.slice(0, 6).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={handleOpenProduct}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Weaving Heritage Story Section */}
              <section className="bg-[#F5EFEB] border-y border-[#E8DFC8] py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-6 relative">
                      <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-xl">
                        <img
                          src="/src/assets/images/saree_dharmavaram_emerald_1793221389681.jpg"
                          alt="Intricate pure gold zari brocade on emerald handloom silk saree"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-5">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6A1A24]">
                        <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
                        <span>The Korvai Weaving Legacy</span>
                      </div>

                      <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16] leading-tight">
                        Three Shuttles, Two Master Artisans, One Sacred Saree
                      </h2>

                      <p className="text-sm text-[#5A483E] leading-relaxed">
                        In authentic Kanchipuram and Dharmavaram handloom weaving, the body and border are woven separately and interlocked with millimeter precision using the historic <em>Korvai</em> interlocking weft technique. This requires two master weavers operating three shuttles simultaneously on a wooden pit loom.
                      </p>

                      <p className="text-sm text-[#5A483E] leading-relaxed">
                        At Nagalakshmi Handloom Sarees, our artisans never cut corners with power looms or imitation chemical zari. We use tested 2-ply real silver and gold-electroplated zari threads that retain their divine luster for generations, becoming family heirlooms passed from grandmother to granddaughter.
                      </p>

                      <div className="pt-2 flex items-center gap-6 text-xs text-[#2B1E16] font-semibold">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-[#6A1A24]" />
                          <span>100% Pit Loom Woven</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#6A1A24]" />
                          <span>Certified Silk Mark</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Customer Testimonials & Auspicious Muhurthams */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-10">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6A1A24]">
                    Sacred Testimonials
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2B1E16]">
                    Draped for Sacred Beginnings
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-xl border border-[#E8DFC8] shadow-sm space-y-3">
                    <div className="flex text-[#C5A880]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-[#5A483E] leading-relaxed italic">
                      "I purchased the Royal Mayura Kanchipuram Crimson for my wedding muhurtham. The weight of the pure silk and the richness of the temple gold zari border were breathtaking. Our family priests remarked on its sacred auspiciousness."
                    </p>
                    <div className="pt-2 border-t border-[#F0E8DC]">
                      <div className="font-bold text-xs text-[#2B1E16]">Dr. Priyadarshini Rao</div>
                      <div className="text-[11px] text-[#8E7864]">Bengaluru · Verified Handloom Buyer</div>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-xl border border-[#E8DFC8] shadow-sm space-y-3">
                    <div className="flex text-[#C5A880]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-[#5A483E] leading-relaxed italic">
                      "Ordering genuine handlooms online is always stressful, but Nagalakshmi Handloom Sarees exceeded every expectation. The Silk Mark certificate was attached, the unstitched blouse piece was generous, and delivery was prompt."
                    </p>
                    <div className="pt-2 border-t border-[#F0E8DC]">
                      <div className="font-bold text-xs text-[#2B1E16]">Sowmya Ramanathan</div>
                      <div className="text-[11px] text-[#8E7864]">Hyderabad · Verified Handloom Buyer</div>
                    </div>
                  </div>

                  <div className="p-6 bg-white rounded-xl border border-[#E8DFC8] shadow-sm space-y-3">
                    <div className="flex text-[#C5A880]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-[#5A483E] leading-relaxed italic">
                      "The Dharmavaram antique brocade pallu has a soft, liquid drape that is so easy to pleat and carry for hours. Excellent WhatsApp customer support that helped me choose the exact shade."
                    </p>
                    <div className="pt-2 border-t border-[#F0E8DC]">
                      <div className="font-bold text-xs text-[#2B1E16]">Kavita Venkatachalam</div>
                      <div className="text-[11px] text-[#8E7864]">Chennai · Verified Handloom Buyer</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeView === 'shop' && (
            <ShopView
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onQuickView={handleOpenProduct}
            />
          )}

          {activeView === 'checkout' && (
            <CheckoutView
              onBackToShop={() => handleViewChange('shop')}
              onTrackOrder={handleTrackSpecificOrder}
            />
          )}

          {activeView === 'tracking' && (
            <OrderTrackingView
              initialOrderNumber={trackingParams.orderNumber}
              initialEmail={trackingParams.email}
              onBackToShop={() => handleViewChange('shop')}
            />
          )}

          {activeView === 'admin' && (
            <AdminDashboard
              onReturnToStore={() => handleViewChange('home')}
            />
          )}
        </main>

        {/* Global Slide-Over Cart Drawer */}
        <CartDrawer
          onProceedToCheckout={() => handleViewChange('checkout')}
        />

        {/* Global Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          initialVariant={selectedVariant}
          onClose={() => {
            setSelectedProduct(null);
            setSelectedVariant(undefined);
          }}
          onNavigateToCheckout={() => handleViewChange('checkout')}
        />

        {/* Global Luxury Footer */}
        <Footer
          onCategorySelect={(cat) => {
            setSelectedCategory(cat);
            handleViewChange('shop');
          }}
          onTrackOrderClick={() => handleViewChange('tracking')}
          onAdminClick={() => handleViewChange('admin')}
        />
      </div>
    </CartProvider>
  );
}
