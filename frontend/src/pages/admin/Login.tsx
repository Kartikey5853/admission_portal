import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { saveAuth } from '@/lib/auth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/data/admins.json');
      const admins = await response.json();
      
      const admin = admins.find((a: any) => a.email === email && a.password === password);
      
      if (admin) {
        const mockToken = {
          token: 'mock-admin-token-' + Date.now(),
          user: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin' as const
          },
          expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        };

        saveAuth(mockToken);
        
        toast({
          title: "Admin Login Successful",
          description: `Welcome back, ${admin.name}!`,
        });

        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials.",
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
    <div className="min-h-screen bg-accent/30 flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Access the admin control panel</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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

            <div className="text-center text-sm">
              <Link to="/" className="text-primary hover:underline">
                ← Back to Home
              </Link>
            </div>

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
