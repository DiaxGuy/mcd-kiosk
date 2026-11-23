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
  Sparkles
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
      return <Flame className="w-6 h-6 text-mcd-red group-hover:text-mcd-yellow transition-colors" />;
    case 'burgery':
      return <UtensilsCrossed className="w-6 h-6" />;
    case 'kurczak':
      return <Drumstick className="w-6 h-6" />;
    case 'mcwrapy-i-salatki':
      return <Salad className="w-6 h-6" />;
    case 'frytki-i-dodatki':
      return <Box className="w-6 h-6" />;
    case 'lody-i-desery':
      return <IceCream className="w-6 h-6" />;
    case 'mccafe':
      return <Coffee className="w-6 h-6" />;
    case 'napoje':
      return <CupSoda className="w-6 h-6" />;
    case 'sniadania':
      return <Egg className="w-6 h-6" />;
    case 'happy-meal':
      return <Gift className="w-6 h-6" />;
    case '2-for-u':
      return <BadgePercent className="w-6 h-6" />;
    case 'mczestawy':
      return <Sparkles className="w-6 h-6" />;
    default:
      return <UtensilsCrossed className="w-6 h-6" />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  language,
}) => {
  return (
    <aside className="w-56 lg:w-60 bg-[#161616] border-r border-[#282828] flex flex-col h-full overflow-y-auto select-none shrink-0 py-3 scrollbar-thin">
      <div className="px-4 pb-2 mb-1">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#737373]">
          Kategorie Menu
        </span>
      </div>

      <nav className="flex flex-col space-y-1.5 px-2">
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
              className={`group relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-left transition-all duration-200 active:scale-98 ${
                isActive
                  ? 'bg-[#262626] text-white font-bold shadow-lg border border-[#3E3E3E]'
                  : 'text-[#9E9E9E] hover:text-white hover:bg-[#202020]'
              }`}
            >
              {/* Left active yellow accent bar */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-mcd-yellow rounded-r-full shadow-glow-yellow" />
              )}

              {/* Icon Container */}
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-mcd-yellow text-black'
                    : 'bg-[#222222] text-[#B0B0B0] group-hover:bg-[#2C2C2C] group-hover:text-white'
                }`}
              >
                {getCategoryIcon(cat.id)}
              </div>

              {/* Title & Badge */}
              <div className="flex-1 min-w-0">
                <span className={`block text-xs lg:text-sm truncate ${isActive ? 'text-white font-black' : 'font-semibold'}`}>
                  {displayName}
                </span>
                {cat.tag && (
                  <span className="inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-mcd-red text-white">
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
