import React from 'react';
import { Category, Language } from '../types';
import { sound } from '../utils/audio';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  language: Language;
}

// Official real product packshots from cdn.mcdonalds.pl for each category
const CATEGORY_IMAGES: Record<string, string> = {
  'co-nowego': 'https://cdn.mcdonalds.pl/uploads/20261104143818/pl10-p00001662-drwal-2026-na-www-1090x664px-burger-drwala-klasyczny.png',
  'burgery': 'https://cdn.mcdonalds.pl/uploads/20240702143550/354267-big-mac-na-www-1090x664px-big-mac-2.png',
  'kurczak': 'https://cdn.mcdonalds.pl/uploads/20210609095435/347406-supreme-crispy-chicken-strips-i-chicken-box-na-www-1090x664px-3.png',
  'mcwrapy-i-salatki': 'https://cdn.mcdonalds.pl/uploads/20221221160508/350367-mcwrap-2022-na-www-1090x664px-7-mcwrap-klasyczny.png',
  'frytki-i-dodatki': 'https://cdn.mcdonalds.pl/uploads/20241104114431/354308-nowe-frytki-2024-na-www-1090x664px-2-frytki-srednie.png',
  'lody-i-desery': 'https://cdn.mcdonalds.pl/uploads/20240702123338/355322-mcflurry-kitkat-na-www-1090x664px-4-mcflurry-kitkat-waniliowe.png',
  'mccafe': 'https://cdn.mcdonalds.pl/uploads/20240318121430/353846-nowe-kubki-mccafe-2024-na-www-1090x664px-cappuccino.png',
  'napoje': 'https://cdn.mcdonalds.pl/uploads/20230919154152/1090x664kubek.png',
  'sniadania': 'https://cdn.mcdonalds.pl/uploads/20220922163548/02-12-kajzerka-jajko-i-pieczarki-singlepage.png',
  'happy-meal': 'https://cdn.mcdonalds.pl/uploads/20220922155903/09-01-happy-meal-1.png',
  '2-for-u': 'https://cdn.mcdonalds.pl/uploads/20200617144103/mcd-www-packshoty-singlepage-2foru-1.png',
  'mczestawy': 'https://cdn.mcdonalds.pl/uploads/20240708120552/354267-big-mac-na-www-1090x664px-mczestaw.png',
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  language,
}) => {
  return (
    <aside className="w-48 lg:w-56 bg-white border-r border-[#E5E7EB] flex flex-col h-full overflow-y-auto select-none shrink-0 scrollbar-thin">
      <nav className="flex flex-col divide-y divide-[#F3F4F6]">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const displayName = language === 'en' ? cat.nameEn : language === 'ua' ? cat.nameUa : cat.name;
          const imgSrc = CATEGORY_IMAGES[cat.id] || CATEGORY_IMAGES['burgery'];

          return (
            <button
              key={cat.id}
              onClick={() => {
                sound.playTap();
                onSelectCategory(cat.id);
              }}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-[#FFF9E6] ${
                isActive
                  ? 'bg-[#FFFDF5] text-[#111111]'
                  : 'bg-white text-[#4B5563] hover:bg-[#FAFAFA] hover:text-[#111111]'
              }`}
            >
              {/* Official left yellow indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFBC0D]" />
              )}

              {/* Real product packshot thumbnail */}
              <div className="w-11 h-9 flex items-center justify-center shrink-0">
                <img
                  src={imgSrc}
                  alt={displayName}
                  className={`max-h-9 max-w-11 object-contain transition-transform ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                />
              </div>

              {/* Category Name + Tag */}
              <div className="flex-1 min-w-0">
                <span className={`block text-xs lg:text-[13px] leading-tight truncate ${isActive ? 'font-black text-[#111111]' : 'font-bold'}`}>
                  {displayName}
                </span>
                {cat.tag && (
                  <span className="inline-block mt-0.5 text-[9px] font-black px-1.5 py-0.2 rounded bg-[#DB0007] text-white uppercase tracking-wider">
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
