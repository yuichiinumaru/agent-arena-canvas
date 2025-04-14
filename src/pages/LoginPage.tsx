
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { handleGoogleLogin, initializeGoogleOneTap } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = (response: { credential: string }) => {
      try {
        const user = handleGoogleLogin(response.credential);
        login(user);
      } catch (err) {
        setError('Failed to process Google login. Please try again.');
        console.error('Login error:', err);
      }
    };

    const handleError = (err: Error) => {
      setError(`Authentication error: ${err.message}`);
      console.error('Google One Tap error:', err);
    };

    initializeGoogleOneTap(handleCredentialResponse, handleError);
  }, [login]);

  // Traditional login with username/password
  const handleTraditionalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check for hardcoded admin user
    if (username === 'admin' && password === 'chumbawamba') {
      login({
        id: 'admin-user',
        name: 'Administrator',
        email: 'admin@example.com',
        avatar: `https://ui-avatars.com/api/?name=Administrator&background=random`,
      });
      return;
    }

    // Display error for invalid credentials
    setError('Invalid username or password');
    setIsLoading(false);
  };

  // For demonstration, also provide a way to login without Google
  const handleDemoLogin = () => {
    login({
      id: `demo-${Date.now()}`,
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: `https://ui-avatars.com/api/?name=Demo+User&background=random`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Agent Arena</CardTitle>
          <CardDescription>
            Chat with multiple AI agents and see them collaborate
          </CardDescription>
        </CardHeader>

        <Tabs defaultValue="traditional" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="traditional">Username/Password</TabsTrigger>
            <TabsTrigger value="google">Google Login</TabsTrigger>
          </TabsList>

          <TabsContent value="traditional" className="space-y-4">
            <form onSubmit={handleTraditionalLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    type="text" 
                    placeholder="Enter your username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="Enter your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Sign In'}
                </Button>
                <Button onClick={handleDemoLogin} variant="outline" className="w-full">
                  Continue with Demo Account
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="google" className="space-y-4">
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div id="google-login-button" className="flex justify-center py-2"></div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleDemoLogin} variant="outline" className="w-full">
                Continue with Demo Account
              </Button>
            </CardFooter>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LoginPage;
