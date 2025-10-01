// Helper to get language prefix from current path
export const getLanguagePrefix = (): string => {
  if (typeof window === 'undefined') return '/de';
  
  const path = window.location.pathname;
  if (path.startsWith('/en')) return '/en';
  if (path.startsWith('/de')) return '/de';
  
  // Default to German
  return '/de';
};

// Helper to add language prefix to a path
export const withLanguage = (path: string, language?: string): string => {
  const lang = language || (typeof window !== 'undefined' ? getLanguagePrefix().substring(1) : 'de');
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `/${lang}/${cleanPath}`;
};
