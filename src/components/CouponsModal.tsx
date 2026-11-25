import React, { useState } from 'react';
import { X, Delete, Check, QrCode } from 'lucide-react';
import { AppliedCoupon } from '../types';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface CouponsModalProps {
  cartTotal: number;
  appliedCoupon: AppliedCoupon | null;
  onApplyCoupon: (coupon: AppliedCoupon | null) => void;
  onClose: () => void;
}

const PRESET_COUPONS = [
  {
    code: 'DRWAL10',
    title: 'Burger Drwala + Frytki',
    subtitle: 'Rabat -10,00 zł na zamówienie',
    discount: 10.0,
    minTotal: 25.0,
    image: 'https://cdn.mcdonalds.pl/uploads/20261104143818/pl10-p00001662-drwal-2026-na-www-1090x664px-burger-drwala-klasyczny.png',
  },
  {
    code: '2FORU',
    title: 'OkazYEAH! 2forU®',
    subtitle: 'Zniżka -5,00 zł w koszyku',
    discount: 5.0,
    minTotal: 12.0,
    image: 'https://cdn.mcdonalds.pl/uploads/20200617144103/mcd-www-packshoty-singlepage-2foru-1.png',
  },
  {
    code: 'MOJEM20',
    title: 'Zniżka MojeM -20%',
    subtitle: 'Na całe Twoje zamówienie',
    percent: 0.2,
    minTotal: 15.0,
    image: 'https://cdn.mcdonalds.pl/uploads/20240708120552/354267-big-mac-na-www-1090x664px-mczestaw.png',
  },
  {
    code: 'FRYTKI',
    title: 'Średnie Frytki Gratis',
    subtitle: 'Rabat -7,90 zł przy zamówieniu',
    discount: 7.9,
    minTotal: 18.0,
    image: 'https://cdn.mcdonalds.pl/uploads/20241104114431/354308-nowe-frytki-2024-na-www-1090x664px-2-frytki-srednie.png',
  },
];

