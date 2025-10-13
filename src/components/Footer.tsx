
import React from 'react';
import { Link } from 'react-router-dom';
import BreadLogo from './BreadLogo';

const Footer = () => {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <BreadLogo className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Bread for the mind – simple, beautiful blogging for everyone.
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/en/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/en/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/en/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/en/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/en/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Community */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://whatsapp.com/channel/0029VbBY6Tk1iUxZm2uYpu43" className="text-muted-foreground hover:text-foreground transition-colors">
                  WhatsApp
                </a>
              </li>
              <li>
                <a href="https://github.com/MoloMalteser/bread-blog/" className="text-muted-foreground hover:text-foreground transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Bread. Made with 🍞 and love.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
