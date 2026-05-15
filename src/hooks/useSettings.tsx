import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Currency = 'IDR' | 'USD' | 'EUR';
type Language = 'id' | 'en';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  id: {
    'dashboard.welcome': 'Halo, {name}',
    'dashboard.profit': 'Keuntungan Bersih',
    'dashboard.income': 'Pemasukan',
    'dashboard.expense': 'Pengeluaran',
    'settings.title': 'Pengaturan',
    'settings.language': 'Bahasa',
    'settings.currency': 'Mata Uang',
  },
  en: {
    'dashboard.welcome': 'Hello, {name}',
    'dashboard.profit': 'Net Profit',
    'dashboard.income': 'Income',
    'dashboard.expense': 'Expense',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
  }
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('app_currency') as Currency) || 'IDR';
  });
  
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'id';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('app_currency', c);
  };

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem('app_language', l);
  };

  const formatCurrency = (amount: number) => {
    switch (currency) {
      case 'USD':
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount / 15000); // Dummy conversion rate
      case 'EUR':
        return new Intl.NumberFormat("de-DE", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount / 16000); // Dummy conversion rate
      case 'IDR':
      default:
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
    }
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, language, setLanguage, formatCurrency, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
