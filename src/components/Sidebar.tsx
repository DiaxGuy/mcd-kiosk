import React from 'react';
import { Category, Language } from '../types';
import { sound } from '../utils/audio';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  language: Language;
}

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
    <aside className="w-48 lg:w-56 bg-white border-r border-[#E5E5E5] flex flex-col h-full overflow-y-auto select-none shrink-0 scrollbar-thin py-1">
      <nav className="flex flex-col">
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
              className={`group relative w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'bg-[#FFFDF4] text-[#111111]'
                  : 'bg-white text-[#4A4A4A] hover:bg-[#FAFAFA] hover:text-[#111111]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#FFBC0D]" />
              )}

              <div className="w-10 h-8 flex items-center justify-center shrink-0">
                <img
                  src={imgSrc}
                  alt={displayName}
                  className="max-h-8 max-w-10 object-contain"
                />
              </div>

              <span className={`block text-[13px] leading-tight truncate ${isActive ? 'font-extrabold text-[#111111]' : 'font-semibold'}`}>
                {displayName}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
