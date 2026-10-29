import React from 'react';
import { ArrowRight, Sparkles, Award, ShieldCheck, Feather } from 'lucide-react';

interface HeroProps {
  onShopClick: (category?: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onShopClick }) => {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8 z-10">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6A1A24] bg-[#F5ECE8] px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" />
              <span>Authentic Master Handloom Weaves</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[#2B1E16] leading-[1.12] text-balance">
              Heirloom Pure Silks, <br />
              <span className="italic text-[#6A1A24] font-medium">Woven with Sacred Soul</span>
            </h1>

            <p className="text-[#5A483E] text-base sm:text-lg leading-relaxed max-w-xl">
              From the historic pit looms of Kanchipuram, Dharmavaram, and Varanasi to your auspicious celebrations. Each saree represents over 180 hours of master weaver dedication, 2-ply pure mulberry silk, and authentic electroplated gold zari.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onShopClick('All')}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#6A1A24] hover:bg-[#52131B] text-[#FAF8F5] text-sm font-semibold tracking-wider uppercase rounded-md shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer group"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onShopClick('Bridal Collection')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent hover:bg-[#F3ECE2] text-[#2B1E16] text-sm font-semibold tracking-wider uppercase border border-[#8E7864] rounded-md transition-colors cursor-pointer"
              >
                <span>Bridal Muhurtham</span>
              </button>
            </div>

            {/* Quick stats */}
            <div className="pt-6 border-t border-[#E8DFC8] grid grid-cols-3 gap-4">
              <div>
                <div className="font-serif text-2xl font-bold text-[#2B1E16] tabular-nums">48+</div>
                <div className="text-xs text-[#7A6453] uppercase tracking-wider mt-0.5">Years of Legacy</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#2B1E16] tabular-nums">100%</div>
                <div className="text-xs text-[#7A6453] uppercase tracking-wider mt-0.5">Silk Mark Certified</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-bold text-[#2B1E16] tabular-nums">2,400+</div>
                <div className="text-xs text-[#7A6453] uppercase tracking-wider mt-0.5">Bridal Drapes</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-2xl border border-[#E8DFC8]">
              <img
                src="/src/assets/images/hero_nagalakshmi_saree_1793221388793.jpg"
                alt="Model draped in authentic Kanchipuram pure silk bridal saree with gold zari pallu"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              {/* Floating curated badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#FAF8F5]/90 backdrop-blur-md rounded-xl border border-[#E8DFC8] shadow-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-semibold text-[#6A1A24]">Featured Masterpiece</div>
                  <div className="font-serif text-base font-semibold text-[#2B1E16]">The Royal Mayura Kanchipuram Silk</div>
                  <div className="text-xs text-[#7A6453] mt-0.5">Pure Mulberry Silk · 2-Ply Gold Zari Pallu</div>
                </div>
                <button
                  onClick={() => onShopClick('Kanchipuram Silk')}
                  className="px-3.5 py-2 bg-[#6A1A24] text-white text-xs font-semibold rounded-lg hover:bg-[#52131B] transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Saree
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Column Heritage Trust Strip */}
        <div className="mt-14 pt-8 border-t border-[#E8DFC8] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-[#6A1A24] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#2B1E16]">Silk Mark India Certified</h4>
              <p className="text-xs text-[#7A6453] mt-0.5">Guaranteed 100% natural pure mulberry silk on every drape.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Feather className="w-6 h-6 text-[#6A1A24] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#2B1E16]">Authentic Pit Looms</h4>
              <p className="text-xs text-[#7A6453] mt-0.5">Traditional hand-interlocked Korvai weaving technique.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Sparkles className="w-6 h-6 text-[#6A1A24] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#2B1E16]">Pure Tested Gold Zari</h4>
              <p className="text-xs text-[#7A6453] mt-0.5">Real silver and gold electroplated zari threads that never tarnish.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-[#6A1A24] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-[#2B1E16]">Direct From Weavers</h4>
              <p className="text-xs text-[#7A6453] mt-0.5">Fair artisanal compensation with insured worldwide shipping.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
