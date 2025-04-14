
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { handleGoogleLogin, initializeGoogleOneTap } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCredentialResponse = (response: { credential: string }) => {
      try {
        const user = handleGoogleLogin(response.credential);
        login(user);
      } catch (err) {
        setError('Failed to process login. Please try again.');
        console.error('Login error:', err);
      }
    };

    const handleError = (err: Error) => {
      setError(`Authentication error: ${err.message}`);
      console.error('Google One Tap error:', err);
    };

    initializeGoogleOneTap(handleCredentialResponse, handleError);
  }, [login]);

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
      </Card>
    </div>
  );
};

export default LoginPage;
