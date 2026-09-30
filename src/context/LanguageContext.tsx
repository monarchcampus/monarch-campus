import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'si' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (siText: string, enText: string) => string;
  isSinhala: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('monarch_language');
    if (saved === 'en' || saved === 'si') return saved;
    return 'si'; // Default to Sinhala as requested for local Sri Lankan campus
  });

  useEffect(() => {
    localStorage.setItem('monarch_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'si' ? 'en' : 'si'));
  };

  const t = (siText: string, enText: string) => {
    return language === 'si' ? siText : enText;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isSinhala: language === 'si',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
