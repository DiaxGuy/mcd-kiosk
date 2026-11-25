import React, { useState } from 'react';
import { Banknote, X, CheckCircle, ArrowRight, Smartphone, Delete, ShieldCheck } from 'lucide-react';
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

    // Simulate bank app confirmation
    setTimeout(() => {
      sound.playSuccess();
      setStep('approved');
      setTimeout(() => {
        onPaymentSuccess('blik');
      }, 1100);
    }, 1800);
  };

  const handleSelectCashier = () => {
    sound.playTap();
    setSelectedMethod('cashier');
    setStep('cashier_confirm');
  };

  const handleCashierConfirm = () => {
    sound.playSuccess();
    setStep('approved');
    setTimeout(() => {
      onPaymentSuccess('cashier');
    }, 1100);
  };

  const formattedBlik =
    blikCode.length > 3 ? `${blikCode.slice(0, 3)} ${blikCode.slice(3)}` : blikCode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1F1F1F]">
        {/* Top Header */}
        <div className="p-6 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <OfficialLogo className="w-9 h-8" />
            <div>
              <h2 className="text-xl font-black text-[#111]">
                {step === 'choose_method'
                  ? 'Wybierz sposób płatności'
                  : step === 'blik_input' || step === 'blik_confirming'
                  ? 'Płatność BLIK'
                  : step === 'approved'
                  ? 'Płatność zakończona'
                  : 'Płatność przy kasie'}
              </h2>
              <span className="text-xs text-[#6B7280]">
                Łączna kwota do zapłaty:{' '}
                <strong className="text-[#111] text-sm font-black">
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
            className="w-10 h-10 rounded-full bg-[#E5E7EB] hover:bg-mcd-red hover:text-white text-[#4B5563] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHOOSE PAYMENT METHOD */}
        {step === 'choose_method' && (
          <div className="p-8 space-y-4">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
                Jak chcesz uregulować rachunek?
              </span>
            </div>

            {/* 1. Zapłać BLIK-iem */}
            <button
              onClick={() => {
                sound.playTap();
                setSelectedMethod('blik');
                setBlikCode('');
                setStep('blik_input');
              }}
              className="group w-full p-6 rounded-2xl bg-white hover:bg-[#FFFBEB] border-2 border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-sm"
            >
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-[#111111] text-white flex flex-col items-center justify-center font-black shadow-sm">
                  <span className="text-base tracking-tight leading-none">BLIK</span>
                  <span className="w-6 h-1 bg-[#E11D48] rounded-full mt-1" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                    Zapłać BLIK-iem
                  </span>
                  <span className="text-xs text-[#6B7280] block mt-0.5 font-medium">
                    Wpisz 6-cyfrowy kod z aplikacji bankowej
                  </span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-mcd-yellow group-hover:translate-x-1 transition-transform" />
            </button>

            {/* 2. Zapłać przy kasie */}
            <button
              onClick={handleSelectCashier}
              className="group w-full p-6 rounded-2xl bg-white hover:bg-[#F9FAFB] border-2 border-[#E5E7EB] hover:border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-sm"
            >
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] text-[#111] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center font-bold transition-colors shadow-sm">
                  <Banknote className="w-9 h-9" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                    Zapłać przy kasie
                  </span>
                  <span className="text-xs text-[#6B7280] block mt-0.5 font-medium">
                    Gotówka, karta lub bony u pracownika przy ladzie odbioru
                  </span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-[#9CA3AF] group-hover:text-mcd-yellow group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* STEP 2: FAKE BLIK 6-DIGIT KEYPAD */}
        {step === 'blik_input' && (
          <div className="p-8 flex flex-col sm:flex-row items-center gap-8 bg-[#FAFAFA]">
            {/* Left: BLIK Code Display */}
            <div className="flex-1 flex flex-col items-center text-center space-y-4">
              <div className="px-4 py-1.5 rounded-xl bg-[#111111] text-white font-black text-lg tracking-wider inline-flex items-center gap-2">
                <span>BLIK</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" />
              </div>

              <div>
                <p className="text-sm font-extrabold text-[#111]">Wpisz 6-cyfrowy kod BLIK</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Otwórz aplikację banku i podaj dowolne 6 cyfr
                </p>
              </div>

              {/* 6-digit box */}
              <div className="w-full max-w-xs py-4 px-5 bg-white border-2 border-mcd-yellow rounded-2xl shadow-inner">
                <span className="font-mono text-4xl font-black tracking-[0.2em] text-[#111]">
                  {formattedBlik || '___ ___'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playTap();
                  setStep('choose_method');
                }}
                className="text-xs font-bold text-[#6B7280] hover:text-[#111] underline"
              >
                ← Wróć do wyboru metody płatności
              </button>
            </div>

            {/* Right: Touch Numeric Keypad */}
            <div className="w-full max-w-xs space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDigit(d)}
                    className="h-13 py-3 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-mcd-yellow text-[#111] font-black text-xl transition-all active:scale-95 shadow-sm"
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={() => {
                    sound.playTap();
                    setBlikCode('');
                  }}
                  className="py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-mcd-red font-extrabold text-xs transition-all active:scale-95"
                >
                  WYCZYŚĆ
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="py-3 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-mcd-yellow text-[#111] font-black text-xl transition-all active:scale-95 shadow-sm"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="py-3 rounded-2xl bg-white border border-[#E5E7EB] hover:bg-[#E5E7EB] text-[#111] flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleBlikSubmit}
                disabled={blikCode.length !== 6}
                className="w-full py-4 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-black font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Zapłać {totalAmount.toFixed(2).replace('.', ',')} zł</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2B: BLIK BANK APP CONFIRMATION */}
        {step === 'blik_confirming' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-[#111111] text-white flex items-center justify-center shadow-lg">
                <Smartphone className="w-10 h-10 text-mcd-yellow animate-pulse" />
              </div>
              <div className="w-6 h-6 rounded-full bg-[#E11D48] border-2 border-white absolute -top-1 -right-1 animate-ping" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#111]">Potwierdź w aplikacji bankowej</h3>
              <p className="text-sm text-[#6B7280] max-w-sm">
                Wysłaliśmy powiadomienie BLIK na Twój telefon (kod <strong className="font-mono text-[#111]">{formattedBlik}</strong>)...
              </p>
            </div>
            <div className="w-10 h-10 border-4 border-mcd-yellow border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* STEP 3: CASHIER PAYMENT CONFIRMATION */}
        {step === 'cashier_confirm' && (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-mcd-yellow/20 text-black flex items-center justify-center mx-auto">
              <Banknote className="w-8 h-8 text-mcd-yellow" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#111]">Płatność przy kasie</h3>
              <p className="text-sm text-[#4B5563] max-w-md mx-auto">
                Twoje zamówienie zostanie natychmiast wysłane do kuchni. Odbierzesz paragon z numerkiem i uregulujesz należność przy odbiorze.
              </p>
            </div>

            <div className="p-4 bg-[#F8F9FA] border border-[#E5E7EB] rounded-2xl inline-block max-w-sm w-full">
              <span className="text-xs font-bold text-[#6B7280] block">Do zapłaty przy kasie:</span>
              <span className="text-3xl font-black text-[#111] block mt-1">
                {totalAmount.toFixed(2).replace('.', ',')} zł
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep('choose_method');
                }}
                className="px-6 py-3.5 rounded-2xl bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111] font-bold text-sm transition-colors"
              >
                Wróć
              </button>

              <button
                onClick={handleCashierConfirm}
                className="px-8 py-3.5 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] text-black font-black text-base shadow-sm transition-all transform active:scale-95"
              >
                Zatwierdzam i odbieram numerek
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: APPROVED SCREEN */}
        {step === 'approved' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-500 animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-[#111]">PŁATNOŚĆ ZAAKCEPTOWANA</h3>
            <p className="text-sm text-[#6B7280]">
              {selectedMethod === 'blik'
                ? 'Płatność BLIK potwierdzona! Drukujemy paragon...'
                : 'Zamówienie wysłane! Podejdź do kasy z numerkiem.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
