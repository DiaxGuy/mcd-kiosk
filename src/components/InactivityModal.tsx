import React, { useEffect, useState } from 'react';
import { Clock, RotateCcw, ArrowRight } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';
import { sound } from '../utils/audio';

interface InactivityModalProps {
  onContinue: () => void;
  onTimeoutReset: () => void;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  onContinue,
  onTimeoutReset,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeoutReset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTimeoutReset]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-md bg-white border-4 border-mcd-yellow rounded-3xl p-8 text-center shadow-2xl space-y-5">
        <div className="flex justify-center">
          <OfficialLogo className="w-16 h-14" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-[#111]">Czy nadal składasz zamówienie?</h2>
          <p className="text-sm text-[#6B7280] font-medium">
            Nie wykryliśmy aktywności. Kiosk powróci do ekranu startowego za:
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-50 border border-red-200 text-mcd-red font-black text-2xl">
          <Clock className="w-6 h-6" />
          <span>{secondsLeft} s</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full bg-mcd-yellow transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 10) * 100}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              sound.playTap();
              onTimeoutReset();
            }}
            className="flex-1 py-3.5 rounded-2xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] font-bold text-sm flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Anuluj zamówienie</span>
          </button>

          <button
            onClick={() => {
              sound.playSuccess();
              onContinue();
            }}
            className="flex-1 py-3.5 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] text-black font-black text-sm flex items-center justify-center gap-2 shadow-md"
          >
            <span>Tak, kontynuuj</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
