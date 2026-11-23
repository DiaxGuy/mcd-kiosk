import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Banknote, X, CheckCircle, Wifi, ShieldCheck, ArrowRight } from 'lucide-react';
import { PaymentMethod, Language } from '../types';
import { translations } from '../utils/translations';
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
  language,
}) => {
  const t = translations[language];

  const [step, setStep] = useState<'choose_method' | 'terminal_processing' | 'approved'>('choose_method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [terminalStage, setTerminalStage] = useState<'waiting_card' | 'reading' | 'authorizing' | 'success'>('waiting_card');
  const [cardTapped, setCardTapped] = useState(false);

  // Auto trigger card tap after 3.5s if user hasn't clicked
  useEffect(() => {
    if (step === 'terminal_processing' && !cardTapped) {
      const autoTapTimer = setTimeout(() => {
        handleTapCard();
      }, 3500);
      return () => clearTimeout(autoTapTimer);
    }
  }, [step, cardTapped]);

  const handleSelectMethod = (method: PaymentMethod) => {
    sound.playTap();
    setSelectedMethod(method);
    if (method === 'cashier') {
      setStep('approved');
      setTimeout(() => {
        onPaymentSuccess('cashier');
      }, 1200);
    } else {
      setStep('terminal_processing');
      setTerminalStage('waiting_card');
    }
  };

  const handleTapCard = () => {
    if (cardTapped) return;
    setCardTapped(true);
    sound.playCardBeep();
    setTerminalStage('reading');

    setTimeout(() => {
      setTerminalStage('authorizing');

      setTimeout(() => {
        setTerminalStage('success');
        sound.playSuccess();

        setTimeout(() => {
          onPaymentSuccess(selectedMethod);
        }, 1500);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-white border border-[#E5E7EB] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#1F1F1F]">
        {/* Top Header */}
        <div className="p-6 bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <OfficialLogo className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-black text-[#111]">
                {step === 'choose_method' ? t.paymentTitle : 'Terminal Płatniczy Kiosku'}
              </h2>
              <span className="text-xs text-[#6B7280]">
                Do zapłaty:{' '}
                <strong className="text-[#111] text-sm font-black">
                  {totalAmount.toFixed(2).replace('.', ',')} zł
                </strong>
              </span>
            </div>
          </div>

          {step === 'choose_method' && (
            <button
              onClick={() => {
                sound.playTap();
                onCancel();
              }}
              className="w-10 h-10 rounded-full bg-[#E5E7EB] hover:bg-mcd-red hover:text-white text-[#4B5563] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP 1: CHOOSE PAYMENT METHOD */}
        {step === 'choose_method' && (
          <div className="p-8 space-y-4">
            {/* Card Payment (Default) */}
            <button
              onClick={() => handleSelectMethod('card')}
              className="group w-full p-5 rounded-2xl bg-white hover:bg-[#FFFBEB] border-2 border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-mcd-yellow text-black flex items-center justify-center font-bold">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                    {t.payCard}
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    Karta płatnicza, Apple Pay, Google Pay, zbliżeniowo lub chip
                  </span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-mcd-yellow" />
            </button>

            {/* BLIK Payment */}
            <button
              onClick={() => handleSelectMethod('blik')}
              className="group w-full p-5 rounded-2xl bg-white hover:bg-[#F9FAFB] border-2 border-[#E5E7EB] hover:border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-[#F3F4F6] text-[#111] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center font-black text-lg transition-colors">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                    {t.payBlik}
                  </span>
                  <span className="text-xs text-[#6B7280]">6-cyfrowy kod z aplikacji Twojego banku</span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-[#9CA3AF] group-hover:text-mcd-yellow" />
            </button>

            {/* Cashier Payment */}
            <button
              onClick={() => handleSelectMethod('cashier')}
              className="group w-full p-5 rounded-2xl bg-white hover:bg-[#F9FAFB] border-2 border-[#E5E7EB] hover:border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-[#F3F4F6] text-[#111] group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center font-bold transition-colors">
                  <Banknote className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                    {t.payCash}
                  </span>
                  <span className="text-xs text-[#6B7280]">Zapłać gotówką lub bonem przy stanowisku kasowym</span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-[#9CA3AF] group-hover:text-mcd-yellow" />
            </button>
          </div>
        )}

        {/* STEP 2: POS TERMINAL SIMULATION (Matches the Verifone terminal on photo) */}
        {step === 'terminal_processing' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 bg-[#FAFAFA]">
            {/* Terminal Main Instruction Header */}
            <div className="bg-white border-2 border-mcd-yellow px-6 py-3 rounded-2xl max-w-lg shadow-sm">
              <span className="text-xs font-black uppercase tracking-wider text-mcd-red block animate-pulse">
                Instrukcja terminala
              </span>
              <p className="text-base font-extrabold text-[#111] mt-0.5">
                {t.terminalInstruction}
              </p>
            </div>

            {/* Simulated Verifone Terminal Physical Device (as seen in photo) */}
            <div className="w-80 bg-[#1E1E1E] border-4 border-[#333333] rounded-3xl p-5 shadow-2xl flex flex-col items-center relative text-white">
              {/* Terminal Screen Glass */}
              <div className="w-full bg-[#0D1410] border-2 border-[#1E2D24] rounded-xl p-4 text-[#89F5A2] font-mono text-left mb-3 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#1E2D24] pb-1.5 mb-2 text-[10px]">
                  <OfficialLogo className="w-5 h-5 text-mcd-yellow" />
                  <span className="text-[#6DB881]">Verifone • Kiosk #04</span>
                  <Wifi className="w-3.5 h-3.5" />
                </div>

                <div className="text-center my-2">
                  <span className="text-[10px] block text-[#6DB881]">KWOTA DO ZAPŁATY:</span>
                  <span className="text-2xl font-bold text-white tracking-wider">
                    {totalAmount.toFixed(2).replace('.', ',')} PLN
                  </span>
                </div>

                {/* Status on Terminal Screen */}
                <div className="text-center py-2 bg-black/60 rounded-lg text-xs font-bold">
                  {terminalStage === 'waiting_card' && (
                    <span className="text-yellow-300 animate-pulse">ZBILIŻ LUB WŁÓŻ KARTĘ</span>
                  )}
                  {terminalStage === 'reading' && (
                    <span className="text-cyan-300">ODCZYT KARTY...</span>
                  )}
                  {terminalStage === 'authorizing' && (
                    <span className="text-yellow-400">TRWA AUTORYZACJA...</span>
                  )}
                  {terminalStage === 'success' && (
                    <span className="text-emerald-400 font-black">PŁATNOŚĆ ZAAKCEPTOWANA</span>
                  )}
                </div>
              </div>

              {/* 4 LED Indicators */}
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    terminalStage !== 'waiting_card'
                      ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]'
                      : 'bg-emerald-800 border-emerald-900'
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    terminalStage === 'reading' || terminalStage === 'authorizing' || terminalStage === 'success'
                      ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_8px_#facc15]'
                      : 'bg-yellow-800 border-yellow-900'
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    terminalStage === 'authorizing' || terminalStage === 'success'
                      ? 'bg-yellow-400 border-yellow-300 shadow-[0_0_8px_#facc15]'
                      : 'bg-yellow-800 border-yellow-900'
                  }`}
                />
                <div
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    terminalStage === 'success'
                      ? 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_#34d399]'
                      : 'bg-emerald-800 border-emerald-900'
                  }`}
                />
              </div>

              {/* Physical Keypad (Matches the Verifone keypad in photo) */}
              <div className="w-full bg-[#141414] rounded-xl p-2.5 grid grid-cols-3 gap-1.5 text-center text-xs font-bold text-gray-300 mb-3 border border-[#282828]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '✖', '0', '✓'].map((key) => (
                  <div
                    key={key}
                    className={`py-1.5 rounded bg-[#242424] border border-[#333] shadow-inner ${
                      key === '✓' ? 'text-emerald-400 font-black' : key === '✖' ? 'text-red-400 font-black' : ''
                    }`}
                  >
                    {key}
                  </div>
                ))}
              </div>

              {/* Contactless / NFC Wave Zone */}
              <div className="w-full h-16 bg-[#252525] rounded-xl border-2 border-dashed border-[#444] flex items-center justify-center space-x-2 relative overflow-hidden">
                <Wifi className="w-5 h-5 text-mcd-yellow rotate-90" />
                <span className="text-[11px] font-bold text-gray-300">Zbliż kartę lub telefon</span>

                {cardTapped && (
                  <div className="absolute inset-x-2 inset-y-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg p-2 shadow-2xl flex items-center justify-between text-black animate-terminal">
                    <CreditCard className="w-5 h-5" />
                    <span className="font-mono text-xs font-black">•••• 8824</span>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Tap simulator button */}
            {terminalStage === 'waiting_card' && (
              <button
                onClick={handleTapCard}
                className="px-8 py-4 rounded-2xl bg-mcd-yellow hover:bg-[#e5a80b] text-black font-black text-sm lg:text-base flex items-center gap-3 shadow-glow-yellow transition-all transform active:scale-95 animate-pulse"
              >
                <CreditCard className="w-5 h-5" />
                <span>{t.simulateTap}</span>
              </button>
            )}

            {terminalStage !== 'waiting_card' && (
              <div className="flex items-center gap-2 text-sm text-[#4B5563] font-semibold">
                <div className="w-4 h-4 border-2 border-mcd-yellow border-t-transparent rounded-full animate-spin" />
                <span>{t.authorizing}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: APPROVED SCREEN */}
        {step === 'approved' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-500 animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-[#111]">{t.paymentApproved}</h3>
            <p className="text-sm text-[#6B7280]">Dziękujemy! Przygotowujemy Twój paragon i numer zamówienia...</p>
          </div>
        )}
      </div>
    </div>
  );
};
