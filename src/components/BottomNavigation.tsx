
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, Settings, LayoutDashboard, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BottomNavigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        <Link to="/feed">
          <Button 
            variant={isActive('/feed') ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[60px]"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Feed</span>
          </Button>
        </Link>
        
        <Link to="/editor">
          <Button 
            variant={isActive('/editor') ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[60px]"
          >
            <PlusCircle className="h-5 w-5" />
            <span className="text-xs">Schreiben</span>
          </Button>
        </Link>
        
        <Link to="/dashboard">
          <Button 
            variant={isActive('/dashboard') ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[60px]"
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-xs">Dashboard</span>
          </Button>
        </Link>
        
        <Link to={`/profile/${user.user_metadata?.username || user.email?.split('@')[0]}`}>
          <Button 
            variant={isActive(`/profile/${user.user_metadata?.username || user.email?.split('@')[0]}`) ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[60px]"
          >
            <User className="h-5 w-5" />
            <span className="text-xs">Profil</span>
          </Button>
        </Link>
        
        <Link to="/settings">
          <Button 
            variant={isActive('/settings') ? 'default' : 'ghost'} 
            size="sm" 
            className="flex flex-col items-center gap-1 h-auto py-2 rounded-full min-w-[60px]"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation;
