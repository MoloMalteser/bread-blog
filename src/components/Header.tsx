
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BreadLogo from './BreadLogo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'}>
            <BreadLogo />
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {!user && (
              <>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Preise
                </Link>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Über uns
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/editor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Neuer Post
                </Link>
              </>
            )}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {!user ? (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm focus-ring"
                  >
                    Anmelden
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    size="sm"
                    className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 focus-ring"
                  >
                    Registrieren
                  </Button>
                </Link>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-sm focus-ring"
              >
                Abmelden
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
