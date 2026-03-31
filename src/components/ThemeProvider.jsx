'use client';

import { useEffect } from 'react';
import useStore from '@/lib/store';

export default function ThemeProvider({ children }) {
  const theme = useStore((state) => state.theme);
  const language = useStore((state) => state.language);
  const setTheme = useStore((state) => state.setTheme);
  const setLanguage = useStore((state) => state.setLanguage);

  useEffect(() => {
    // Check if we should use dark class
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Optional: save to local storage if user explicitly set it
    if (theme !== 'system') {
      localStorage.setItem('theme', theme);
    } else {
      localStorage.removeItem('theme');
    }
  }, [theme]);

  // Language Persistence
  useEffect(() => {
    if (language !== 'system') {
      localStorage.setItem('language', language);
    } else {
      localStorage.removeItem('language');
    }
  }, [language]);

  // Read from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
      setLanguage(savedLanguage);
    }
  }, [setTheme, setLanguage]);

  return <>{children}</>;
}
