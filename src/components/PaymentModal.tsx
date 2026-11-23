import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Banknote, X, CheckCircle, Wifi, ShieldCheck, ArrowRight } from 'lucide-react';
import { PaymentMethod, Language } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';

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

  // Auto trigger tap after 2.5s if user hasn't clicked
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
      // Cashier payment approves right away
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

    // Stage 1: reading card
    setTimeout(() => {
      setTerminalStage('authorizing');

      // Stage 2: transaction authorized
      setTimeout(() => {
        setTerminalStage('success');
        sound.playSuccess();

        // Stage 3: finalize order
        setTimeout(() => {
          onPaymentSuccess(selectedMethod);
        }, 1500);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-[#1A1A1A] border-2 border-[#333333] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-6 bg-[#222222] border-b border-[#303030] flex items-center justify-between">
          <div>
            <h2 className="text-xl lg:text-2xl font-black text-white">
              {step === 'choose_method' ? t.paymentTitle : 'Terminal Płatniczy'}
            </h2>
            <span className="text-xs text-[#A0A0A0]">
              Do zapłaty:{' '}
              <strong className="text-mcd-yellow text-sm font-black">
                {totalAmount.toFixed(2).replace('.', ',')} zł
              </strong>
            </span>
          </div>

          {step === 'choose_method' && (
            <button
              onClick={() => {
                sound.playTap();
                onCancel();
              }}
              className="w-10 h-10 rounded-full bg-[#2E2E2E] hover:bg-mcd-red text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* STEP 1: CHOOSE PAYMENT METHOD */}
        {step === 'choose_method' && (
          <div className="p-8 space-y-4">
            {/* Card Payment (Default & Recommended) */}
            <button
              onClick={() => handleSelectMethod('card')}
              className="group w-full p-5 rounded-2xl bg-[#222222] hover:bg-[#2A2A2A] border-2 border-mcd-yellow hover:border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-glow-yellow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-mcd-yellow text-black flex items-center justify-center font-bold">
                  <CreditCard className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-white block group-hover:text-mcd-yellow transition-colors">
                    {t.payCard}
                  </span>
                  <span className="text-xs text-[#A0A0A0]">
                    Karta płatnicza, Apple Pay, Google Pay, zbliżeniowo lub chip
                  </span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-mcd-yellow" />
            </button>

            {/* BLIK Payment */}
            <button
              onClick={() => handleSelectMethod('blik')}
              className="group w-full p-5 rounded-2xl bg-[#222222] hover:bg-[#2A2A2A] border-2 border-[#383838] hover:border-mcd-yellow flex items-center justify-between transition-all active:scale-98"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-[#2E2E2E] text-white group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center font-black text-lg transition-colors">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-white block group-hover:text-mcd-yellow transition-colors">
                    {t.payBlik}
                  </span>
                  <span className="text-xs text-[#A0A0A0]">6-cyfrowy kod z aplikacji Twojego banku</span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-[#777] group-hover:text-mcd-yellow" />
            </button>

            {/* Cash / Counter Payment */}
            <button
              onClick={() => handleSelectMethod('cashier')}
              className="group w-full p-5 rounded-2xl bg-[#222222] hover:bg-[#2A2A2A] border-2 border-[#383838] hover:border-mcd-yellow flex items-center justify-between transition-all active:scale-98"
            >
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-[#2E2E2E] text-white group-hover:bg-mcd-yellow group-hover:text-black flex items-center justify-center font-bold transition-colors">
                  <Banknote className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-black text-white block group-hover:text-mcd-yellow transition-colors">
                    {t.payCash}
                  </span>
                  <span className="text-xs text-[#A0A0A0]">Zapłać gotówką lub bonem przy stanowisku kasowym</span>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-[#777] group-hover:text-mcd-yellow" />
            </button>
          </div>
        )}

        {/* STEP 2: POS TERMINAL SIMULATION */}
        {step === 'terminal_processing' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            {/* Terminal Main Instruction Header */}
            <div className="bg-[#242424] border border-[#3E3E3E] px-6 py-3 rounded-2xl max-w-lg shadow-inner">
              <span className="text-xs font-black uppercase tracking-wider text-mcd-yellow block animate-pulse">
                Instrukcja terminala
              </span>
              <p className="text-base font-extrabold text-white mt-0.5">
                {t.terminalInstruction}
              </p>
            </div>

            {/* Simulated POS Terminal Physical Device */}
            <div className="w-80 bg-[#111111] border-4 border-[#2D2D2D] rounded-3xl p-5 shadow-2xl flex flex-col items-center relative">
              {/* Terminal Screen Glass */}
              <div className="w-full bg-[#18261E] border-2 border-[#2F4436] rounded-xl p-4 text-[#89F5A2] font-mono text-left mb-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-[#2F4436] pb-1.5 mb-2 text-[10px]">
                  <span>McDonald's #04</span>
                  <Wifi className="w-3.5 h-3.5" />
                </div>

                <div className="text-center my-3">
                  <span className="text-xs block text-[#6DB881]">KWOTA DO ZAPŁATY:</span>
                  <span className="text-2xl font-bold text-white tracking-wider">
                    {totalAmount.toFixed(2).replace('.', ',')} PLN
                  </span>
                </div>

                {/* Status on Terminal Screen */}
                <div className="text-center py-2 bg-black/40 rounded-lg text-xs font-bold">
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
              <div className="flex items-center space-x-3 mb-4">
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

              {/* Contactless / NFC Wave Zone */}
              <div className="w-full h-24 bg-[#1F1F1F] rounded-2xl border-2 border-dashed border-[#3A3A3A] flex flex-col items-center justify-center p-2 relative overflow-hidden">
                <Wifi className="w-8 h-8 text-mcd-yellow rotate-90 mb-1" />
                <span className="text-[11px] font-bold text-[#A0A0A0]">Strefa płatności zbliżeniowej</span>

                {/* Animated credit card sliding in */}
                {cardTapped && (
                  <div className="absolute inset-x-4 top-2 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-xl p-2.5 shadow-2xl flex items-center justify-between text-black animate-terminal">
                    <CreditCard className="w-6 h-6" />
                    <span className="font-mono text-xs font-black">•••• 8824</span>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Tap Simulator Button */}
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
              <div className="flex items-center gap-2 text-sm text-[#A0A0A0] font-semibold">
                <div className="w-4 h-4 border-2 border-mcd-yellow border-t-transparent rounded-full animate-spin" />
                <span>{t.authorizing}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: APPROVED SCREEN */}
        {step === 'approved' && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500 animate-bounce">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-white">{t.paymentApproved}</h3>
            <p className="text-sm text-[#A0A0A0]">Dziękujemy! Przygotowujemy Twój paragon i numer zamówienia...</p>
          </div>
        )}
      </div>
    </div>
  );
};
