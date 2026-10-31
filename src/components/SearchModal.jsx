import React, { useEffect, useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';

export default function SearchModal() {
  const { lang, isSearchOpen, setIsSearchOpen, setActiveProductModal, products } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e) => e.key === 'Escape' && setIsSearchOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filterTags = ['All', 'Oud & Woods', 'Saffron & Spices', 'Vanilla & Amber', 'Ocean & Fresh'];

  const results = products.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesQuery =
      !term ||
      item.nameEn.toLowerCase().includes(term) ||
      item.nameAr.includes(term) ||
      item.archetypeEn.toLowerCase().includes(term) ||
      item.archetypeAr.includes(term) ||
      item.notes.top.some((n) => n.toLowerCase().includes(term)) ||
      item.notes.base.some((n) => n.toLowerCase().includes(term));

    let matchesTag = true;
    if (selectedTag === 'Oud & Woods') {
      matchesTag = ['scorpio', 'capricorn', 'sagittarius'].includes(item.slug);
    } else if (selectedTag === 'Saffron & Spices') {
      matchesTag = ['aries', 'leo', 'libra'].includes(item.slug);
    } else if (selectedTag === 'Vanilla & Amber') {
      matchesTag = ['taurus', 'gemini', 'pisces'].includes(item.slug);
    } else if (selectedTag === 'Ocean & Fresh') {
      matchesTag = ['cancer', 'virgo', 'aquarius'].includes(item.slug);
    }

    return matchesQuery && matchesTag;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Search">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="min-h-full flex items-start justify-center p-4 sm:p-6 pt-16 sm:pt-24">
        <div className="relative w-full max-w-2xl bg-brand-surface rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 p-6 space-y-6">
          
          {/* Header & Input */}
          <div className="flex items-center justify-between pb-4 border-b border-brand-border">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-brand-green" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === 'ar' ? 'ابحث بالاسم، النوتة (عود، عنبر، فانيليا، هيل)...' : 'Search by perfume name, note (oud, amber, vanilla, saffron)...'}
                className="w-full bg-transparent text-base sm:text-lg text-brand-noir placeholder:text-brand-muted/70 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1 rounded-full text-brand-muted hover:text-brand-noir"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tag Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedTag === tag
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'bg-brand-bg text-brand-muted hover:text-brand-noir border border-brand-border/60'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Instant Search Results */}
          <div className="max-h-[50vh] overflow-y-auto overscroll-contain space-y-3 pr-1">
            {results.length === 0 ? (
              <div className="py-12 text-center text-brand-muted text-sm">
                {lang === 'ar' ? 'لم نجد عطوراً مطابقة لبحثك.' : 'No fragrances found matching your search.'}
              </div>
            ) : (
              results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setActiveProductModal(product);
                    setIsSearchOpen(false);
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-brand-bg transition-colors cursor-pointer group border border-transparent hover:border-brand-border"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={product.bottleImage}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover bg-stone-900"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base text-brand-noir group-hover:text-brand-green">
                          {lang === 'ar' ? product.nameAr : product.nameEn}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/15 text-brand-gold font-medium">
                          {product.symbol} {lang === 'ar' ? product.archetypeAr : product.archetypeEn}
                        </span>
                      </div>
                      <div className="text-xs text-brand-muted mt-0.5 line-clamp-1">
                        {lang === 'ar' ? product.notes.topAr.join(', ') : product.notes.top.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="font-serif text-sm font-medium text-brand-noir">
                      {product.price.toFixed(2)} JOD
                    </div>
                    <span className="text-[10px] text-brand-green flex items-center justify-end gap-1 group-hover:underline">
                      {lang === 'ar' ? 'عرض العطر' : 'View'}
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
