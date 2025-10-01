import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIPLanguage } from '@/hooks/useIPLanguage';
import { useLanguage } from '@/hooks/useLanguage';

const LanguageRedirect = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // This will detect language from IP
  useIPLanguage();

  useEffect(() => {
    // Wait a bit for IP detection to complete, then redirect
    const timer = setTimeout(() => {
      const detectedLang = localStorage.getItem('preferred-language') || language;
      navigate(`/${detectedLang}`, { replace: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [language, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl mb-4">🥖</div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default LanguageRedirect;
