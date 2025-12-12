import { useState, useEffect } from 'react';
export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        // Non-browser environment: default to light
        return false;
      }
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme === 'dark';
      if (typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch (e) {
      // If any access throws, fallback safely to light
      return false;
    }
  });
  useEffect(() => {
    try {
      if (typeof document === 'undefined') return;
      if (isDark) {
        document.documentElement.classList.add('dark');
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme', 'dark');
          }
        } catch (e) {
          // ignore localStorage write errors
        }
      } else {
        document.documentElement.classList.remove('dark');
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('theme', 'light');
          }
        } catch (e) {
          // ignore localStorage write errors
        }
      }
    } catch (e) {
      // ignore unexpected errors to avoid throwing in SSR or restricted environments
    }
  }, [isDark]);
  const [toggleTheme] = useState(() => () => setIsDark(prev => !prev));
  return { isDark, toggleTheme };
}