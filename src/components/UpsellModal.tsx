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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1F1F1F]">
        {/* Header */}
        <div className="p-6 bg-[#F9FAFB] border-b border-[#E5E7EB] text-center relative">
          <button
            onClick={() => {
              sound.playTap();
              onSkip();
            }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#E5E7EB] hover:bg-mcd-red hover:text-white text-[#4B5563] flex items-center justify-center transition-colors shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mcd-yellow text-black text-xs font-black uppercase mb-2 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Słodka propozycja Maka</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-[#111]">{t.upsellTitle}</h2>
          <p className="text-sm text-[#6B7280] mt-1">{t.upsellSubtitle}</p>
        </div>

        {/* Upsell Items Grid */}
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto bg-[#FAFAFA]">
          {upsellItems.map((item) => {
            const isSelected = selectedUpsells.some((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`relative bg-white border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-mcd-yellow bg-[#FFFBEB] shadow-md scale-102'
                    : 'border-[#E5E7EB] hover:border-[#CBD5E1]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-mcd-yellow text-black flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="w-full h-28 flex items-center justify-center my-2">
                  <img src={item.image} alt={item.name} className="max-h-full object-contain filter drop-shadow-sm" />
                </div>

                <div className="mt-2 text-center">
                  <h4 className="font-extrabold text-sm text-[#111] line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  <span className="font-black text-base text-[#111] block mt-2">
                    +{item.price.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-white border-t border-[#E5E7EB] flex items-center justify-between shadow-sm">
          <button
            onClick={() => {
              sound.playTap();
              onSkip();
            }}
            className="px-6 py-3.5 rounded-2xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111] font-bold text-sm transition-colors"
          >
            {t.noThanks}
          </button>

          <button
            onClick={handleProceed}
            className="px-8 py-3.5 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] text-black font-black text-base flex items-center gap-2 shadow-sm transition-all active:scale-98"
          >
            <span>{selectedUpsells.length > 0 ? t.addAndProceed : 'Przejdź do płatności'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
