import React, { useState } from 'react';
import { X, Delete, CheckCircle2, Store, Utensils } from 'lucide-react';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface TableServiceModalProps {
  onSelectTable: (tableNumber: string | null) => void;
  onCancel: () => void;
}

export const TableServiceModal: React.FC<TableServiceModalProps> = ({
  onSelectTable,
  onCancel,
}) => {
  const [mode, setMode] = useState<'choose' | 'keypad'>('choose');
  const [tableInput, setTableInput] = useState('');

  const handleDigit = (digit: string) => {
    sound.playTap();
    if (tableInput.length < 2) {
      setTableInput((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    sound.playTap();
    setTableInput((prev) => prev.slice(0, -1));
  };

  const handleConfirmTable = () => {
    if (!tableInput || Number(tableInput) <= 0) return;
    sound.playSuccess();
    onSelectTable(tableInput.padStart(2, '0'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 select-none">
      <div className="w-full max-w-2xl bg-white border border-[#D4D4D4] rounded-xl overflow-hidden text-[#292929]">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <OfficialLogo className="w-9 h-8" />
            <div>
              <h2 className="text-xl font-extrabold text-[#111]">
                {mode === 'choose' ? 'Gdzie podać zamówienie?' : 'Wpisz numer lokalizatora'}
              </h2>
              <p className="text-xs text-[#6B7280] font-medium">
                Zamówienie na miejscu • Obsługa stolikowa McDonald&apos;s
              </p>
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

        {mode === 'choose' ? (
          <div className="p-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Option 1: Table Service */}
            <button
              onClick={() => {
                sound.playTap();
                setMode('keypad');
              }}
              className="group p-6 rounded-lg bg-[#FFFDF5] hover:bg-[#FFF9E6] border-2 border-[#FFBC0D] flex flex-col items-center text-center space-y-4 transition-colors"
            >
              {/* Yellow McDonald's Table Tent SVG */}
              <div className="w-24 h-24 rounded-2xl bg-white border border-mcd-yellow/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 80 80" className="w-16 h-16">
                  <path d="M18 68 L28 16 L52 16 L62 68 Z" fill="#FFBC0D" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round" />
                  <rect x="26" y="30" width="28" height="22" rx="4" fill="#FFFFFF" />
                  <text x="40" y="46" textAnchor="middle" fill="#111111" fontSize="14" fontWeight="900">14</text>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-[#111]">Przynieście do stolika</h3>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">
                  Weź żółty numerek ze stojaka obok kiosku i wpisz jego numer
                </p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-mcd-yellow text-black text-xs font-black">
                Wpisz numer →
              </span>
            </button>

            {/* Option 2: Counter Pickup */}
            <button
              onClick={() => {
                sound.playTap();
                onSelectTable(null);
              }}
              className="group p-6 rounded-3xl bg-white hover:bg-[#F9FAFB] border-2 border-[#E5E7EB] hover:border-mcd-yellow flex flex-col items-center text-center space-y-4 transition-all active:scale-95 shadow-sm"
            >
              <div className="w-24 h-24 rounded-2xl bg-[#F3F4F6] flex items-center justify-center text-[#111] group-hover:bg-mcd-yellow/20 transition-colors">
                <Store className="w-12 h-12 text-[#374151]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#111]">Odbiorę przy ladzie</h3>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">
                  Poczekaj przy strefie odbioru i obserwuj swój numer na ekranie
                </p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-[#F3F4F6] text-[#111] text-xs font-black">
                Wybierz odbiór przy ladzie
              </span>
            </button>
          </div>
        ) : (
          <div className="p-8 flex flex-col sm:flex-row items-center gap-8">
            {/* Left: Visual Tent Preview */}
            <div className="flex flex-col items-center space-y-3 sm:w-56">
              <div className="w-40 h-44 bg-[#FFFBEB] border-2 border-mcd-yellow rounded-3xl flex flex-col items-center justify-center shadow-inner relative">
                <Utensils className="w-5 h-5 text-mcd-yellow absolute top-3 right-3" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#92400E]">
                  Lokalizator
                </span>
                <span className="text-6xl font-black text-[#111] tracking-tighter mt-1">
                  {tableInput || '--'}
                </span>
                <span className="text-[11px] font-bold text-[#6B7280] mt-2">
                  Numer stolika (1–99)
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  setMode('choose');
                }}
                className="text-xs font-bold text-[#6B7280] hover:text-[#111] underline"
              >
                ← Zmień na odbiór przy ladzie
              </button>
            </div>

            {/* Right: Touch Numeric Keypad */}
            <div className="flex-1 w-full max-w-xs space-y-4">
              <div className="grid grid-cols-3 gap-2.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDigit(d)}
                    className="h-14 rounded-2xl bg-[#F3F4F6] hover:bg-mcd-yellow text-[#111] font-black text-2xl transition-all active:scale-95 shadow-sm"
                  >
                    {d}
                  </button>
                ))}
                <button
                  onClick={() => {
                    sound.playTap();
                    setTableInput('');
                  }}
                  className="h-14 rounded-2xl bg-red-50 hover:bg-red-100 text-mcd-red font-extrabold text-xs transition-all active:scale-95"
                >
                  WYCZYŚĆ
                </button>
                <button
                  onClick={() => handleDigit('0')}
                  className="h-14 rounded-2xl bg-[#F3F4F6] hover:bg-mcd-yellow text-[#111] font-black text-2xl transition-all active:scale-95 shadow-sm"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="h-14 rounded-2xl bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#111] flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  <Delete className="w-6 h-6" />
                </button>
              </div>

              <button
                onClick={handleConfirmTable}
                disabled={!tableInput || Number(tableInput) <= 0}
                className="w-full py-4 rounded-2xl bg-mcd-yellow hover:bg-[#EAB308] disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] text-black font-black text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Zatwierdź stolik {tableInput ? `#${tableInput}` : ''}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
