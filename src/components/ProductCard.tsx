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
      className="group relative bg-[#1E1E1E] hover:bg-[#252525] border border-[#303030] hover:border-mcd-yellow rounded-3xl p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-lg hover:shadow-2xl active:scale-[0.98]"
    >
      {/* Top row: Badge & Calories */}
      <div className="flex items-center justify-between w-full h-6 mb-1">
        {item.badge ? (
          <span
            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1 ${
              item.badge.includes('ZIMOWY') || item.badge.includes('HIT')
                ? 'bg-mcd-red text-white'
                : item.badge.includes('WEGE')
                ? 'bg-emerald-700 text-white'
                : 'bg-mcd-yellow text-black'
            }`}
          >
            {item.badge.includes('ZIMOWY') && <Flame className="w-3 h-3 fill-current" />}
            {item.badge}
          </span>
        ) : (
          <span />
        )}

        {item.kcal && (
          <span className="text-[11px] font-medium text-[#9E9E9E] bg-[#2A2A2A] px-2 py-0.5 rounded-full">
            {item.kcal} {t.kcal}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative w-full h-36 lg:h-40 flex items-center justify-center my-2 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-300"
          onError={(e) => {
            // fallback placeholder if image network error
            (e.target as HTMLImageElement).src =
              'https://cdn.mcdonalds.pl/uploads/20240702143550/354267-big-mac-na-www-1090x664px-big-mac-2.png';
          }}
        />
      </div>

      {/* Product Title */}
      <div className="mt-1 mb-3">
        <h3 className="font-extrabold text-sm lg:text-base text-white tracking-tight leading-snug line-clamp-2 group-hover:text-mcd-yellow transition-colors">
          {item.name}
        </h3>
      </div>

      {/* Bottom Bar: Price & Add Button */}
      <div className="flex items-center justify-between pt-2 border-t border-[#2D2D2D] mt-auto">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#8E8E8E] block leading-none">
            {item.isCustomizable ? `${t.fromPrice}` : 'Cena'}
          </span>
          <span className="text-base lg:text-lg font-black text-white">
            {item.price.toFixed(2).replace('.', ',')} <span className="text-xs font-bold text-[#A5A5A5]">zł</span>
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="h-10 px-3.5 rounded-2xl bg-[#2A2A2A] group-hover:bg-mcd-yellow text-white group-hover:text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
        >
          {item.isCustomizable ? (
            <>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{t.customize}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{t.select}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
