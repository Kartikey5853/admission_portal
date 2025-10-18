import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { saveAuth } from '@/lib/auth';
import Navbar from '@/components/Navbar';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mock authentication
      const response = await fetch('/data/students.json');
      const students = await response.json();
      
      const user = students.find((s: any) => s.email === email && s.password === password);
      
      if (user) {
        // Generate mock JWT
        const mockToken = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'student' as const
          },
          expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };

        saveAuth(mockToken);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });

        navigate('/dashboard/documents');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-accent/30 flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-primary-foreground" />
            </div>
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
