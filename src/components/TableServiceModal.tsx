import React, { useState } from 'react';
import { X, Delete, Store, Utensils } from 'lucide-react';
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
        <div className="px-7 py-5 bg-white border-b border-[#E5E5E5] flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <OfficialLogo className="w-10 h-9" />
            <div>
              <h2 className="text-xl font-extrabold text-[#111]">
                {mode === 'choose' ? 'Gdzie podać zamówienie?' : 'Wpisz numer lokalizatora'}
              </h2>
              <p className="text-xs text-[#6B7280] font-semibold">
                Zamówienie na miejscu • Wybierz sposób odbioru
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
          <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 bg-white">
            {/* Option 1: Table Service */}
            <button
              onClick={() => {
                sound.playTap();
                setMode('keypad');
              }}
              className="p-6 rounded-lg bg-white hover:bg-[#FFFDF5] border-2 border-[#FFBC0D] flex flex-col items-center text-center space-y-4 transition-colors"
            >
              <div className="w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 80 80" className="w-16 h-16">
                  <path d="M18 68 L28 16 L52 16 L62 68 Z" fill="#FFBC0D" stroke="#D97706" strokeWidth="2.5" strokeLinejoin="round" />
                  <rect x="26" y="30" width="28" height="22" rx="3" fill="#FFFFFF" />
                  <text x="40" y="46" textAnchor="middle" fill="#111111" fontSize="14" fontWeight="900">14</text>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#111]">Przynieście do stolika</h3>
                <p className="text-xs text-[#6B7280] mt-1 font-semibold">
                  Weź żółty numerek ze stojaka i wpisz jego numer
                </p>
              </div>
              <span className="mt-auto px-4 py-1.5 rounded bg-[#FFBC0D] text-[#111] text-xs font-extrabold">
                Wpisz numer stolika
              </span>
            </button>

            {/* Option 2: Counter Pickup */}
            <button
              onClick={() => {
                sound.playTap();
                onSelectTable(null);
              }}
              className="p-6 rounded-lg bg-white hover:bg-[#FAFAFA] border-2 border-[#E5E5E5] hover:border-[#FFBC0D] flex flex-col items-center text-center space-y-4 transition-colors"
            >
              <div className="w-20 h-20 rounded-md bg-[#F5F5F5] border border-[#E5E5E5] flex items-center justify-center">
                <Store className="w-10 h-10 text-[#292929]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#111]">Odbiorę przy ladzie</h3>
                <p className="text-xs text-[#6B7280] mt-1 font-semibold">
                  Poczekaj przy ladzie i odbierz po wywołaniu numeru
                </p>
              </div>
              <span className="mt-auto px-4 py-1.5 rounded border border-[#D4D4D4] text-[#292929] text-xs font-extrabold">
                Odbiór przy ladzie
              </span>
            </button>
          </div>
        ) : (
          <div className="p-7 flex flex-col sm:flex-row items-center gap-8 bg-white">
            {/* Left: Clean Official Tent Preview */}
            <div className="flex-1 flex flex-col items-center space-y-4">
              <div className="w-40 border-2 border-[#E5E5E5] rounded-lg overflow-hidden bg-white text-center">
                <div className="h-2.5 bg-[#FFBC0D]" />
                <div className="p-5 flex flex-col items-center">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#6B7280]">
                    <Utensils className="w-3.5 h-3.5 text-[#FFBC0D]" />
                    <span>Lokalizator</span>
                  </div>
                  <span className="text-6xl font-black text-[#111] tracking-tight mt-2 block leading-none">
                    {tableInput || '--'}
                  </span>
                  <span className="text-[11px] font-semibold text-[#6B7280] mt-3 block">
                    Numer 1–99
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  setMode('choose');
                }}
                className="text-xs font-bold text-[#6B7280] hover:text-[#111] underline"
              >
                Zmień na odbiór przy ladzie
              </button>
            </div>

            {/* Right: Clean Flat Numeric Keypad (matching BLIK & MojeM) */}
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
                    setTableInput('');
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
                onClick={handleConfirmTable}
                disabled={!tableInput || Number(tableInput) <= 0}
                className="w-full py-3.5 rounded-md bg-[#FFBC0D] hover:bg-[#F5B300] disabled:bg-[#E5E5E5] disabled:text-[#9CA3AF] text-[#111] font-extrabold text-sm transition-colors"
              >
                Zatwierdź stolik {tableInput ? `#${tableInput}` : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
