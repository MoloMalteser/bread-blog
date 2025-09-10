import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useBreadGPT } from '@/hooks/useBreadGPT';
import { useToast } from '@/hooks/use-toast';

interface TranslateButtonProps {
  content: string;
  onTranslated: (translatedContent: string, targetLanguage: string) => void;
  className?: string;
}

const TranslateButton: React.FC<TranslateButtonProps> = ({ content, onTranslated, className = '' }) => {
  const { language, t } = useLanguage();
  const { askBreadGPT, loading } = useBreadGPT();
  const { toast } = useToast();
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!content.trim() || isTranslating) return;

    setIsTranslating(true);
    
    const targetLanguage = language === 'de' ? 'English' : 'Deutsch';
    const targetLangCode = language === 'de' ? 'en' : 'de';
    
    const translationPrompt = `Please translate the following text to ${targetLanguage}. Only provide the translation, no additional comments or explanations:

${content}`;

    try {
      const translatedText = await askBreadGPT(translationPrompt);
      
      if (translatedText) {
        onTranslated(translatedText, targetLangCode);
        toast({
          title: t('translate'),
          description: `${t('translatedBy')} → ${targetLanguage}`,
        });
      } else {
        toast({
          title: t('error'),
          description: 'Translation failed. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: 'Translation failed. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleTranslate}
      disabled={loading || isTranslating || !content.trim()}
      className={`gap-2 ${className}`}
    >
      <Languages className="h-4 w-4" />
      {isTranslating ? t('translating') : t('translate')}
    </Button>
  );
};

export default TranslateButton;