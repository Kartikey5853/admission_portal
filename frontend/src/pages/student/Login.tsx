import { useState } from 'react'; // 1. REMOVED useEffect
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import api from '@/services/api'; 
import { useAuth } from '@/context/AuthContext'; 
import { jwtDecode } from 'jwt-decode';

// Define the shape of the data inside our JWT
interface DecodedToken {
  sub: string; // This will be the user's email
  role: string;
  exp: number;
}

const Login = () => {
  const navigate = useNavigate();
  // const { toast } = useToast();
  
  const { saveAuth } = useAuth(); // 2. REMOVED 'auth' from here, it's not needed
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. DELETE THE ENTIRE useEffect BLOCK.
  // useEffect(() => { ... }, [auth, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await api.post('/auth/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      const decodedToken = jwtDecode<DecodedToken>(access_token);

      const authData = {
        token: access_token,
        user: {
          email: decodedToken.sub,
          role: decodedToken.role as ('student' | 'admin'),
        },
        expiresAt: decodedToken.exp * 1000 
      };
      
      console.log("Saving auth data:", authData);
      
      // 4. THIS IS THE ONLY THING THAT SHOULD HAPPEN.
      // The router will handle the redirect automatically.
      saveAuth(authData);

    } catch (error: any) {
      const message = error.response?.data?.detail || "Login failed. Please check credentials.";
      console.error(message);
    }
  };

  // Your JSX remains exactly the same
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-accent/30 flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            {/* ... rest of CardHeader */}
            <CardTitle>Student Login</CardTitle>
            <CardDescription>Access your admission portal</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Login
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </div>

              <div className="pt-4 border-t text-xs text-center text-muted-foreground">
                Demo: student@example.com / password123
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;