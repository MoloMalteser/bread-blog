
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import CoconutLogo from './CoconutLogo';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  
  const langPrefix = location.pathname.startsWith('/en') ? '/en' : '/de';

  const handleLogout = async () => {
    await signOut();
    navigate(`/${language}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/30 animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={user ? `${langPrefix}/feed` : `${langPrefix}`} className="transition-transform duration-300 hover:scale-105">
            <CoconutLogo />
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {!user && (
              <>
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Features
                </a>
                <Link to={`${langPrefix}/pricing`} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  {language === 'de' ? 'Preise' : 'Pricing'}
                </Link>
                <Link to={`${langPrefix}/about`} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                  {language === 'de' ? 'Über uns' : 'About'}
                </Link>
              </>
            )}
          </nav>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {!user ? (
              <Link to={`${langPrefix}/auth`}>
                <Button 
                  size="sm"
                  className="text-sm rounded-full px-5 gradient-primary text-primary-foreground border-0 shadow-sm hover:shadow-md transition-shadow"
                >
                  {language === 'de' ? 'Loslegen' : 'Get Started'}
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-sm rounded-full"
              >
                {language === 'de' ? 'Abmelden' : 'Sign Out'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
