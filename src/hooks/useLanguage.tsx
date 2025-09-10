
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'de' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  de: {
    // Navigation
    feed: 'Feed',
    general: 'Allgemein',
    dashboard: 'Dashboard',
    newPost: 'Neuer Post',
    profile: 'Profil',
    
    // Feed
    feedEmpty: 'Dein Feed ist leer',
    feedEmptyDescription: 'Folge anderen Nutzern, um ihre Posts hier zu sehen.',
    noPostsFound: 'Keine Posts gefunden',
    noPostsFoundDescription: 'Es wurden noch keine öffentlichen Posts erstellt.',
    showAllPosts: 'Alle Posts anzeigen',
    loadingPosts: 'Lade Posts...',
    
    // Post interactions
    views: 'Aufrufe',
    like: 'Gefällt mir',
    comment: 'Kommentar',
    writeComment: 'Kommentar schreiben...',
    
    // Auth
    loginRequired: 'Anmeldung erforderlich',
    loginRequiredDescription: 'Du musst angemeldet sein, um den Feed zu sehen.',
    loginNow: 'Jetzt anmelden',
    
    // Common
    loading: 'Laden...',
    error: 'Fehler',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    
    // CTA Section
    ctaTitle: 'Bereit, deine Gedanken zu teilen?',
    ctaDescription: 'Schließe dich unserer Community an und beginne noch heute mit dem Schreiben. Es ist kostenlos und dauert nur wenige Sekunden.',
    getStarted: 'Kostenlos starten',
    viewDemo: 'Demo ansehen',
    
    // Translation
    translate: 'Übersetzen',
    translating: 'Übersetzt...',
    translatedBy: 'Übersetzt von BreadGPT'
  },
  en: {
    // Navigation
    feed: 'Feed',
    general: 'General',
    dashboard: 'Dashboard',
    newPost: 'New Post',
    profile: 'Profile',
    
    // Feed
    feedEmpty: 'Your feed is empty',
    feedEmptyDescription: 'Follow other users to see their posts here.',
    noPostsFound: 'No posts found',
    noPostsFoundDescription: 'No public posts have been created yet.',
    showAllPosts: 'Show all posts',
    loadingPosts: 'Loading posts...',
    
    // Post interactions
    views: 'Views',
    like: 'Like',
    comment: 'Comment',
    writeComment: 'Write a comment...',
    
    // Auth
    loginRequired: 'Login required',
    loginRequiredDescription: 'You need to be logged in to see the feed.',
    loginNow: 'Login now',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    
    // CTA Section
    ctaTitle: 'Ready to share your thoughts?',
    ctaDescription: 'Join our community and start writing today. It\'s free and takes only a few seconds.',
    getStarted: 'Get Started Free',
    viewDemo: 'View Demo',
    
    // Translation
    translate: 'Translate',
    translating: 'Translating...',
    translatedBy: 'Translated by BreadGPT'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('de');

  // Save language preference to localStorage
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
