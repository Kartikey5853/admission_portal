import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import AdminSidebar from '@/components/AdminSidebar';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [documents, setDocuments] = useState<any>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/data/students.json').then(r => r.json()),
      fetch('/data/applications.json').then(r => r.json()),
      fetch('/data/documents.json').then(r => r.json()),
      fetch('/data/academic_details.json').then(r => r.json())
    ]).then(([studs, apps, docs, academics]) => {
      const stud = studs.find((s: any) => s.id === id);
      const app = apps.find((a: any) => a.student_id === id);
      const doc = docs.find((d: any) => d.student_id === id);
      const acad = academics.find((a: any) => a.student_id === id);
      
      setStudent({ ...stud, ...acad });
      setApplication(app);
      setDocuments(doc);
      setRemarks(app?.remarks || '');
    });
  }, [id]);

  const handleVerify = async (status: 'Approved' | 'Rejected') => {
    if (!remarks.trim()) {
      toast({
        title: "Remarks Required",
        description: "Please add remarks before verifying.",
        variant: "destructive",
      });
      return;
    }

    // Mock update
    await new Promise(resolve => setTimeout(resolve, 500));

    toast({
      title: "Status Updated",
      description: `Application has been ${status.toLowerCase()}.`,
    });

    navigate('/admin/students');
  };

  if (!student || !application) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      
      <main className="flex-1 p-8 bg-accent/30">
        <Link to="/admin/students" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Student Verification</h1>
          <p className="text-muted-foreground">Application ID: {application.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{student.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{student.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span>
                  <p className="font-medium">{student.gender}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">DOB:</span>
                  <p className="font-medium">{new Date(student.dob).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-semibold mb-2">10th Standard</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground">Percentage:</span>
                    <p className="font-medium">{student.tenth_percentage}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Board:</span>
                    <p className="font-medium">{student.tenth_board}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <p className="font-medium">{student.tenth_year}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">12th Standard</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-muted-foreground">Percentage:</span>
                    <p className="font-medium">{student.twelfth_percentage}%</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Board:</span>
                    <p className="font-medium">{student.twelfth_board}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <p className="font-medium">{student.twelfth_year}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {documents && Object.entries(documents).filter(([key]) => !['id', 'student_id', 'uploaded_at'].includes(key)).map(([key, value]: any) => (
                  <a key={key} href={value} target="_blank" rel="noopener noreferrer" className="block">
                    <div className="border rounded-lg p-4 hover:bg-accent transition-colors text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium capitalize">{key.replace('_', ' ')}</p>
                      <Button variant="link" size="sm" className="mt-2">View</Button>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verification Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Verification Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="remarks">Remarks *</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add your verification remarks here..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={() => handleVerify('Approved')} className="flex-1 bg-success hover:bg-success/90">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve Application
                </Button>
                <Button onClick={() => handleVerify('Rejected')} variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StudentDetail;
