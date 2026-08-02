import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useCallback } from 'react';

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      try {
        setIsLoading(true);
        setError(null);
        await login(response.credential); // This is the ID token
        onSuccess?.();
      } catch (err: any) {
        const message = err.message || 'Login failed';
        setError(message);
        onError?.(message);
      } finally {
        setIsLoading(false);
      }
    },
    [login, onSuccess, onError]
  );

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-login-btn')!,
          {
            theme: 'outline',
            size: 'large',
            width: 300,
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [handleCredentialResponse]);

  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
      {isLoading && (
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-sm">Signing in...</span>
        </div>
      )}
      <div id="google-login-btn" />
    </div>
  );
}