export const CouponsModal: React.FC<CouponsModalProps> = ({
  cartTotal,
  appliedCoupon,
  onApplyCoupon,
  onClose,
}) => {
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDigit = (digit: string) => {
    sound.playTap();
    setError(null);
    if (codeInput.length < 6) {
      setCodeInput((prev) => prev + digit);
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_COUPONS)[number]) => {
    sound.playTap();
    if (cartTotal < preset.minTotal) {
      setError(`Minimalna kwota dla tej oferty to ${preset.minTotal.toFixed(2).replace('.', ',')} zł.`);
      return;
    }
    const discountAmount = preset.percent
      ? Number((cartTotal * preset.percent).toFixed(2))
      : preset.discount!;

    sound.playSuccess();
    onApplyCoupon({
      code: preset.code,
      title: preset.title,
      discountAmount: Math.min(cartTotal, discountAmount),
      pointsEarned: Math.round(cartTotal * 10),
    });
    onClose();
  };

  const handleApplyManualCode = () => {
    const cleaned = codeInput.trim().toUpperCase();
    if (cleaned.length < 4) {
      setError('Wpisz 4-cyfrowy kod z aplikacji McDonald’s.');
      return;
    }

    if (cartTotal <= 0) {
      setError('Dodaj najpierw produkty do zamówienia.');
      return;
    }

    const loyaltyDiscount = Math.min(cartTotal, Number((cartTotal * 0.15).toFixed(2)));
    sound.playSuccess();
    onApplyCoupon({
      code: cleaned,
      title: `Kupon MojeM (${cleaned})`,
      discountAmount: loyaltyDiscount,
      pointsEarned: Math.round(cartTotal * 10) + 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 select-none">
      <div className="w-full max-w-4xl bg-white border border-[#D4D4D4] rounded-xl overflow-hidden text-[#292929] flex flex-col">
        {/* Clean Official MojeM Header */}
        <div className="px-7 py-5 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <OfficialLogo className="w-10 h-9" />
            <div>
              <h2 className="text-xl font-extrabold text-[#111]">MojeM</h2>
              <p className="text-xs text-[#6B7280] font-semibold">
                Zeskanuj kod z aplikacji lub wpisz kod jednorazowy
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-9 h-9 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#4B5563] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Coupon Notice */}
        {appliedCoupon && (
          <div className="mx-7 mt-5 px-4 py-3 bg-[#E6F4EA] border border-[#008837]/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#008837]">
              <Check className="w-4 h-4" />
              <span>
                Aktywny kupon {appliedCoupon.code} (−{appliedCoupon.discountAmount.toFixed(2).replace('.', ',')} zł)
              </span>
            </div>
            <button
              onClick={() => {
                sound.playTap();
                onApplyCoupon(null);
              }}
              className="px-3 py-1 rounded border border-[#D4D4D4] bg-white text-xs font-bold text-[#DB0007] hover:bg-[#FEF2F2]"
            >
              Usuń
            </button>
          </div>
        )}

        {/* Two-column EOTF Layout: Left = App Code Keypad | Right = Visual OkazYEAH Coupons */}
        <div className="p-7 grid grid-cols-1 md:grid-cols-12 gap-7 bg-white">
          {/* Left: App 4-digit Code Entry */}
          <div className="md:col-span-5 flex flex-col justify-between border border-[#E5E5E5] rounded-lg p-5 bg-[#FAFAFA]">
            <div className="space-y-3 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#4A4A4A]">
                <QrCode className="w-4 h-4 text-[#111]" />
                <span>Kod z aplikacji</span>
              </div>

              {/* 4-digit visual slots */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-12 h-14 rounded-md border-2 bg-white flex items-center justify-center font-black text-2xl text-[#111] ${
                      codeInput[i] ? 'border-[#FFBC0D]' : 'border-[#D4D4D4]'
                    }`}
                  >
                    {codeInput[i] || ''}
                  </div>
                ))}
              </div>
              {error && <p className="text-xs font-bold text-[#DB0007]">{error}</p>}
            </div>

            {/* Clean Flat Numeric Keypad */}
            <div className="space-y-2.5 mt-3">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDigit(d)}
                    className="h-11 rounded border border-[#D4D4D4] bg-white hover:bg-[#FFFDF5] active:bg-[#FFBC0D] font-extrabold text-lg text-[#111]"
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={() => {
                    sound.playTap();
                    setCodeInput('');
                    setError(null);
                  }}
                  className="h-11 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-xs font-bold text-[#6B7280]"
                >
                  Wyczyść
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="h-11 rounded border border-[#D4D4D4] bg-white hover:bg-[#FFFDF5] active:bg-[#FFBC0D] font-extrabold text-lg text-[#111]"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    setCodeInput((p) => p.slice(0, -1));
                  }}
                  className="h-11 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-[#111] flex items-center justify-center"
                >
                  <Delete className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleApplyManualCode}
                disabled={codeInput.length < 4}
                className="w-full py-3 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] disabled:bg-[#E5E5E5] disabled:text-[#9CA3AF] text-[#111] font-extrabold text-sm transition-colors"
              >
                Zatwierdź kod
              </button>
            </div>
          </div>

          {/* Right: Visual McDonald's Coupon Cards with Real Food Photos */}
          <div className="md:col-span-7 flex flex-col">
            <h3 className="text-sm font-extrabold text-[#111] mb-3">
              Moje OkazYEAH! (dotknij, aby aktywować)
            </h3>
            <div className="grid grid-cols-2 gap-3.5 flex-1">
              {PRESET_COUPONS.map((preset) => (
                <button
                  key={preset.code}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-3.5 rounded-lg bg-white hover:bg-[#FFFDF5] border border-[#E5E5E5] hover:border-[#FFBC0D] flex flex-col items-center text-center justify-between transition-colors"
                >
                  <img
                    src={preset.image}
                    alt={preset.title}
                    className="h-20 w-full object-contain my-1"
                  />
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm text-[#111] block leading-tight">
                      {preset.title}
                    </span>
                    <span className="text-xs font-bold text-[#008837] block">
                      {preset.subtitle}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF] block">
                      Min. {preset.minTotal.toFixed(0)} zł
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
