import { Link, useNavigate } from 'react-router-dom';
import { FileText, Upload, CheckCircle, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/lib/auth'; // We still use this to get the user's name
import { useAuth } from '@/context/AuthContext'; // 1. Import the useAuth hook

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { logout } = useAuth(); // 2. Get the 'logout' function from our context

  const handleLogout = () => {
    logout(); // 3. Call the context's logout function
    navigate('/login');
  };

  const menuItems = [
    {
      icon: Upload,
      title: 'Upload Documents',
      description: 'Upload required documents for verification',
      path: '/dashboard/documents',
      color: 'text-primary'
    },
    {
      icon: FileText,
      title: 'Submit Application',
      description: 'Create and submit your admission application',
      path: '/dashboard/apply',
      color: 'text-success'
    },
    {
      icon: CheckCircle,
      title: 'Application Status',
      description: 'Track your application and payment status',
      path: '/dashboard/status',
      color: 'text-warning'
    }
  ];

  return (
    <div className="min-h-screen bg-accent/30">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-primary">Student Dashboard</h1>
            <p className="text-sm text-muted-foreground">TKRCET Admission Portal</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-primary" />
              {/* Assuming getCurrentUser() returns an object with 'name' */}
              <span className="font-medium">{user?.name}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h2>
          <p className="text-muted-foreground">Complete the steps below to finish your admission process</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} to={item.path}>
                <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader>
                    <Icon className={`h-12 w-12 mb-4 ${item.color}`} />
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Go to {item.title}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;