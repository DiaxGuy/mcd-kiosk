import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';
import { UpsellItem, Language, MenuItem, CartItem } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

interface UpsellModalProps {
  upsellItems: UpsellItem[];
  onSkip: () => void;
  onAddAndProceed: (itemsToAdd: CartItem[]) => void;
  language: Language;
}

export const UpsellModal: React.FC<UpsellModalProps> = ({
  upsellItems,
  onSkip,
  onAddAndProceed,
  language,
}) => {
  const t = translations[language];
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellItem[]>([]);

  const toggleSelect = (item: UpsellItem) => {
    sound.playTap();
    const exists = selectedUpsells.find((i) => i.id === item.id);
    if (exists) {
      setSelectedUpsells(selectedUpsells.filter((i) => i.id !== item.id));
    } else {
      setSelectedUpsells([...selectedUpsells, item]);
    }
  };

  const handleProceed = () => {
    if (selectedUpsells.length === 0) {
      sound.playTap();
      onSkip();
      return;
    }

    sound.playAdd();
    const cartItems: CartItem[] = selectedUpsells.map((up) => {
      const mockMenuItem: MenuItem = {
        id: up.id,
        name: up.name,
        category: 'desery',
        price: up.price,
        image: up.image,
        description: up.desc,
      };

      return {
        cartId: `upsell_${up.id}_${Date.now()}`,
        menuItem: mockMenuItem,
        quantity: 1,
        mealSize: 'single',
        customIngredients: [],
        selectedSauces: [],
        unitPrice: up.price,
        totalPrice: up.price,
      };
    });

    onAddAndProceed(cartItems);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 select-none">
      <div className="w-full max-w-4xl bg-white border border-[#D4D4D4] rounded-xl flex flex-col overflow-hidden text-[#292929]">
        {/* Header */}
        <div className="p-6 bg-white border-b border-[#E5E5E5] text-center relative">
          <button
            onClick={() => {
              sound.playTap();
              onSkip();
            }}
            className="absolute top-5 right-5 w-9 h-9 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#4B5563] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="inline-block px-2.5 py-0.5 rounded bg-[#FFBC0D] text-[#111] text-[10px] font-black uppercase tracking-wider mb-2">
            Słodka propozycja
          </span>
          <h2 className="text-2xl font-extrabold text-[#111]">{t.upsellTitle}</h2>
          <p className="text-sm text-[#6B7280] mt-1">{t.upsellSubtitle}</p>
        </div>

        {/* Upsell Items Grid */}
        <div className="p-7 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto bg-white">
          {upsellItems.map((item) => {
            const isSelected = selectedUpsells.some((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`relative bg-white border-2 rounded-lg p-4 flex flex-col justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-[#FFBC0D] bg-[#FFFDF5]'
                    : 'border-[#E5E5E5] hover:border-[#BDBDBD]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#FFBC0D] text-black flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="w-full h-28 flex items-center justify-center my-2">
                  <img src={item.image} alt={item.name} className="max-h-full object-contain" />
                </div>

                <div className="mt-2 text-center">
                  <h4 className="font-bold text-sm text-[#111] line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  <span className="font-black text-sm text-[#111] block mt-1.5">
                    +{item.price.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="p-5 bg-white border-t border-[#E5E5E5] flex items-center justify-between">
          <button
            onClick={() => {
              sound.playTap();
              onSkip();
            }}
            className="px-6 py-3 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#111] font-bold text-sm transition-colors"
          >
            {t.noThanks}
          </button>

          <button
            onClick={handleProceed}
            className="px-8 py-3 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111] font-extrabold text-sm flex items-center gap-2 transition-colors"
          >
            <span>{selectedUpsells.length > 0 ? t.addAndProceed : 'Przejdź do płatności'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
