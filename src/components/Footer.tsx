import React, { useState } from 'react';
import { Award, ShieldCheck, Phone, Mail, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

interface FooterProps {
  onCategorySelect: (category: string) => void;
  onTrackOrderClick: () => void;
  onAdminClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onCategorySelect,
  onTrackOrderClick,
  onAdminClick
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;
    setSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-[#2B1E16] text-[#FAF8F5] border-t border-[#4A3B32]">
      {/* Newsletter Bar */}
      <div className="border-b border-[#4A3B32]/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 space-y-1">
            <h3 className="font-serif text-2xl font-bold tracking-tight text-[#FAF8F5]">
              Join the Nagalakshmi Heritage Club
            </h3>
            <p className="text-xs text-[#C5A880]">
              Receive preview access to newly off-loom bridal weaves and festive weaver stories.
            </p>
          </div>

          <div className="md:col-span-6">
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-[#145A32]/40 border border-[#145A32] rounded-lg text-xs text-[#A9DFBF]">
                <CheckCircle className="w-4 h-4 text-[#A9DFBF]" />
                <span>Namaste! You have successfully subscribed to our handloom dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#3B2B21] border border-[#5A483E] rounded-lg text-xs text-[#FAF8F5] placeholder-[#A39281] focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#6A1A24] hover:bg-[#8E2835] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 text-xs">
        {/* Brand & Story */}
        <div className="lg:col-span-4 space-y-4">
          <div className="font-serif text-2xl font-bold tracking-wider text-[#FAF8F5]">
            NAGALAKSHMI
          </div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-[#C5A880] font-medium">
            Handloom Sarees · Kanchipuram & Dharmavaram
          </div>
          <p className="text-[#D9CEC1] leading-relaxed">
            Preserving South India’s majestic pit loom weaving tradition since 1978. Every pure silk saree is an artisanal treasure hand-interlocked with genuine tested gold zari and certified by the Silk Mark Organization of India.
          </p>
          <div className="flex items-center gap-3 pt-2 text-[#C5A880]">
            <Award className="w-5 h-5" />
            <span className="font-semibold text-white">Govt. Registered Silk Mark #SM-2026-IND</span>
          </div>
        </div>

        {/* Handloom Weaves */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-serif text-sm font-semibold text-[#FAF8F5] uppercase tracking-wider">
            Heirloom Weaves
          </h4>
          <ul className="space-y-2 text-[#D9CEC1]">
            <li>
              <button
                onClick={() => onCategorySelect('Kanchipuram Silk')}
                className="hover:text-[#C5A880] transition-colors cursor-pointer"
              >
                Kanchipuram Pure Silk Sarees
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategorySelect('Dharmavaram Pattu')}
                className="hover:text-[#C5A880] transition-colors cursor-pointer"
              >
                Dharmavaram Antique Brocade Pattu
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategorySelect('Banarasi Katan')}
                className="hover:text-[#C5A880] transition-colors cursor-pointer"
              >
                Varanasi Kadwa Jaal Katan Silk
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategorySelect('Pochampally Ikkat')}
                className="hover:text-[#C5A880] transition-colors cursor-pointer"
              >
                Pochampally Double Ikkat
              </button>
            </li>
            <li>
              <button
                onClick={() => onCategorySelect('Bridal Collection')}
                className="text-[#C5A880] font-semibold hover:underline cursor-pointer"
              >
                Muhurtham Grand Bridal Collection
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Care & Policies */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-serif text-sm font-semibold text-[#FAF8F5] uppercase tracking-wider">
            Customer Care
          </h4>
          <ul className="space-y-2 text-[#D9CEC1]">
            <li>
              <button
                onClick={onTrackOrderClick}
                className="hover:text-[#C5A880] transition-colors cursor-pointer"
              >
                Track Saree Order
              </button>
            </li>
            <li>
              <span className="hover:text-[#C5A880] cursor-pointer">Saree Fall & Pico Finishing</span>
            </li>
            <li>
              <span className="hover:text-[#C5A880] cursor-pointer">Silk Mark Verification</span>
            </li>
            <li>
              <span className="hover:text-[#C5A880] cursor-pointer">Complimentary Pan-India Shipping</span>
            </li>
            <li>
              <span className="hover:text-[#C5A880] cursor-pointer">7-Day Artisan Exchange Policy</span>
            </li>
            <li>
              <button
                onClick={onAdminClick}
                className="text-[#C5A880] hover:underline cursor-pointer font-medium"
              >
                Store Administration
              </button>
            </li>
          </ul>
        </div>

        {/* Atelier Locations & Contact */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-serif text-sm font-semibold text-[#FAF8F5] uppercase tracking-wider">
            Heritage Ateliers
          </h4>
          <div className="space-y-2.5 text-[#D9CEC1]">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span>
                <strong>Weaving Atelier:</strong> 42 Weavers Colony, Gandhi Road, Kanchipuram, Tamil Nadu - 631501
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span>WhatsApp Concierge: +91 98401 22345</span>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
              <span>care@nagalakshmihandlooms.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-[#4A3B32]/60 py-6 px-4 text-center text-xs text-[#8E7864]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p>© 2026 Nagalakshmi Handloom Sarees. All Rights Reserved. Pure Handloom Silk Mark India Certified.</p>
          <div className="flex items-center gap-4 text-[#D9CEC1]">
            <span className="hover:text-[#C5A880] cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-[#C5A880] cursor-pointer">Terms of Weaving Service</span>
            <span>·</span>
            <span className="hover:text-[#C5A880] cursor-pointer">Authenticity Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
