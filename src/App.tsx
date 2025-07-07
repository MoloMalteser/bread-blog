
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import Post from "./pages/Post";
import Feed from "./pages/Feed";
import Friends from "./pages/Friends";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import SecretAdminMenu from "./pages/secret-admin-menu"
import Flappybread from "./pages/secret"
import BreadGPTPage from "./pages/BreadGPTPage";
import DrawPage from "./pages/DrawPage";
import BottomNavigation from "@/components/BottomNavigation";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    if (user && 'serviceWorker' in navigator) {
      // Register service worker for notifications
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, [user]);

  return (
    <div>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:postId" element={<Editor />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/post/:slug" element={<Post />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/breadgpt" element={<BreadGPTPage />} />
        <Route path="/draw" element={<DrawPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/adminmenu" element={<SecretAdminMenu/>} />
        <Route path="/game" element={<Flappybread/>} />
      </Routes>
      <BottomNavigation />
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
