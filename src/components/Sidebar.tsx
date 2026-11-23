import React from 'react';
import {
  Flame,
  UtensilsCrossed,
  Drumstick,
  Salad,
  Box,
  IceCream,
  Coffee,
  CupSoda,
  Egg,
  Gift,
  BadgePercent,
  Sparkles,
  Home
} from 'lucide-react';
import { Category, Language } from '../types';
import { sound } from '../utils/audio';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  language: Language;
}

const getCategoryIcon = (id: string) => {
  switch (id) {
    case 'co-nowego':
      return <Flame className="w-5 h-5 text-mcd-red" />;
    case 'burgery':
      return <UtensilsCrossed className="w-5 h-5" />;
    case 'kurczak':
      return <Drumstick className="w-5 h-5" />;
    case 'mcwrapy-i-salatki':
      return <Salad className="w-5 h-5" />;
    case 'frytki-i-dodatki':
      return <Box className="w-5 h-5" />;
    case 'lody-i-desery':
      return <IceCream className="w-5 h-5" />;
    case 'mccafe':
      return <Coffee className="w-5 h-5" />;
    case 'napoje':
      return <CupSoda className="w-5 h-5" />;
    case 'sniadania':
      return <Egg className="w-5 h-5" />;
    case 'happy-meal':
      return <Gift className="w-5 h-5" />;
    case '2-for-u':
      return <BadgePercent className="w-5 h-5" />;
    case 'mczestawy':
      return <Sparkles className="w-5 h-5" />;
    default:
      return <UtensilsCrossed className="w-5 h-5" />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  language,
}) => {
  return (
    <aside className="w-56 lg:w-60 bg-[#F4F4F6] border-r border-[#E5E7EB] flex flex-col h-full overflow-y-auto select-none shrink-0 py-3 scrollbar-thin">
      <div className="px-4 pb-2 mb-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#9CA3AF]">
          Kategorie
        </span>
      </div>

      <nav className="flex flex-col space-y-1 px-2.5">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const displayName = language === 'en' ? cat.nameEn : language === 'ua' ? cat.nameUa : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => {
                sound.playTap();
                onSelectCategory(cat.id);
              }}
              className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-150 active:scale-98 ${
                isActive
                  ? 'bg-white text-[#111111] font-black shadow-sm border border-[#E5E7EB]'
                  : 'text-[#4B5563] hover:text-[#111111] hover:bg-white/70'
              }`}
            >
              {/* Left active yellow accent indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-2.5 bottom-2.5 w-1.5 bg-mcd-yellow rounded-r-full shadow-sm" />
              )}

              {/* Icon Container */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-mcd-yellow text-black'
                    : 'bg-[#EAEAEA] text-[#4B5563] group-hover:bg-[#E0E0E0] group-hover:text-black'
                }`}
              >
                {getCategoryIcon(cat.id)}
              </div>

              {/* Title & Badge */}
              <div className="flex-1 min-w-0">
                <span className={`block text-xs lg:text-[13px] truncate ${isActive ? 'font-black text-black' : 'font-semibold'}`}>
                  {displayName}
                </span>
                {cat.tag && (
                  <span className="inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-mcd-red text-white uppercase">
                    {cat.tag}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
