import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext'; 
import api from '@/services/api'; 
import { jwtDecode } from 'jwt-decode';

// Define the shape of the JWT payload
interface DecodedToken {
  sub: string; 
  role: string; 
  exp: number;
}

const AdminLogin = () => {
  const navigate = useNavigate();
  // const { toast } = useToast();
  
  // 1. Get saveAuth, but remove 'auth' and any useEffect
  const { saveAuth } = useAuth(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. Make sure there is NO useEffect for redirection here

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', email); 
    formData.append('password', password);

    try {
      const response = await api.post('/admin/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      const { access_token } = response.data;
      const decodedToken = jwtDecode<DecodedToken>(access_token);

      const authData = {
        token: access_token,
        user: {
          email: decodedToken.sub,
          // We updated our context to accept 'superadmin'
          role: decodedToken.role as ('student' | 'admin' | 'superadmin'),
        },
        expiresAt: decodedToken.exp * 1000
      };

      // 3. This is the ONLY thing that happens on success.
      // The App.tsx router will see this change and redirect.
      saveAuth(authData);
      
    } catch (error: any) {
      const message = error.response?.data?.detail || "Invalid admin credentials.";
      console.error(message);
      // toast({ ... });
    }
  };

  // Your JSX is unchanged
  return (
    <div className="min-h-screen bg-accent/30 flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        {/* ... CardHeader ... */}
        <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Access the admin control panel</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* ... Email Input ... */}
            <div>
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@tkrcet.edu.in"
                required
              />
            </div>
            {/* ... Password Input ... */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Login to Admin Panel
            </Button>
            {/* ... Back to Home link ... */}
            <div className="text-center text-sm">
              <Link to="/" className="text-primary hover:underline">
                ← Back to Home
              </Link>
            </div>
            {/* ... Demo info ... */}
            <div className="pt-4 border-t text-xs text-center text-muted-foreground">
              Demo: admin@tkrcet.edu.in / admin123
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;