
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
    messages: 'Nachrichten',
    settings: 'Einstellungen',
    
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
    send: 'Senden',
    
    // CTA Section
    ctaTitle: 'Bereit, deine Gedanken zu teilen?',
    ctaDescription: 'Schließe dich unserer Community an und beginne noch heute mit dem Schreiben.',
    getStarted: 'Kostenlos starten',
    viewDemo: 'Demo ansehen',
    
    // Translation
    translate: 'Übersetzen',
    translating: 'Übersetzt...',
    translatedBy: 'Übersetzt von BreadGPT',
    
    // Friends page
    friendsAndCommunity: 'Freunde & Community',
    discoverFriends: 'Entdecke neue Freunde',
    search: 'Suchen',
    friends: 'Freunde',
    suggestions: 'Empfehlungen',
    userSearch: 'Nutzer suchen',
    enterUsername: 'Benutzername...',
    searchResults: 'Ergebnisse:',
    viewProfile: 'Profil ansehen',
    follow: 'Folgen',
    unfollow: 'Entfolgen',
    yourFriends: 'Deine Freunde',
    noFriends: 'Noch keine Freunde',
    noFriendsDescription: 'Nutze die Suche, um neue Freunde zu finden.',
    findFriendsNow: 'Jetzt Freunde finden',
    recommendedUsers: 'Empfohlene Nutzer',
    noSuggestions: 'Keine neuen Empfehlungen',
    
    // Dashboard
    welcomeBack: 'Willkommen zurück',
    personalWritingSpace: 'Dein Schreibbereich',
    postsTab: 'Posts',
    websites: 'Websites',
    missions: 'Missionen',
    newPostAction: 'Neuer Post',
    shareThoughts: 'Teile deine Gedanken',
    newWebsite: 'Neue Website',
    createWebsite: 'Website erstellen',
    myProfile: 'Mein Profil',
    statistics: 'Statistiken',
    totalViews: 'Aufrufe gesamt',
    publishedPosts: 'Posts',
    drafts: 'Entwürfe',
    myWebsites: 'Meine Websites',
    
    // Editor
    title: 'Titel',
    content: 'Inhalt',
    publish: 'Veröffentlichen',
    saveDraft: 'Entwurf speichern',
    makePublic: 'Öffentlich',
    makePrivate: 'Privat',
    
    // Common UI
    back: 'Zurück',
    share: 'Teilen',
    viewsCount: 'Aufrufe',
    by: 'Von',
    
    // Polls
    vote: 'Stimme',
    votes: 'Stimmen',
    totalVotes: 'Insgesamt',
    createPoll: 'Umfrage',
    pollQuestion: 'Frage',
    addOption: 'Option hinzufügen',
    
    // Messages
    newMessage: 'Neue Nachricht',
    typeMessage: 'Nachricht eingeben...',
    noMessages: 'Keine Nachrichten',
    startConversation: 'Konversation starten'
  },
  en: {
    // Navigation
    feed: 'Feed',
    general: 'General',
    dashboard: 'Dashboard',
    newPost: 'New Post',
    profile: 'Profile',
    messages: 'Messages',
    settings: 'Settings',
    
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
    send: 'Send',
    
    // CTA Section
    ctaTitle: 'Ready to share your thoughts?',
    ctaDescription: 'Join our community and start writing today.',
    getStarted: 'Get Started Free',
    viewDemo: 'View Demo',
    
    // Translation
    translate: 'Translate',
    translating: 'Translating...',
    translatedBy: 'Translated by BreadGPT',
    
    // Friends page
    friendsAndCommunity: 'Friends & Community',
    discoverFriends: 'Discover new friends',
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
    noFriendsDescription: 'Use search to find new friends.',
    findFriendsNow: 'Find Friends Now',
    recommendedUsers: 'Recommended Users',
    noSuggestions: 'No new recommendations',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    personalWritingSpace: 'Your writing space',
    postsTab: 'Posts',
    websites: 'Websites',
    missions: 'Missions',
    newPostAction: 'New Post',
    shareThoughts: 'Share your thoughts',
    newWebsite: 'New Website',
    createWebsite: 'Create a website',
    myProfile: 'My Profile',
    statistics: 'Statistics',
    totalViews: 'Total views',
    publishedPosts: 'Posts',
    drafts: 'Drafts',
    myWebsites: 'My Websites',
    
    // Editor
    title: 'Title',
    content: 'Content',
    publish: 'Publish',
    saveDraft: 'Save Draft',
    makePublic: 'Public',
    makePrivate: 'Private',
    
    // Common UI
    back: 'Back',
    share: 'Share',
    viewsCount: 'Views',
    by: 'By',
    
    // Polls
    vote: 'vote',
    votes: 'votes',
    totalVotes: 'Total',
    createPoll: 'Poll',
    pollQuestion: 'Question',
    addOption: 'Add option',
    
    // Messages
    newMessage: 'New Message',
    typeMessage: 'Type a message...',
    noMessages: 'No messages',
    startConversation: 'Start conversation'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize from localStorage or URL
    const saved = localStorage.getItem('preferred-language');
    if (saved && (saved === 'de' || saved === 'en')) return saved;
    
    // Try to get from URL
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/en')) return 'en';
      if (path.startsWith('/de')) return 'de';
    }
    
    return 'de';
  });

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
