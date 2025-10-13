
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Settings, LayoutDashboard, PlusCircle, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { withLanguage } from '@/lib/languageUtils';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Show navigation for both authenticated users and anonymous users
  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';
  
  if (!user && !isAnonymousUser) return null;

  const isActive = (path: string) => location.pathname === path;

  // For anonymous users, only show Feed
  if (isAnonymousUser) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border/50 z-50 pb-safe rounded-t-3xl mx-2 mb-2 animate-slide-up">
        <div className="flex justify-center items-center py-3 px-4 max-w-md mx-auto">
          <Link to={withLanguage('feed')}>
            <Button 
              variant={isActive(withLanguage('feed')) ? 'gradient' : 'ghost'} 
              size="icon-sm" 
              className="flex flex-col items-center gap-1 h-auto py-3 px-3 rounded-2xl min-w-[60px] transition-all duration-300 hover:scale-105"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-border/50 z-50 pb-safe rounded-t-3xl mx-2 mb-2 animate-slide-up">
      <div className="flex justify-around items-center py-3 px-4 max-w-md mx-auto">
        <Link to={withLanguage('feed')}>
            <Button 
              variant={isActive(withLanguage('feed')) ? 'gradient' : 'ghost'} 
              size="icon-sm" 
              className="flex flex-col items-center gap-1 h-auto py-3 px-3 rounded-2xl min-w-[60px] transition-all duration-300 hover:scale-105"
            >
            <Home className="h-4 w-4" />
          </Button>
        </Link>

        <Link to={withLanguage('contacts')}>
          <Button 
            variant={isActive(withLanguage('contacts')) ? 'gradient' : 'ghost'} 
            size="icon-sm" 
            className="flex flex-col items-center gap-1 h-auto py-3 px-3 rounded-2xl min-w-[60px] transition-all duration-300 hover:scale-105"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </Link>
        
        <Link to={withLanguage('editor')}>
          <Button 
            variant={isActive(withLanguage('editor')) ? 'gradient' : 'ghost'} 
            size="icon-sm" 
            className="flex flex-col items-center gap-1 h-auto py-3 px-3 rounded-2xl min-w-[60px] transition-all duration-300 hover:scale-105"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </Link>
        
        <Link to={withLanguage('dashboard')}>
          <Button 
            variant={isActive(withLanguage('dashboard')) ? 'gradient' : 'ghost'} 
            size="icon-sm" 
            className="flex flex-col items-center gap-1 h-auto py-3 px-3 rounded-2xl min-w-[60px] transition-all duration-300 hover:scale-105"
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
