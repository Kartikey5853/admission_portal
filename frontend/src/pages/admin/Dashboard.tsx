import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, XCircle, LogOut, User } from 'lucide-react'; // 1. Added LogOut and User
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // 2. Added Button import
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext'; // 3. Import useAuth
import api from '@/services/api'; // 4. Import api service

// Define the shape of the expected API response
interface SummaryStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  branch_stats: { branch: string, count: number }[];
}


const AdminDashboard = () => {
  const { auth, logout } = useAuth(); // 5. Get auth state and logout function
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [branchStats, setBranchStats] = useState<{ name: string, count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 6. Fetch REAL data from the backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Use our api service to call the protected endpoint
        const response = await api.get<SummaryStats>('/admin/summary'); // Assuming this is your endpoint
        const data = response.data;

        setStats({
          total: data.total,
          pending: data.pending,
          approved: data.approved,
          rejected: data.rejected
        });
        
        // Assuming backend returns branch_stats like [{ branch: 'CSE', count: 10 }, ...]
        setBranchStats(data.branch_stats.map(item => ({ name: item.branch, count: item.count })));

      } catch (err) {
        console.error('Error loading stats:', err);
        // Handle error (e.g., show toast)
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // Empty dependency array means this runs once on mount

  // 7. Define the logout handler
  const handleLogout = () => {
    logout();
    // No need to navigate, App.tsx router handles it
  };

  const kpiCards = [
    { icon: Users, label: 'Total Applicants', value: stats.total, color: 'text-primary' },
    { icon: Clock, label: 'Pending Verification', value: stats.pending, color: 'text-warning' },
    { icon: CheckCircle, label: 'Approved', value: stats.approved, color: 'text-success' },
    { icon: XCircle, label: 'Rejected', value: stats.rejected, color: 'text-destructive' }
  ];

  // Basic loading state
  if (isLoading) {
    return (
       <div className="flex min-h-screen w-full">
         <AdminSidebar />
         <main className="flex-1 p-8 bg-accent/30">Loading dashboard data...</main>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      
      <main className="flex-1 p-8 bg-accent/30">
        {/* --- Header with Logout Button --- */}
        <header className="bg-card border-b sticky top-0 z-10 mb-8 -mx-8 px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">TKRCET Admission Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium">{auth?.user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}> {/* 8. Attached onClick */}
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
        </header>

        {/* --- Main Content Area --- */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Application Overview</h2>
          <p className="text-muted-foreground">Summary of current admission status</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{kpi.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Branch Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Branch-wise Applicant Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {branchStats.length > 0 ? (
              <div className="space-y-4">
                {branchStats.map((branch) => (
                  <div key={branch.name} className="flex items-center justify-between">
                    <span className="font-medium">{branch.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 h-3 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${stats.total > 0 ? (branch.count / stats.total) * 100 : 0}%` }} // Avoid division by zero
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">{branch.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-muted-foreground">No application data available yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;