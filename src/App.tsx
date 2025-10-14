
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { useNotifications } from "@/hooks/useNotifications";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Feed from "./pages/Feed";
import Friends from "./pages/Friends";
import Contacts from "./pages/Contacts";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import SecretAdminMenu from "./pages/secret-admin-menu"
import Flappybread from "./pages/secret"
import WebBuilder from "./pages/WebBuilder";
import PublishedWebsite from "./pages/PublishedWebsite";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import LanguageRedirect from "./components/LanguageRedirect";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  useNotifications();
  
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <div>
      <Routes>
        {/* Root redirects based on IP */}
        <Route path="/" element={<LanguageRedirect />} />
        
        {/* German routes */}
        <Route path="/de" element={<Index />} />
        <Route path="/de/auth" element={<Auth />} />
        <Route path="/de/dashboard" element={<Dashboard />} />
        <Route path="/de/editor" element={<Editor />} />
        <Route path="/de/editor/:postId" element={<Editor />} />
        <Route path="/de/profile/:username" element={<Profile />} />
        <Route path="/de/post/:slug" element={<Post />} />
        <Route path="/de/feed" element={<Feed />} />
        <Route path="/de/friends" element={<Friends />} />
        <Route path="/de/contacts" element={<Contacts />} />
        <Route path="/de/settings" element={<Settings />} />
        <Route path="/de/webbuilder" element={<WebBuilder />} />
        <Route path="/de/webbuilder/:id" element={<WebBuilder />} />
        <Route path="/de/pages/:slug" element={<PublishedWebsite />} />
        <Route path="/de/pricing" element={<Pricing />} />
        <Route path="/de/about" element={<About />} />
        <Route path="/de/contact" element={<Contact />} />
        <Route path="/de/privacy" element={<Privacy />} />
        <Route path="/de/terms" element={<Terms />} />
        
        {/* English routes */}
        <Route path="/en" element={<Index />} />
        <Route path="/en/auth" element={<Auth />} />
        <Route path="/en/dashboard" element={<Dashboard />} />
        <Route path="/en/editor" element={<Editor />} />
        <Route path="/en/editor/:postId" element={<Editor />} />
        <Route path="/en/profile/:username" element={<Profile />} />
        <Route path="/en/post/:slug" element={<Post />} />
        <Route path="/en/feed" element={<Feed />} />
        <Route path="/en/friends" element={<Friends />} />
        <Route path="/en/contacts" element={<Contacts />} />
        <Route path="/en/settings" element={<Settings />} />
        <Route path="/en/webbuilder" element={<WebBuilder />} />
        <Route path="/en/webbuilder/:id" element={<WebBuilder />} />
        <Route path="/en/pages/:slug" element={<PublishedWebsite />} />
        <Route path="/en/pricing" element={<Pricing />} />
        <Route path="/en/about" element={<About />} />
        <Route path="/en/contact" element={<Contact />} />
        <Route path="/en/privacy" element={<Privacy />} />
        <Route path="/en/terms" element={<Terms />} />
        
        {/* Special routes (no language prefix) */}
        <Route path="/adminmenu" element={<SecretAdminMenu/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/game" element={<Flappybread/>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
