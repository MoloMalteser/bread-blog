
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Settings, LayoutDashboard, PlusCircle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Show navigation for both authenticated users and anonymous users
  const isAnonymousUser = !user && localStorage.getItem('anonymous-session') === 'true';
  
  if (!user && !isAnonymousUser) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center py-2 px-2 max-w-md mx-auto">
        <Link to="/feed">
          <Button 
            variant={isActive('/feed') ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[50px]"
          >
            <Home className="h-4 w-4" />
            <span className="text-xs">Feed</span>
          </Button>
        </Link>
        
        <Link to="/editor">
          <Button 
            variant={isActive('/editor') ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[50px]"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="text-xs">Schreiben</span>
          </Button>
        </Link>
        
        {user && (
          <Link to="/friends">
            <Button 
              variant={isActive('/friends') ? 'default' : 'ghost'} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[50px]"
            >
              <Users className="h-4 w-4" />
              <span className="text-xs">Freunde</span>
            </Button>
          </Link>
        )}
        
        {user && (
          <Link to="/dashboard">
            <Button 
              variant={isActive('/dashboard') ? 'default' : 'ghost'} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[50px]"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="text-xs">Dashboard</span>
            </Button>
          </Link>
        )}
        
        {user && (
          <Link to="/settings">
            <Button 
              variant={isActive('/settings') ? 'default' : 'ghost'} 
              size="sm" 
              className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[50px]"
            >
              <Settings className="h-4 w-4" />
              <span className="text-xs">Settings</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default BottomNavigation;
