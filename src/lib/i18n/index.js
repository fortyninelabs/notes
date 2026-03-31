import React, { useState, useEffect } from 'react';
import useStore from '../store';
import de from './de.json';
import en from './en.json';

const translations = { de, en };

export const getStrings = (lang) => {
  let targetLang = lang;
  
  if (lang === 'system') {
    targetLang = typeof window !== 'undefined' ? navigator.language.split('-')[0] : 'en';
  }
  
  return translations[targetLang] || translations.en;
};

/**
 * Hook for React components to get reactive translations.
 * Prevents hydration errors by returning a stable default on first render.
 */
export const useStrings = () => {
  const language = useStore((state) => state.language);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // During hydration, we must use a stable language (matching server's 'en' default)
  return getStrings(mounted ? language : 'en');
};

/**
 * Static access to strings for non-React code.
 * Note: Accessing this will not trigger React re-renders.
 */
export const Strings = {
  get current() {
    return getStrings(useStore.getState().language);
  }
};

export default Strings;
