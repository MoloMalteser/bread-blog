import { useEffect } from 'react';
import { useLanguage } from './useLanguage';

export const useIPLanguage = () => {
  const { setLanguage } = useLanguage();

  useEffect(() => {
    const detectLanguageFromIP = async () => {
      try {
        // Check if language is already set in localStorage
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage && (savedLanguage === 'de' || savedLanguage === 'en')) {
          setLanguage(savedLanguage);
          return;
        }

        // Try to detect language from IP geolocation
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // German-speaking countries
        const germanCountries = ['DE', 'AT', 'CH', 'LU', 'LI'];
        
        if (germanCountries.includes(data.country_code)) {
          setLanguage('de');
        } else {
          setLanguage('en');
        }
        
        // Save detected language
        localStorage.setItem('preferred-language', germanCountries.includes(data.country_code) ? 'de' : 'en');
      } catch (error) {
        console.log('Could not detect language from IP, using browser language');
        
        // Fallback to browser language
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'de') {
          setLanguage('de');
        } else {
          setLanguage('en');
        }
        
        localStorage.setItem('preferred-language', browserLang === 'de' ? 'de' : 'en');
      }
    };

    detectLanguageFromIP();
  }, [setLanguage]);
};