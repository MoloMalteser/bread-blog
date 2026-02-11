
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BreadLogo from '@/components/BreadLogo';

import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Demo login - in real app this would connect to authentication service
    setTimeout(() => {
      if (email && password) {
        localStorage.setItem('bread-user', JSON.stringify({
          id: 'demo-user',
          email,
          username: email.split('@')[0],
          displayName: email.split('@')[0]
        }));
        toast({
          title: "Successfully signed in",
          description: "Welcome to Bread!",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <BreadLogo className="justify-center mb-4" />
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">
            Sign in to share your thoughts
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to sign in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline">
                Register now
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Login;
