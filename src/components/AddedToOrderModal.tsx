import React, { useEffect, useState } from 'react';
import { ArrowRight, Check, Utensils } from 'lucide-react';
import { CartItem, Language } from '../types';
import { HappyMascot } from './HappyMascot';
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
}) => {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss countdown after 3.5 seconds
  useEffect(() => {
    sound.playAdd();
    const duration = 3500;
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
      <div className="w-full max-w-3xl bg-white border border-[#D4D4D4] rounded-xl flex flex-col overflow-hidden text-[#292929]">
        {/* Thin top timer bar */}
        <div className="w-full h-1 bg-[#E5E5E5]">
          <div
            className="h-full bg-[#FFBC0D] transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Main Content on Pure White */}
        <div className="p-8 bg-white flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Official 3D Happy Mascot */}
          <div className="shrink-0 flex items-center justify-center">
            <HappyMascot size={185} />
          </div>

          {/* Center: Real McDonald's Kraft Paper Bag + Crisp Red Number Badge */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="relative w-44 h-48 flex items-center justify-center">
              <img
                src="/images/mcd-bag.jpg"
                alt="Torba McDonald's"
                className="w-full h-full object-contain mix-blend-multiply"
              />
              {/* Crisp Red Number Counter Badge */}
              <div className="absolute top-2 right-2 w-11 h-11 bg-[#DB0007] text-white border-4 border-white rounded-full flex items-center justify-center font-black text-xl">
                {totalCartCount}
              </div>
            </div>
            <span className="text-xs font-bold text-[#6B7280] mt-1">
              W torbie: <strong className="text-[#111]">{totalCartCount} szt.</strong>
            </span>
          </div>

          {/* Right: Clean Confirmation Summary */}
          <div className="flex-1 flex flex-col justify-center space-y-4 text-center md:text-left">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#008837]">
                <Check className="w-4 h-4 stroke-[3]" />
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
                className="w-14 h-12 object-contain shrink-0"
              />
              <div className="text-left min-w-0">
                <span className="text-xs font-bold text-[#4A4A4A] block truncate">
                  {lastAddedItem.mealSize !== 'single'
                    ? lastAddedItem.mealSize === 'large'
                      ? 'McZestaw Powiększony'
                      : 'McZestaw'
                    : 'Pojedynczy produkt'}
                </span>
                <span className="text-sm font-black text-[#111] block">
                  {lastAddedItem.totalPrice.toFixed(2).replace('.', ',')} zł
                </span>
              </div>
            </div>

            <div className="text-xs text-[#6B7280] font-semibold">
              Razem do zapłaty:{' '}
              <strong className="text-[#111] text-base font-black">
                {totalAmount.toFixed(2).replace('.', ',')} zł
              </strong>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-7 py-4 bg-white border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4">
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
