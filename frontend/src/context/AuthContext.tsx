import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Define the shape of your user and auth state
interface AuthUser {
  email: string;
  role: 'student' | 'admin';
}

interface AuthToken {
  token: string;
  user: AuthUser;
  expiresAt: number;
}

// 2. Define the shape of the context
interface IAuthContext {
  auth: AuthToken | null;
  saveAuth: (authData: AuthToken) => void;
  logout: () => void;
}

// 3. Create the context
const AuthContext = createContext<IAuthContext | null>(null);

// 4. Create the Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<AuthToken | null>(null);

  // On initial load, check localStorage for an existing token
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const parsedToken: AuthToken = JSON.parse(storedToken);
        
        // Check if token is expired
        if (parsedToken.expiresAt > Date.now()) {
          setAuth(parsedToken);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error("Failed to parse auth token from localStorage", error);
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  // Function to save token to state and localStorage
  const saveAuth = (authData: AuthToken) => {
    setAuth(authData);
    localStorage.setItem('authToken', JSON.stringify(authData));
  };

  // Function to clear token from state and localStorage
  const logout = () => {
    setAuth(null);
    localStorage.removeItem('authToken');
    // You might also want to remove the interceptor if you set it up to be dynamic
  };

  return (
    <AuthContext.Provider value={{ auth, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Create the custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};