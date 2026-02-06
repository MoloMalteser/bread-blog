
import React from 'react';
import { Link } from 'react-router-dom';
import CoconutLogo from './CoconutLogo';

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <CoconutLogo className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Your glassy social feed. Share moments, discover stories.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/en/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/en/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/en/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/en/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link></li>
              <li><Link to="/en/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-sm">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://github.com/MoloMalteser/bread-blog/" className="text-muted-foreground hover:text-foreground transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/30 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Coconut. Made with 🥥</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
