import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { authService, AuthUser } from '../services/auth.service';

type UserRole = 'student' | 'member' | 'admin';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('dsc_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      // Token expired or invalid
      localStorage.removeItem('dsc_token');
      localStorage.removeItem('dsc_user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (idToken: string) => {
    try {
      const response = await authService.googleLogin(idToken);

      if (response.success) {
        const { user: userData, token } = response.data;
        localStorage.setItem('dsc_token', token);
        localStorage.setItem('dsc_user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error: any) {
      console.error('Auth login error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Login failed';
      throw new Error(message);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('dsc_user', JSON.stringify(response.data));
      }
    } catch (error) {
      // Silently fail — user stays with stale data
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Logout even if API call fails
    } finally {
      localStorage.removeItem('dsc_token');
      localStorage.removeItem('dsc_user');
      setUser(null);
    }
  };

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

