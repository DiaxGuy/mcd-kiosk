import React from 'react';
import { Accessibility } from 'lucide-react';
import { Language, OrderType } from '../types';
import { translations } from '../utils/translations';
import { sound } from '../utils/audio';
import { OfficialLogo } from './OfficialLogo';

interface HeaderProps {
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  currentCategoryTitle: string;
  accessibleMode: boolean;
  onToggleAccessible: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  orderType,
  setOrderType,
  language,
  setLanguage,
  onReset,
  currentCategoryTitle,
  accessibleMode,
  onToggleAccessible,
}) => {
  const t = translations[language];

  return (
    <header className="h-16 bg-white border-b border-[#E5E5E5] flex items-center justify-between select-none z-20 shrink-0">
      {/* Left: Logo Column aligned with Sidebar + Crisp Category Title */}
      <div className="flex items-center h-full">
        <button
          onClick={() => {
            sound.playTap();
            onReset();
          }}
          className="w-48 lg:w-56 h-full px-5 border-r border-[#E5E5E5] flex items-center justify-start gap-3 hover:bg-[#FAFAFA] transition-colors"
          title="Powrót do ekranu startowego"
        >
          <OfficialLogo className="w-10 h-9" />
        </button>

        <div className="px-6">
          <h1 className="text-2xl font-extrabold text-[#292929] tracking-tight leading-none">
            {currentCategoryTitle}
          </h1>
        </div>
      </div>

      {/* Right: Clean Minimal McDonald's Utility Controls (No pill bubbles or emojis) */}
      <div className="px-6 flex items-center space-x-2.5">
        <button
          onClick={() => {
            sound.playTap();
            setOrderType(orderType === 'dine_in' ? 'take_away' : 'dine_in');
          }}
          className="h-9 px-3.5 rounded border border-[#D4D4D4] bg-white hover:bg-[#FAFAFA] text-xs font-bold text-[#292929] flex items-center gap-2 transition-colors"
        >
          <span>{orderType === 'dine_in' ? t.eatIn : t.takeAway}</span>
          <span className="text-[11px] font-semibold text-[#6B7280] underline">Zmień</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            onToggleAccessible();
          }}
          className={`w-9 h-9 rounded border flex items-center justify-center transition-colors ${
            accessibleMode
              ? 'bg-[#FFBC0D] text-[#111] border-[#FFBC0D]'
              : 'bg-white text-[#292929] border-[#D4D4D4] hover:bg-[#FAFAFA]'
          }`}
          title="Ułatwienia dostępu"
        >
          <Accessibility className="w-4 h-4" />
        </button>

        <div className="flex items-center border border-[#D4D4D4] rounded overflow-hidden bg-white h-9">
          {(['pl', 'en', 'ua'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                sound.playTap();
                setLanguage(lang);
              }}
              className={`h-full px-3 text-xs font-bold uppercase transition-colors ${
                language === lang
                  ? 'bg-[#FFBC0D] text-[#111111]'
                  : 'text-[#6B7280] hover:text-[#111111]'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
