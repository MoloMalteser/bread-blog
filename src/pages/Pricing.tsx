import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BreadLogo from '@/components/BreadLogo';
import ThemeToggle from '@/components/ThemeToggle';
import BottomNavigation from '@/components/BottomNavigation';
import { Check, ArrowLeft, X } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <BreadLogo />
            </Link>
            
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link to="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">
            Simple. Transparent. For Everyone.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bread offers the right package for everyone - from free personal blogs 
            to professional enterprise solutions.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🍞</div>
              <CardTitle className="text-2xl">Bread Free</CardTitle>
              <CardDescription>
                For everyone, forever
              </CardDescription>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">free</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unlimited Posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom Profile URL</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Dark & Light Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Likes & Comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Follow System</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Push Notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Anonymous Posts</span>
                </div>
              </div>
              
              <Link to="/auth" className="block">
                <Button className="w-full">
                  Start Free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Anonymous Plan */}
          <Card>
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🎭</div>
              <CardTitle className="text-2xl">Bread Anonymous</CardTitle>
              <CardDescription>
                Read only, anonymous
              </CardDescription>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">free</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Read all posts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Dark & Light Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No post creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No interactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No profile</span>
                </div>
              </div>
              
              <Link to="/" className="block">
                <Button variant="outline" className="w-full">
                  Browse Anonymously
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Supporter Plan */}
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">❤️</div>
              <CardTitle className="text-2xl">Bread Supporter</CardTitle>
              <CardDescription>
                Unterstütze uns mit Werbung
              </CardDescription>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">kostenlos mit Werbung</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Alle Free Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Supporter Badge</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unbegrenztes BreadGPT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Unbegrenzte Websites</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Höhere Post-Priorität</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Feature Requests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Früher Zugriff auf Features</span>
                </div>
              </div>
              
              <Link to="/auth" className="block">
                <Button className="w-full">
                  Supporter werden
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-orange-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-orange-500 text-white">Coming Soon</Badge>
            </div>
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏢</div>
              <CardTitle className="text-2xl">Bread Pro</CardTitle>
              <CardDescription>
                For Enterprises
              </CardDescription>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">free (Beta)</p>
            </CardHeader>
            <CardContent className="space-y-4 opacity-75">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>All Free Features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Google SSO</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Team Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Analytics Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Custom Branding</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  <span>Priority Support</span>
                </div>
              </div>
              
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Why is Bread free?</h3>
                <p className="text-muted-foreground text-sm">
                  We believe everyone has the right to share their thoughts. 
                  Bread is funded through voluntary donations and our commitment to the community.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Are there hidden costs?</h3>
                <p className="text-muted-foreground text-sm">
                  No! Bread is and will remain completely free. No ads, 
                  no premium features, no surprises.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How is Bread funded?</h3>
                <p className="text-muted-foreground text-sm">
                  Through voluntary donations from our community and our passion 
                  for beautiful, simple blogging.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I support Bread?</h3>
                <p className="text-muted-foreground text-sm">
                  Yes! Share Bread with friends, write great content 
                  and help us improve the platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
};

export default Pricing;
