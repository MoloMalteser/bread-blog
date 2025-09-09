
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
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50 rounded-b-3xl mx-2 mt-2 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to={user ? '/feed' : '/'} className="transition-transform duration-300 hover:scale-105">
            <BreadLogo />
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {!user && (
              <>
                <a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">
                  Features
                </a>
                <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">
                  Preise
                </Link>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">
                  Über uns
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to="/feed" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">
                  Feed
                </Link>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">
                  Dashboard
                </Link>
                <Link to="/editor" className="text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 relative after:absolute after:w-0 after:h-0.5 after:bg-primary after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full">
                  Neuer Post
                </Link>
              </>
            )}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {!user ? (
              <>
                <Link to="/auth">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    Anmelden
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button 
                    variant="gradient"
                    size="sm"
                    className="text-sm rounded-xl hover:scale-105 transition-all duration-300"
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
                className="text-sm rounded-xl hover:scale-105 transition-all duration-300"
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
