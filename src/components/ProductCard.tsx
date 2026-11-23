import React from 'react';
import { Plus, SlidersHorizontal, Flame } from 'lucide-react';
import { MenuItem, Language } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface ProductCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  language: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onSelect,
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
      className="group relative bg-white hover:bg-[#FAFAFA] border border-[#E5E7EB] hover:border-mcd-yellow rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
    >
      {/* Top: Badge (Popular / Nowość / Wege) */}
      <div className="flex items-center justify-between w-full h-5 mb-1">
        {item.badge ? (
          <span
            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1 ${
              item.badge.includes('ZIMOWY') || item.badge.includes('HIT')
                ? 'bg-mcd-red text-white'
                : item.badge.includes('WEGE')
                ? 'bg-emerald-600 text-white'
                : 'bg-mcd-yellow text-black'
            }`}
          >
            {item.badge.includes('ZIMOWY') && <Flame className="w-3 h-3 fill-current" />}
            {item.badge}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Product Image (Transparent PNG from McDonald's Poland CDN) */}
      <div className="relative w-full h-32 lg:h-36 flex items-center justify-center my-2 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://cdn.mcdonalds.pl/uploads/20240702143550/354267-big-mac-na-www-1090x664px-big-mac-2.png';
          }}
        />
      </div>

      {/* Product Title (Bold clean text as in photo) */}
      <div className="mt-1 mb-2 text-center">
        <h3 className="font-extrabold text-sm lg:text-[15px] text-[#1F1F1F] tracking-tight leading-snug line-clamp-2 group-hover:text-mcd-red transition-colors">
          {item.name}
        </h3>
        {item.kcal && (
          <span className="text-[11px] font-semibold text-[#6B7280] block mt-0.5">
            {item.kcal} {t.kcal}
          </span>
        )}
      </div>

      {/* Bottom Bar: Price & Select button */}
      <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] mt-auto">
        <div>
          <span className="text-base font-black text-[#111111]">
            {item.price.toFixed(2).replace('.', ',')} <span className="text-xs font-bold text-[#6B7280]">zł</span>
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="h-8 px-3 rounded-xl bg-[#F3F4F6] group-hover:bg-mcd-yellow text-[#1F1F1F] group-hover:text-black font-extrabold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95"
        >
          {item.isCustomizable ? (
            <>
              <SlidersHorizontal className="w-3 h-3" />
              <span>{t.customize}</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{t.select}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
