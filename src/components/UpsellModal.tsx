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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-[#1A1A1A] border-2 border-[#333333] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#222222] border-b border-[#303030] text-center relative">
          <button
            onClick={() => {
              sound.playTap();
              onSkip();
            }}
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-[#2E2E2E] hover:bg-mcd-red text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mcd-yellow text-black text-xs font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Słodka propozycja Maka</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-white">{t.upsellTitle}</h2>
          <p className="text-sm text-[#A0A0A0] mt-1">{t.upsellSubtitle}</p>
        </div>

        {/* Upsell Items Grid */}
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto">
          {upsellItems.map((item) => {
            const isSelected = selectedUpsells.some((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleSelect(item)}
                className={`relative bg-[#222222] border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'border-mcd-yellow bg-[#2A2A2A] shadow-glow-yellow scale-102'
                    : 'border-[#333333] hover:border-[#555]'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-mcd-yellow text-black flex items-center justify-center font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                <div className="w-full h-28 flex items-center justify-center my-2">
                  <img src={item.image} alt={item.name} className="max-h-full object-contain drop-shadow" />
                </div>

                <div className="mt-2 text-center">
                  <h4 className="font-extrabold text-sm text-white line-clamp-2 leading-tight">
                    {item.name}
                  </h4>
                  <span className="font-black text-base text-mcd-yellow block mt-2">
                    +{item.price.toFixed(2).replace('.', ',')} zł
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 bg-[#202020] border-t border-[#303030] flex items-center justify-between">
          <button
            onClick={() => {
              sound.playTap();
              onSkip();
            }}
            className="px-6 py-3.5 rounded-2xl bg-[#2A2A2A] hover:bg-[#353535] text-white font-bold text-sm transition-colors"
          >
            {t.noThanks}
          </button>

          <button
            onClick={handleProceed}
            className="px-8 py-3.5 rounded-2xl bg-[#008837] hover:bg-[#009b3f] text-white font-black text-base flex items-center gap-2 shadow-glow-green transition-all active:scale-98"
          >
            <span>{selectedUpsells.length > 0 ? t.addAndProceed : 'Przejdź do płatności'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
