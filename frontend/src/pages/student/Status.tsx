import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const Status = () => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    fetch('/data/applications.json')
      .then(res => res.json())
      .then(data => {
        const userApp = data.find((app: any) => app.student_id === user?.id);
        setApplication(userApp);
      })
      .catch(err => console.error('Error loading application:', err));
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-success">{status}</Badge>;
      case 'Rejected':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handlePayment = () => {
    toast({
      title: "Payment Gateway",
      description: "Payment integration would be implemented here.",
    });
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-accent/30">
        <header className="bg-card border-b">
          <div className="container mx-auto px-4 py-4">
            <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Application Found</h3>
              <p className="text-muted-foreground mb-4">You haven't submitted an application yet.</p>
              <Link to="/dashboard/apply">
                <Button>Submit Application</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const steps = [
    { label: 'Application Submitted', status: 'complete' },
    { label: 'Documents Verified', status: application.status === 'Rejected' ? 'rejected' : application.status === 'Approved' ? 'complete' : 'pending' },
    { label: 'Application Approved', status: application.status === 'Approved' ? 'complete' : application.status === 'Rejected' ? 'rejected' : 'pending' }
  ];

  return (
    <div className="min-h-screen bg-accent/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Application Status</h1>
          <p className="text-muted-foreground">Track your application progress</p>
        </div>

        <div className="space-y-6">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Application #{application.id}</CardTitle>
                  <CardDescription>Branch: {application.branch}</CardDescription>
                </div>
                {getStatusBadge(application.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Applied Date:</span>
                  <p className="font-medium">{new Date(application.applied_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">{new Date(application.updated_date).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'complete' ? 'bg-success text-success-foreground' :
                        step.status === 'rejected' ? 'bg-destructive text-destructive-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {step.status === 'complete' && <CheckCircle className="h-5 w-5" />}
                        {step.status === 'rejected' && <XCircle className="h-5 w-5" />}
                        {step.status === 'pending' && <Clock className="h-5 w-5" />}
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`w-0.5 h-12 mt-2 ${
                          step.status === 'complete' ? 'bg-success' : 'bg-border'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-semibold">{step.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {step.status === 'complete' ? 'Completed' :
                         step.status === 'rejected' ? 'Rejected' :
                         'In Progress'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          {application.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{application.remarks}</p>
              </CardContent>
            </Card>
          )}

          {/* Payment Section */}
          {application.status === 'Approved' && (
            <Card className="border-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-success" />
                  Pay Admission Fee
                </CardTitle>
                <CardDescription>Your application has been approved! Complete the payment to confirm your admission.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-accent/50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Total Admission Fee:</span>
                    <span className="text-2xl font-bold text-primary">₹95,000</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Includes tuition, lab, library, and admission fees</p>
                </div>
                <Button onClick={handlePayment} className="w-full" size="lg">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Status;
