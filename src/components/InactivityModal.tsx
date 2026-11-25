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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/70 select-none">
      <div className="w-full max-w-md bg-white border border-[#D4D4D4] rounded-xl overflow-hidden text-center">
        <div className="h-2.5 bg-[#FFBC0D]" />
        <div className="p-7 space-y-5">
        <div className="flex justify-center">
          <OfficialLogo className="w-12 h-11" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-[#111]">Czy nadal składasz zamówienie?</h2>
          <p className="text-xs text-[#6B7280] font-semibold">
            Kiosk powróci do ekranu startowego za {secondsLeft} s
          </p>
        </div>

        <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#FFBC0D] transition-all duration-1000 ease-linear"
            style={{ width: `${(secondsLeft / 10) * 100}%` }}
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => {
              sound.playTap();
              onTimeoutReset();
            }}
            className="flex-1 py-3 rounded-md border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-[#4A4A4A] font-bold text-sm flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Anuluj</span>
          </button>

          <button
            onClick={() => {
              sound.playSuccess();
              onContinue();
            }}
            className="flex-1 py-3 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] text-[#111] font-extrabold text-sm flex items-center justify-center gap-1.5"
          >
            <span>Tak, kontynuuj</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
