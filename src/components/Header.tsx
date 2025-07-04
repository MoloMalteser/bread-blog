
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BreadLogo from './BreadLogo';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('bread-user');
  const userData = user ? JSON.parse(user) : null;

  const handleLogout = () => {
    localStorage.removeItem('bread-user');
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={userData ? '/dashboard' : '/'}>
            <BreadLogo />
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {!userData && (
              <>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </a>
              </>
            )}
            {userData && (
              <>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/editor" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Neuer Post
                </Link>
                <Link to={`/profile/${userData.username}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Mein Profil
                </Link>
              </>
            )}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {!userData ? (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-sm focus-ring"
                  >
                    Anmelden
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    size="sm"
                    className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 focus-ring"
                  >
                    Registrieren
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  Hallo, {userData.displayName}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm focus-ring"
                >
                  Abmelden
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
