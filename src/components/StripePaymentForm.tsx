import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface StripePaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (errorMessage: string) => void;
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  totalAmount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    sound.playCardBeep();
    setProcessing(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Klient Kiosku McDonald\'s',
            email: 'kiosk@mcdonalds.pl',
          },
        },
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'Płatność została odrzucona przez bank');
        setProcessing(false);
        onError(result.error.message || 'Błąd transakcji');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        sound.playSuccess();
        onSuccess(result.paymentIntent.id);
      }
    } catch (err: any) {
      console.error('Stripe submit error:', err);
      setErrorMessage(err.message || 'Wystąpił błąd podczas autoryzacji');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Stripe Card Element Box */}
      <div className="p-4 bg-white border-2 border-[#E5E7EB] rounded-2xl shadow-inner focus-within:border-mcd-yellow transition-colors">
        <div className="flex items-center justify-between mb-2 text-xs font-bold text-[#6B7280]">
          <span className="flex items-center gap-1.5 text-[#111]">
            <CreditCard className="w-4 h-4 text-mcd-yellow" />
            <span>Dane karty płatniczej (Stripe Sandbox)</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600">
            <Lock className="w-3 h-3" />
            <span>Szyfrowane 256-bit</span>
          </span>
        </div>

        <div className="py-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#111111',
                  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#DB0007',
                },
              },
            }}
          />
        </div>
      </div>

      {/* Helpful Test Card Hint & Autofill */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-xs text-[#92400E]">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Karta testowa Stripe: <strong>4242 •••• 4242</strong> (dowolna data & CVC)</span>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-sm transition-all transform active:scale-98 ${
          processing
            ? 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed'
            : 'bg-mcd-yellow hover:bg-[#EAB308] text-black shadow-glow-yellow'
        }`}
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-3 border-black border-t-transparent rounded-full animate-spin" />
            <span>Autoryzacja w toku (Stripe)...</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            <span>ZAPŁAĆ TERAZ ({totalAmount.toFixed(2).replace('.', ',')} ZŁ)</span>
          </>
        )}
      </button>
    </form>
  );
};
