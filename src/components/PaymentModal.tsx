import React, { useState } from 'react';
import { X, Check, ArrowRight, Delete, Banknote, Smartphone } from 'lucide-react';
import { PaymentMethod, Language } from '../types';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface PaymentModalProps {
  totalAmount: number;
  onPaymentSuccess: (method: PaymentMethod) => void;
  onCancel: () => void;
  language: Language;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  onPaymentSuccess,
  onCancel,
}) => {
  const [step, setStep] = useState<'choose_method' | 'blik_input' | 'blik_confirming' | 'cashier_confirm' | 'approved'>('choose_method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('blik');
  const [blikCode, setBlikCode] = useState('');

  const handleDigit = (digit: string) => {
    sound.playTap();
    if (blikCode.length < 6) {
      setBlikCode((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    sound.playTap();
    setBlikCode((prev) => prev.slice(0, -1));
  };

  const handleBlikSubmit = () => {
    if (blikCode.length !== 6) return;
    sound.playTap();
    setStep('blik_confirming');

    setTimeout(() => {
      sound.playSuccess();
      setStep('approved');
      setTimeout(() => {
        onPaymentSuccess('blik');
      }, 1100);
    }, 1700);
  };

  const handleCashierConfirm = () => {
    sound.playSuccess();
    setStep('approved');
    setTimeout(() => {
      onPaymentSuccess('cashier');
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 select-none">
      <div className="w-full max-w-2xl bg-white border border-[#D4D4D4] rounded-xl flex flex-col overflow-hidden text-[#292929]">
        {/* Header */}
        <div className="px-7 py-5 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <OfficialLogo className="w-10 h-9" />
            <div>
              <h2 className="text-xl font-extrabold text-[#111]">
                {step === 'choose_method'
                  ? 'Jak chcesz zapłacić?'
                  : step === 'blik_input' || step === 'blik_confirming'
                  ? 'Płatność BLIK'
                  : step === 'approved'
                  ? 'Płatność przyjęta'
                  : 'Płatność przy kasie'}
              </h2>
              <span className="text-xs text-[#6B7280] font-semibold">
                Do zapłaty:{' '}
                <strong className="text-[#111] font-black">
                  {totalAmount.toFixed(2).replace('.', ',')} zł
                </strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onCancel();
            }}
            className="w-9 h-9 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#4B5563] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHOOSE METHOD */}
        {step === 'choose_method' && (
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white">
            {/* 1. BLIK */}
            <button
              onClick={() => {
                sound.playTap();
                setSelectedMethod('blik');
                setBlikCode('');
                setStep('blik_input');
              }}
              className="p-6 rounded-lg bg-white hover:bg-[#FFFDF5] border-2 border-[#FFBC0D] flex flex-col items-center text-center space-y-4 transition-colors"
            >
              <div className="w-20 h-14 rounded-md bg-[#111111] text-white flex items-center justify-center gap-1.5 font-black text-xl tracking-tight">
                <span>BLIK</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-[#111] block">Zapłać BLIK-iem</span>
                <span className="text-xs text-[#6B7280] font-semibold block mt-1">
                  Wpisz 6-cyfrowy kod z telefonu
                </span>
              </div>
              <span className="mt-auto px-4 py-1.5 rounded bg-[#FFBC0D] text-[#111] text-xs font-extrabold">
                Wybierz BLIK
              </span>
            </button>

            {/* 2. Cashier */}
            <button
              onClick={() => {
                sound.playTap();
                setSelectedMethod('cashier');
                setStep('cashier_confirm');
              }}
              className="p-6 rounded-lg bg-white hover:bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-[#FFBC0D] flex flex-col items-center text-center space-y-4 transition-colors"
            >
              <div className="w-20 h-14 rounded-md bg-[#F5F5F5] border border-[#E5E5E5] text-[#111] flex items-center justify-center">
                <Banknote className="w-8 h-8 text-[#292929]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-[#111] block">Zapłać przy kasie</span>
                <span className="text-xs text-[#6B7280] font-semibold block mt-1">
                  Gotówka lub karta u pracownika
                </span>
              </div>
              <span className="mt-auto px-4 py-1.5 rounded border border-[#D4D4D4] text-[#292929] text-xs font-extrabold">
                Wybierz kasę
              </span>
            </button>
          </div>
        )}

        {/* STEP 2: BLIK 6-DIGIT KEYPAD (Flat Official Style) */}
        {step === 'blik_input' && (
          <div className="p-7 flex flex-col sm:flex-row items-center gap-8 bg-white">
            {/* Left: 6 individual digit boxes */}
            <div className="flex-1 flex flex-col items-center text-center space-y-4">
              <div className="px-3.5 py-1.5 rounded bg-[#111111] text-white font-black text-base tracking-tight inline-flex items-center gap-1.5">
                <span>BLIK</span>
                <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
              </div>

              <div>
                <p className="text-base font-extrabold text-[#111]">Wpisz kod BLIK</p>
                <p className="text-xs text-[#6B7280] mt-0.5">6 cyfr z Twojej aplikacji bankowej</p>
              </div>

              <div className="flex items-center gap-2 py-2">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 rounded border-2 flex items-center justify-center font-black text-2xl text-[#111] ${
                        blikCode[i] ? 'border-[#FFBC0D] bg-[#FFFDF5]' : 'border-[#D4D4D4] bg-white'
                      }`}
                    >
                      {blikCode[i] || ''}
                    </div>
                  ))}
                </div>
                <span className="text-[#9CA3AF] font-bold">–</span>
                <div className="flex gap-1.5">
                  {[3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`w-10 h-12 rounded border-2 flex items-center justify-center font-black text-2xl text-[#111] ${
                        blikCode[i] ? 'border-[#FFBC0D] bg-[#FFFDF5]' : 'border-[#D4D4D4] bg-white'
                      }`}
                    >
                      {blikCode[i] || ''}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setStep('choose_method');
                }}
                className="text-xs font-bold text-[#6B7280] hover:text-[#111] underline"
              >
                Zmień metodę płatności
              </button>
            </div>

            {/* Right: Flat Keypad */}
            <div className="w-full max-w-[260px] space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDigit(d)}
                    className="h-12 rounded border border-[#D4D4D4] bg-[#FAFAFA] hover:bg-[#FFFDF5] active:bg-[#FFBC0D] text-[#111] font-extrabold text-xl transition-colors"
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={() => {
                    sound.playTap();
                    setBlikCode('');
                  }}
                  className="h-12 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-[#6B7280] font-bold text-xs"
                >
                  Wyczyść
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="h-12 rounded border border-[#D4D4D4] bg-[#FAFAFA] hover:bg-[#FFFDF5] active:bg-[#FFBC0D] text-[#111] font-extrabold text-xl transition-colors"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-12 rounded border border-[#D4D4D4] bg-white hover:bg-[#F5F5F5] text-[#111] flex items-center justify-center"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleBlikSubmit}
                disabled={blikCode.length !== 6}
                className="w-full py-3.5 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] disabled:bg-[#E5E5E5] disabled:text-[#9CA3AF] text-[#111] font-extrabold text-sm transition-colors"
              >
                Zapłać {totalAmount.toFixed(2).replace('.', ',')} zł
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: BLIK PHONE CONFIRMATION */}
        {step === 'blik_confirming' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-5 bg-white">
            <div className="w-16 h-16 rounded-lg bg-[#111111] text-white flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-[#FFBC0D]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#111]">Potwierdź płatność na telefonie</h3>
              <p className="text-xs text-[#6B7280] font-semibold">
                Oczekiwanie na akceptację w aplikacji bankowej...
              </p>
            </div>
            <div className="w-9 h-9 border-4 border-[#FFBC0D] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* STEP 3: CASHIER */}
        {step === 'cashier_confirm' && (
          <div className="p-8 space-y-6 text-center bg-white">
            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-[#111]">Zapłać przy kasie</h3>
              <p className="text-sm text-[#6B7280] max-w-md mx-auto">
                Odbierz wydruk z numerem zamówienia i zapłać pracownikowi przy odbiorze.
              </p>
            </div>

            <div className="py-4 px-6 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg inline-block">
              <span className="text-xs font-bold text-[#6B7280] block">Kwota do zapłaty:</span>
              <span className="text-3xl font-black text-[#111] block mt-0.5">
                {totalAmount.toFixed(2).replace('.', ',')} zł
              </span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep('choose_method');
                }}
                className="px-6 py-3 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#111] font-bold text-sm"
              >
                Wróć
              </button>

              <button
                onClick={handleCashierConfirm}
                className="px-8 py-3 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111] font-extrabold text-sm flex items-center gap-2"
              >
                <span>Zatwierdzam i odbieram numerek</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: APPROVED */}
        {step === 'approved' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-white">
            <div className="w-16 h-16 rounded-full bg-[#008837] text-white flex items-center justify-center">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-[#111]">Płatność zaakceptowana</h3>
            <p className="text-sm text-[#6B7280] font-semibold">
              {selectedMethod === 'blik'
                ? 'Drukowanie numeru zamówienia...'
                : 'Zamówienie przekazane — podejdź do kasy.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
