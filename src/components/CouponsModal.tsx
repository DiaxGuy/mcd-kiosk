import React, { useState } from 'react';
import { X, QrCode, Tag, Sparkles, CheckCircle2, Smartphone } from 'lucide-react';
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
    title: 'Zima z Drwalem: -10,00 zł na zamówienie',
    discount: 10.0,
    minTotal: 25.0,
    badge: 'HIT SEZONU',
  },
  {
    code: '2FORU',
    title: 'OkazYEAH! 2forU: -5,00 zł rabatu',
    discount: 5.0,
    minTotal: 12.0,
    badge: 'POPULARNE',
  },
  {
    code: 'MOJEM20',
    title: 'Kupon MojeM: -20% na całą tackę',
    percent: 0.2,
    minTotal: 15.0,
    badge: 'MOJEM',
  },
  {
    code: 'FRYTKI',
    title: 'Chrupiące Frytki gratis (-7,90 zł)',
    discount: 7.9,
    minTotal: 18.0,
    badge: 'APP EXCLUSIVE',
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

  const handleApplyPreset = (preset: (typeof PRESET_COUPONS)[number]) => {
    sound.playTap();
    if (cartTotal < preset.minTotal) {
      setError(`Minimalna wartość koszyka dla kuponu ${preset.code} to ${preset.minTotal.toFixed(2)} zł.`);
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

  const handleApplyManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = codeInput.trim().toUpperCase();
    if (cleaned.length < 4) {
      setError('Wpisz minimum 4-znakowy kod z aplikacji McDonald’s.');
      return;
    }

    const matched = PRESET_COUPONS.find((p) => p.code === cleaned);
    if (matched) {
      handleApplyPreset(matched);
      return;
    }

    // Any valid 4-digit/4-char MojeM app code unlocks a 15% loyalty discount
    if (cartTotal <= 0) {
      setError('Dodaj najpierw produkty do zamówienia, aby użyć kodu MojeM.');
      return;
    }

    const loyaltyDiscount = Math.min(cartTotal, Number((cartTotal * 0.15).toFixed(2)));
    sound.playSuccess();
    onApplyCoupon({
      code: cleaned,
      title: `Kod MojeM (${cleaned}): -15% rabatu`,
      discountAmount: loyaltyDiscount,
      pointsEarned: Math.round(cartTotal * 10) + 100,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl overflow-hidden text-[#1F1F1F]">
        {/* Header */}
        <div className="p-6 bg-[#111111] text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <OfficialLogo className="w-10 h-9" />
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <span>MojeM Rewards & OkazYEAH!</span>
                <Sparkles className="w-4 h-4 text-mcd-yellow" />
              </h2>
              <p className="text-xs text-gray-300">
                Zeskanuj kod z aplikacji McDonald&apos;s lub wybierz aktywny kupon rabatowy
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-mcd-red text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-[#F9FAFB]">
          {/* Active Coupon Banner */}
          {appliedCoupon && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-black text-sm text-emerald-900 block">
                    Aktywny kupon: {appliedCoupon.code}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium">
                    {appliedCoupon.title} (-{appliedCoupon.discountAmount.toFixed(2).replace('.', ',')} zł)
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  onApplyCoupon(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-red-600 hover:bg-red-50"
              >
                Usuń kupon
              </button>
            </div>
          )}

          {/* Manual App Code Input */}
          <form onSubmit={handleApplyManualCode} className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-sm font-black text-[#111]">
              <Smartphone className="w-4 h-4 text-mcd-yellow" />
              <span>Wpisz 4-znakowy kod z aplikacji MojeM (np. 1234 lub DRWAL10)</span>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <QrCode className="w-5 h-5 text-[#9CA3AF] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setError(null);
                    setCodeInput(e.target.value.toUpperCase());
                  }}
                  placeholder="Wpisz kod z aplikacji..."
                  maxLength={12}
                  className="w-full pl-11 pr-4 py-3 bg-[#F3F4F6] border border-[#D1D5DB] rounded-xl font-black text-base tracking-widest uppercase focus:outline-none focus:border-mcd-yellow"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-mcd-yellow hover:bg-[#EAB308] text-black font-black text-sm transition-all active:scale-95 shadow-sm"
              >
                Aktywuj kod
              </button>
            </div>
            {error && <p className="text-xs font-bold text-mcd-red">{error}</p>}
          </form>

          {/* Ready-to-use Kupony OkazYEAH */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#6B7280] mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-mcd-red" />
              <span>Dostępne kupony OkazYEAH! (Kliknij, aby użyć)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRESET_COUPONS.map((preset) => (
                <button
                  key={preset.code}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-4 rounded-2xl bg-white hover:bg-[#FFFBEB] border-2 border-[#E5E7EB] hover:border-mcd-yellow text-left transition-all active:scale-98 flex flex-col justify-between space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="px-2.5 py-0.5 rounded-full bg-mcd-red text-white text-[10px] font-black tracking-wider">
                      {preset.badge}
                    </span>
                    <span className="font-mono font-black text-xs text-[#6B7280] bg-[#F3F4F6] px-2 py-0.5 rounded">
                      {preset.code}
                    </span>
                  </div>
                  <p className="font-extrabold text-sm text-[#111] leading-snug">
                    {preset.title}
                  </p>
                  <span className="text-[11px] text-[#6B7280] font-semibold">
                    Min. zamówienie: {preset.minTotal.toFixed(2).replace('.', ',')} zł
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
