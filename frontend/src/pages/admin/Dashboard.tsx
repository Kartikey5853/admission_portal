import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminSidebar from '@/components/AdminSidebar';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [branchStats, setBranchStats] = useState<any[]>([]);

  useEffect(() => {
    fetch('/data/applications.json')
      .then(res => res.json())
      .then(data => {
        setStats({
          total: data.length,
          pending: data.filter((a: any) => a.status === 'Pending Verification').length,
          approved: data.filter((a: any) => a.status === 'Approved').length,
          rejected: data.filter((a: any) => a.status === 'Rejected').length
        });

        const branches = data.reduce((acc: any, app: any) => {
          acc[app.branch] = (acc[app.branch] || 0) + 1;
          return acc;
        }, {});

        setBranchStats(Object.entries(branches).map(([name, count]) => ({ name, count })));
      })
      .catch(err => console.error('Error loading stats:', err));
  }, []);

  const kpiCards = [
    { icon: Users, label: 'Total Applicants', value: stats.total, color: 'text-primary' },
    { icon: Clock, label: 'Pending Verification', value: stats.pending, color: 'text-warning' },
    { icon: CheckCircle, label: 'Approved', value: stats.approved, color: 'text-success' },
    { icon: XCircle, label: 'Rejected', value: stats.rejected, color: 'text-destructive' }
  ];

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      
      <main className="flex-1 p-8 bg-accent/30">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of admission applications</p>
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
            <div className="space-y-4">
              {branchStats.map((branch: any) => (
                <div key={branch.name} className="flex items-center justify-between">
                  <span className="font-medium">{branch.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-3 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(branch.count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-12 text-right">{branch.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
