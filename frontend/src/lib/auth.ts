// Mock authentication utilities

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: number;
}

export const saveAuth = (auth: AuthToken) => {
  localStorage.setItem('auth', JSON.stringify(auth));
};

export const getAuth = (): AuthToken | null => {
  const auth = localStorage.getItem('auth');
  if (!auth) return null;
  
  const parsed = JSON.parse(auth);
  if (parsed.expiresAt < Date.now()) {
    clearAuth();
    return null;
  }
  
  return parsed;
};

export const clearAuth = () => {
  localStorage.removeItem('auth');
};

export const isAuthenticated = (): boolean => {
  return getAuth() !== null;
};

export const isAdmin = (): boolean => {
  const auth = getAuth();
  return auth?.user.role === 'admin';
};

export const isStudent = (): boolean => {
  const auth = getAuth();
  return auth?.user.role === 'student';
};

export const getCurrentUser = (): User | null => {
  const auth = getAuth();
  return auth?.user || null;
};
