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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-white border-2 border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1F1F1F] relative">
        {/* Top Progress bar */}
        <div className="w-full h-1.5 bg-[#E5E7EB]">
          <div
            className="h-full bg-mcd-yellow transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: The Mascot (Ludzik z McDonald's) */}
          <div className="flex flex-col items-center shrink-0">
            <HappyMascot
              size={160}
              message="Pycha wybór! Mniam!"
              waving={true}
            />
          </div>

          {/* Center: The Iconic McDonald's Bag with Number Counter Badge */}
          <div className="flex flex-col items-center shrink-0 relative">
            {/* McDonald's Craft Paper Bag Illustration */}
            <div className="relative w-44 h-56 bg-[#C49A6C] rounded-2xl shadow-xl flex flex-col justify-between p-3 border-2 border-[#A87B4E] transform -rotate-1 hover:rotate-0 transition-transform">
              {/* Bag Fold Top */}
              <div className="w-full h-5 bg-[#A87B4E] rounded-t-lg opacity-80" />

              {/* Golden Arches on Bag */}
              <div className="flex flex-col items-center justify-center my-auto">
                <OfficialLogo className="w-16 h-14 drop-shadow-md" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#5C3D1E] mt-1">
                  i'm lovin' it
                </span>
              </div>

              {/* Bottom Bag Crease */}
              <div className="w-full border-t border-dashed border-[#8C6036] pt-1 text-center">
                <span className="text-[9px] font-bold text-[#6D4723]">MCDONALD'S TO GO</span>
              </div>

              {/* Floating Counter Badge with the exact number of items (Cyferka na torbie) */}
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-mcd-red text-white border-4 border-white rounded-full flex items-center justify-center font-black text-xl shadow-lg animate-bounce">
                {totalCartCount}
              </div>
            </div>

            <span className="text-xs font-bold text-[#6B7280] mt-3">
              Liczba pozycji w torbie: <strong className="text-black">{totalCartCount}</strong>
            </span>
          </div>

          {/* Right: Added Item Info & Confirmation Headline */}
          <div className="flex-1 flex flex-col justify-center space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Dodano do Twojego zamówienia</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-black text-[#111] leading-tight">
                {lastAddedItem.menuItem.name}
              </h2>
            </div>

            {/* Item Card Details */}
            <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl p-3 flex items-center gap-3">
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
                    : 'Pojedyncza kanapka'}
                </span>
                <span className="text-sm font-black text-mcd-red block">
                  +{lastAddedItem.totalPrice.toFixed(2).replace('.', ',')} zł
                </span>
              </div>
            </div>

            <div className="text-xs text-[#6B7280]">
              Wartość całej tacki:{' '}
              <strong className="text-black text-sm font-black">
                {totalAmount.toFixed(2).replace('.', ',')} zł
              </strong>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-[#F9FAFB] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => {
              sound.playTap();
              onContinue();
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111] font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Utensils className="w-4 h-4 text-[#4B5563]" />
            <span>Kontynuuj zamawianie</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              onCheckout();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] text-black font-black text-base flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-95"
          >
            <span>Przejdź do kasy ({totalAmount.toFixed(2).replace('.', ',')} zł)</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
