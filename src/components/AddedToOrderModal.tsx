import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag, CheckCircle, Utensils } from 'lucide-react';
import { CartItem, Language } from '../types';
import { HappyMascot } from './HappyMascot';
import { OfficialLogo } from './OfficialLogo';
import { sound } from '../utils/audio';

interface AddedToOrderModalProps {
  lastAddedItem: CartItem;
  totalCartCount: number;
  totalAmount: number;
  onContinue: () => void;
  onCheckout: () => void;
  language: Language;
}

export const AddedToOrderModal: React.FC<AddedToOrderModalProps> = ({
  lastAddedItem,
  totalCartCount,
  totalAmount,
  onContinue,
  onCheckout,
  language,
}) => {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss countdown after 3.2 seconds
  useEffect(() => {
    sound.playAdd();
    const duration = 3200;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 select-none">
      <div className="w-full max-w-3xl bg-white border border-[#D4D4D4] rounded-xl flex flex-col overflow-hidden text-[#292929] relative">
        {/* Top Progress bar */}
        <div className="w-full h-1 bg-[#E5E5E5]">
          <div
            className="h-full bg-[#FFBC0D] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: The Mascot (Ludzik z McDonald's) */}
          <div className="flex flex-col items-center shrink-0">
            <HappyMascot
              size={150}
              message="Pycha wybór!"
              waving={true}
            />
          </div>

          {/* Center: The Iconic McDonald's Bag with Number Counter Badge */}
          <div className="flex flex-col items-center shrink-0 relative">
            <div className="relative w-40 h-52 bg-[#C49A6C] rounded-lg flex flex-col justify-between p-3 border-2 border-[#A87B4E]">
              <div className="w-full h-4 bg-[#A87B4E] rounded opacity-80" />

              <div className="flex flex-col items-center justify-center my-auto">
                <OfficialLogo className="w-16 h-14" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5C3D1E] mt-1">
                  i&apos;m lovin&apos; it
                </span>
              </div>

              <div className="w-full border-t border-dashed border-[#8C6036] pt-1 text-center">
                <span className="text-[9px] font-bold text-[#6D4723]">MCDONALD&apos;S</span>
              </div>

              {/* Floating Counter Badge with the exact number of items (Cyferka na torbie) */}
              <div className="absolute -top-3 -right-3 w-11 h-11 bg-[#DB0007] text-white border-4 border-white rounded-full flex items-center justify-center font-black text-xl">
                {totalCartCount}
              </div>
            </div>

            <span className="text-xs font-bold text-[#6B7280] mt-3">
              Pozycji w torbie: <strong className="text-[#111]">{totalCartCount}</strong>
            </span>
          </div>

          {/* Right: Added Item Info & Confirmation Headline */}
          <div className="flex-1 flex flex-col justify-center space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#E6F4EA] text-[#008837] text-xs font-extrabold uppercase">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Dodano do zamówienia</span>
              </div>
              <h2 className="text-2xl font-black text-[#111] leading-tight">
                {lastAddedItem.menuItem.name}
              </h2>
            </div>

            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg p-3 flex items-center gap-3">
              <img
                src={lastAddedItem.menuItem.image}
                alt={lastAddedItem.menuItem.name}
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-[#111] block truncate">
                  {lastAddedItem.mealSize !== 'single'
                    ? lastAddedItem.mealSize === 'large'
                      ? 'McZestaw Powiększony'
                      : 'McZestaw ze średnimi frytkami'
                    : 'Pojedynczy produkt'}
                </span>
                <span className="text-sm font-black text-[#111] block">
                  +{lastAddedItem.totalPrice.toFixed(2).replace('.', ',')} zł
                </span>
              </div>
            </div>

            <div className="text-xs text-[#6B7280]">
              Wartość zamówienia:{' '}
              <strong className="text-[#111] text-sm font-black">
                {totalAmount.toFixed(2).replace('.', ',')} zł
              </strong>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-5 bg-white border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              sound.playTap();
              onContinue();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#111] font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4 text-[#4B5563]" />
            <span>Kontynuuj zamawianie</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onCheckout();
            }}
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111] font-extrabold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>Przejdź do kasy ({totalAmount.toFixed(2).replace('.', ',')} zł)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
