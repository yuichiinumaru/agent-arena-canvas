
import { DecodedCredential, User } from '@/types';

export const decodeJwt = (token: string): DecodedCredential => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    throw new Error('Invalid token format');
  }
};

export const handleGoogleLogin = (credential: string): User => {
  try {
    // Decode JWT token to extract user information
    const decoded = decodeJwt(credential);
    
    // Create user object from the decoded JWT
    const user: User = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      avatar: decoded.picture,
    };
    
    return user;
  } catch (error) {
    console.error('Error processing Google login:', error);
    throw error;
  }
};

export const initializeGoogleOneTap = (
  onSuccess: (response: any) => void,
  onError: (error: Error) => void
) => {
  // Add Google One Tap script if not already present
  if (!document.getElementById('google-one-tap-script')) {
    const script = document.createElement('script');
    script.id = 'google-one-tap-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      setupGoogleOneTap(onSuccess, onError);
    };
    
    script.onerror = () => {
      onError(new Error('Failed to load Google One Tap script'));
    };
  } else {
    setupGoogleOneTap(onSuccess, onError);
  }
};

const setupGoogleOneTap = (
  onSuccess: (response: any) => void,
  onError: (error: Error) => void
) => {
  // Check if Google One Tap is available
  if (window.google && window.google.accounts) {
    try {
      // Get the client ID from environment variables
      // In a production app, you would get this from environment variables
      const clientId = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual client ID
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: onSuccess,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button') || document.createElement('div'),
        { theme: 'outline', size: 'large', shape: 'rectangular' }
      );
      
      window.google.accounts.id.prompt();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error initializing Google One Tap'));
    }
  } else {
    onError(new Error('Google One Tap not available'));
  }
};
