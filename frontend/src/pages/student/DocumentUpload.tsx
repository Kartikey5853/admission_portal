import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';

const DocumentUpload = () => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const [uploads, setUploads] = useState({
    tenth_memo: null as File | null,
    tenth_bonafide: null as File | null,
    tenth_transfer_certificate: null as File | null,
    twelth_memo: null as File | null,
    twelth_bonafide: null as File | null,
    twelth_transfer_certificate: null as File | null,
    ecet_eamcet: null as File | null,
    rank_card: null as File | null,
    allotment_order: null as File | null,
    joining_report: null as File | null,
    aadhar: null as File | null,
    caste_certificate: null as File | null,
    income_certificate: null as File | null,
    photo: null as File | null,
  });

  const documents = [
    { id: 'tenth_memo', label: '10th Marksheet', required: true },
    { id: 'tenth_bonafide', label: 'School Bonafide (4th-10th)', required: true },
    { id: 'tenth_transfer_certificate', label: '10th Transfer Certificate', required: true },
    { id: 'twelth_memo', label: '12th Marksheet', required: true },
    { id: 'twelth_bonafide', label: '12th Bonafide', required: true },
    { id: 'twelth_transfer_certificate', label: '12th Transfer Certificate', required: true },
    { id: 'ecet_eamcet', label: 'ECET/EAMCET Hallticket', required: true },
    { id: 'rank_card', label: 'Rank Card', required: true },
    { id: 'allotment_order', label: 'Allotment Order', required: true },
    { id: 'joining_report', label: 'Joining Report', required: true },
    { id: 'aadhar', label: 'Aadhar', required: true },
    { id: 'caste_certificate', label: 'Caste Certificate', required: true },
    { id: 'income_certificate', label: 'Income Certificate', required: true },
    { id: 'photo', label: 'Passport Photo', required: true },
  ];

  const handleFileChange = (docId: string, file: File | null) => {
    setUploads(prev => ({ ...prev, [docId]: file }));
  };

  const handleUpload = (docId: string) => {
    const file = uploads[docId as keyof typeof uploads];
    if (!file) return;

    // Mock upload
    toast({
      title: "Upload Successful",
      description: `${file.name} has been uploaded successfully.`,
    });
  };

  const allUploaded = Object.values(uploads).every(file => file !== null);

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
          <h1 className="text-3xl font-bold mb-2">Upload Documents</h1>
          <p className="text-muted-foreground">Upload all required documents for verification</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>All documents must be in PDF or image format (max 5MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {documents.map((doc) => {
              const file = uploads[doc.id as keyof typeof uploads];
              const isUploaded = file !== null;

              return (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Label htmlFor={doc.id} className="text-base font-semibold">
                        {doc.label}
                        {doc.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <div className="mt-2">
                        <Input
                          id={doc.id}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                          className="cursor-pointer"
                        />
                      </div>
                      {file && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Selected: {file.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isUploaded ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Uploaded</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleUpload(doc.id)}
                          disabled={!file}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {allUploaded && (
              <div className="bg-success/10 border border-success rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold text-success">All documents uploaded!</p>
                  <p className="text-sm text-muted-foreground">You can now proceed to submit your application</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Link to="/dashboard/apply">
                <Button disabled={!allUploaded}>
                  Continue to Application
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentUpload;
