
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
    viewsLabel: 'Aufrufe',
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
    translatedBy: 'Übersetzt von BreadGPT',
    
    // Friends page
    friendsAndCommunity: 'Freunde & Community',
    discoverFriends: 'Entdecke neue Freunde, verwalte deine Kontakte und baue dein Netzwerk auf',
    search: 'Suchen',
    friends: 'Freunde',
    suggestions: 'Empfehlungen',
    userSearch: 'Nutzer suchen',
    enterUsername: 'Benutzername eingeben...',
    searchResults: 'Suchergebnisse:',
    viewProfile: 'Profil ansehen',
    follow: 'Folgen',
    unfollow: 'Entfolgen',
    yourFriends: 'Deine Freunde',
    noFriends: 'Noch keine Freunde',
    noFriendsDescription: 'Nutze die Suche oder Empfehlungen, um neue Freunde zu finden und ihnen zu folgen.',
    findFriendsNow: 'Jetzt Freunde finden',
    recommendedUsers: 'Empfohlene Nutzer',
    noSuggestions: 'Keine neuen Empfehlungen',
    noSuggestionsDescription: 'Schaue später nochmal vorbei für neue Nutzervorschläge.',
    
    // Dashboard
    welcomeBack: 'Willkommen zurück',
    personalWritingSpace: 'Dein persönlicher Schreibbereich bei Bread',
    postsTab: 'Posts',
    websites: 'Websites',
    wiki: 'Wiki',
    missions: 'Missionen',
    newPostAction: 'Neuer Post',
    shareThoughts: 'Teile deine Gedanken',
    newWebsite: 'Neue Website',
    createWebsite: 'Erstelle eine Website',
    myProfile: 'Mein Profil',
    statistics: 'Statistiken',
    totalViews: 'Aufrufe gesamt',
    publishedPosts: 'Veröffentlichte Posts',
    drafts: 'Entwürfe',
    myWebsites: 'Meine Websites',
    
    // Common UI
    back: 'Zurück',
    share: 'Teilen',
    viewsCount: 'Aufrufe',
    by: 'Von'
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
    viewsLabel: 'Views',
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
    translatedBy: 'Translated by BreadGPT',
    
    // Friends page
    friendsAndCommunity: 'Friends & Community',
    discoverFriends: 'Discover new friends, manage your contacts and build your network',
    search: 'Search',
    friends: 'Friends',
    suggestions: 'Suggestions',
    userSearch: 'Search Users',
    enterUsername: 'Enter username...',
    searchResults: 'Search Results:',
    viewProfile: 'View Profile',
    follow: 'Follow',
    unfollow: 'Unfollow',
    yourFriends: 'Your Friends',
    noFriends: 'No friends yet',
    noFriendsDescription: 'Use search or suggestions to find new friends and follow them.',
    findFriendsNow: 'Find Friends Now',
    recommendedUsers: 'Recommended Users',
    noSuggestions: 'No new recommendations',
    noSuggestionsDescription: 'Check back later for new user suggestions.',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    personalWritingSpace: 'Your personal writing space at Bread',
    postsTab: 'Posts',
    websites: 'Websites',
    wiki: 'Wiki',
    missions: 'Missions',
    newPostAction: 'New Post',
    shareThoughts: 'Share your thoughts',
    newWebsite: 'New Website',
    createWebsite: 'Create a website',
    myProfile: 'My Profile',
    statistics: 'Statistics',
    totalViews: 'Total views',
    publishedPosts: 'Published Posts',
    drafts: 'Drafts',
    myWebsites: 'My Websites',
    
    // Common UI
    back: 'Back',
    share: 'Share',
    viewsCount: 'Views',
    by: 'By'
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
