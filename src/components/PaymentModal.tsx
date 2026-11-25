import React, { useState } from 'react';
import { CreditCard, Banknote, X, CheckCircle, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react';
import { PaymentMethod, Language, CartItem, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface PaymentModalProps {
  items: CartItem[];
  orderType: OrderType;
  totalAmount: number;
  onPaymentSuccess: (method: PaymentMethod, paymentIntentId?: string) => void;
  onCancel: () => void;
  language: Language;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  items,
  orderType,
  totalAmount,
  onPaymentSuccess,
  onCancel,
  language,
}) => {
  const t = translations[language];

  // Screen steps: 'choose_method' | 'stripe_redirect' | 'cashier_confirm' | 'approved'
  const [step, setStep] = useState<'choose_method' | 'stripe_redirect' | 'cashier_confirm' | 'approved'>('choose_method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');

  // Stripe Checkout redirect state
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Create Stripe Checkout Session and redirect user to hosted Stripe page
  const handleSelectStripe = async () => {
    sound.playTap();
    setSelectedMethod('stripe');
    setStep('stripe_redirect');
    setStripeLoading(true);
    setStripeError(null);

    try {
      sessionStorage.setItem(
        'mcd_pending_checkout',
        JSON.stringify({ cart: items, orderType })
      );

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          orderType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      } else {
        throw new Error(data.error || 'Nie udało się utworzyć sesji Stripe Checkout');
      }
    } catch (err: any) {
      console.error('Failed to create Checkout Session:', err);
      setStripeError(err.message || 'Błąd połączenia z bramką Stripe');
      setStripeLoading(false);
    }
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
    }, 1200);
  };

  const handleStripeSuccess = (paymentIntentId: string) => {
    setStep('approved');
    setTimeout(() => {
      onPaymentSuccess('stripe', paymentIntentId);
    }, 1500);
  };

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
                  : step === 'stripe_redirect'
                  ? 'Przekierowanie do Stripe'
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

        {/* STEP 1: CHOOSE PAYMENT METHOD (Only 2 choices as requested: Zapłać tutaj kartą / Zapłać przy kasie) */}
        {step === 'choose_method' && (
          <div className="p-8 space-y-4">
            <div className="text-center mb-2">
              <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">
                Jak chcesz uregulować rachunek?
              </span>
            </div>

            {/* 1. Zapłać tutaj kartą (Stripe) */}
            <button
              onClick={handleSelectStripe}
              className="group w-full p-6 rounded-2xl bg-white hover:bg-[#FFFBEB] border-2 border-mcd-yellow flex items-center justify-between transition-all active:scale-98 shadow-sm"
            >
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-2xl bg-mcd-yellow text-black flex items-center justify-center font-bold shadow-sm">
                  <CreditCard className="w-9 h-9" />
                </div>
                <div className="text-left">
                  <span className="text-xl font-black text-[#111] block group-hover:text-mcd-red transition-colors">
                    Zapłać tutaj kartą (Stripe)
                  </span>
                  <span className="text-xs text-[#6B7280] block mt-0.5 font-medium">
                    Karta płatnicza, kredytowa lub debetowa • Bezpieczna bramka Stripe Sandbox
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

        {/* STEP 2: STRIPE CHECKOUT REDIRECT */}
        {step === 'stripe_redirect' && (
          <div className="p-8 space-y-6 bg-[#FAFAFA] text-center">
            {stripeLoading && !stripeError && (
              <div className="py-10 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-mcd-yellow border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-[#111] flex items-center justify-center gap-2">
                    <span>Przekierowywanie na stronę Stripe...</span>
                    <ExternalLink className="w-5 h-5 text-mcd-yellow" />
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Za chwilę zostaniesz przeniesiony do bezpiecznej strony płatności Stripe Sandbox.
                  </p>
                </div>
              </div>
            )}

            {stripeError && (
              <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm space-y-3 text-left">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>Nie udało się przekierować do Stripe</span>
                </div>
                <p className="text-xs">{stripeError}</p>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSelectStripe}
                    className="px-4 py-2 rounded-xl bg-mcd-yellow text-black font-black text-xs"
                  >
                    Spróbuj ponownie
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setStep('choose_method');
                    }}
                    className="px-4 py-2 rounded-xl bg-white border border-[#E5E7EB] text-[#111] font-bold text-xs"
                  >
                    Wróć
                  </button>
                </div>
              </div>
            )}
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
              {selectedMethod === 'stripe'
                ? 'Transakcja Stripe powiodła się! Drukujemy paragon...'
                : 'Zamówienie przekazane do kasy! Drukujemy numerek...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
