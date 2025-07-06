import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Feed from '@/pages/Feed';
import Editor from '@/pages/Editor';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import Post from '@/pages/Post';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Pricing from '@/pages/Pricing';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';
import Secret from '@/pages/Secret';
import SecretAdminMenu from '@/pages/SecretAdminMenu';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

import Friends from '@/pages/Friends';

const queryClient = new QueryClient();

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      console.log('App is online');
    };

    const handleOffline = () => {
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍞</div>
          <div className="text-xl">Bread lädt...</div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/feed" replace /> : <Index />} />
            <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/feed" replace />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" replace />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/feed" replace />} />
            
            {/* Protected Routes */}
            <Route path="/feed" element={user ? <Feed /> : <Navigate to="/auth" replace />} />
            <Route path="/editor" element={user ? <Editor /> : <Navigate to="/auth" replace />} />
            <Route path="/editor/:id" element={user ? <Editor /> : <Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" replace />} />
            <Route path="/friends" element={user ? <Friends /> : <Navigate to="/auth" replace />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/auth" replace />} />
            <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to="/auth" replace />} />
            <Route path="/post/:id" element={user ? <Post /> : <Navigate to="/auth" replace />} />
            
            {/* Public Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/secret" element={<Secret />} />
            <Route path="/secret-admin-menu" element={<SecretAdminMenu />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
