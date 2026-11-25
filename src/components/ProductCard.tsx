import React from 'react';
import { Info } from 'lucide-react';
import { MenuItem, Language } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface ProductCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onShowNutrition?: (item: MenuItem) => void;
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
  onShowNutrition,
  language,
}) => {
  const t = translations[language];

  const handleClick = () => {
    sound.playTap();
    onSelect(item);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white border border-[#E5E7EB] hover:border-[#FFBC0D] rounded-xl px-4 pt-3 pb-4 flex flex-col justify-between cursor-pointer transition-colors duration-150 active:scale-[0.97]"
    >
      {/* Top Badge Strip (Rectangular McDonald's style tag at top-left + subtle info icon top-right) */}
      <div className="flex items-start justify-between w-full min-h-[20px]">
        {item.badge ? (
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wide ${
              item.badge.includes('ZIMOWY') || item.badge.includes('HIT')
                ? 'bg-[#DB0007] text-white'
                : item.badge.includes('WEGE')
                ? 'bg-[#008837] text-white'
                : 'bg-[#FFBC0D] text-[#111111]'
            }`}
          >
            {item.badge}
          </span>
        ) : (
          <span />
        )}

        {onShowNutrition && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playTap();
              onShowNutrition(item);
            }}
            className="w-6 h-6 rounded-full text-[#9CA3AF] hover:text-[#111111] hover:bg-[#F3F4F6] flex items-center justify-center transition-colors"
            title="Wartości odżywcze i alergeny"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Product Packshot (Pure white background, large clean food image) */}
      <div className="w-full h-32 lg:h-36 flex items-center justify-center my-2">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-150"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://cdn.mcdonalds.pl/uploads/20240702143550/354267-big-mac-na-www-1090x664px-big-mac-2.png';
          }}
        />
      </div>

      {/* Official Clean Product Label: Name + Single-line Price & Kcal (no extra bottom button bar!) */}
      <div className="mt-1 text-center space-y-1">
        <h3 className="font-extrabold text-[14px] lg:text-[15px] text-[#111111] leading-tight line-clamp-2">
          {item.name}
        </h3>
        <p className="text-xs text-[#4B5563] font-bold">
          <span className="text-[#111111] font-black text-sm">
            {item.price.toFixed(2).replace('.', ',')} zł
          </span>
          {item.kcal ? (
            <span className="text-[#6B7280] font-semibold"> • {item.kcal} {t.kcal}</span>
          ) : null}
        </p>
      </div>
    </div>
  );
};
