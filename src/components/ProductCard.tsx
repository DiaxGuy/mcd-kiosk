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
      className="group relative bg-white border border-[#E5E5E5] hover:border-[#FFBC0D] rounded-lg px-3.5 pt-2.5 pb-3.5 flex flex-col justify-between cursor-pointer transition-colors active:bg-[#FFFDF5]"
    >
      {/* Top strip: subtle small yellow tag (only when badge exists, clean flat look) + info icon */}
      <div className="flex items-start justify-between w-full min-h-[18px]">
        {item.badge ? (
          <span
            className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-[3px] tracking-wide ${
              item.badge.includes('WEGE')
                ? 'bg-[#008837] text-white'
                : 'bg-[#FFBC0D] text-[#111111]'
            }`}
          >
            {item.badge === 'ZIMOWY HIT' ? 'Sezonowe' : item.badge}
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
            className="w-5 h-5 rounded-full text-[#B0B0B0] hover:text-[#292929] flex items-center justify-center transition-colors"
            title="Wartości odżywcze i alergeny"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Product Image */}
      <div className="w-full h-28 lg:h-32 flex items-center justify-center my-1.5 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain group-hover:scale-[1.03] transition-transform duration-150"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://cdn.mcdonalds.pl/uploads/20240702143550/354267-big-mac-na-www-1090x664px-big-mac-2.png';
          }}
        />
      </div>

      {/* Clean McDonald's Label */}
      <div className="mt-1 text-center space-y-0.5">
        <h3 className="font-bold text-[13px] lg:text-sm text-[#292929] leading-tight line-clamp-2">
          {item.name}
        </h3>
        <p className="text-xs text-[#6B7280] font-semibold">
          <span className="text-[#111111] font-extrabold">
            {item.price.toFixed(2).replace('.', ',')} zł
          </span>
          {item.kcal ? <span> · {item.kcal} {t.kcal}</span> : null}
        </p>
      </div>
    </div>
  );
};
