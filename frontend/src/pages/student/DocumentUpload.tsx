import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import api from '@/services/api'; // Import our Axios service

// This is the shape of a document from our backend
interface Document {
  doc_type: string;
  file_url: string;
}

const DocumentUpload = () => {
  const { toast } = useToast();
  
  // State for files selected in the input (waiting to be uploaded)
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
  
  // State for documents that are already on the server
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: string }>({});
  
  const [isLoading, setIsLoading] = useState(true);

  // This is the list of all documents your component already defined
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

  // --- 1. Fetch existing documents when page loads ---
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await api.get<Document[]>('/student/documents');
        
        // Convert the array response into an easy-to-use map
        const docsMap = response.data.reduce((acc, doc) => {
          acc[doc.doc_type] = doc.file_url;
          return acc;
        }, {} as { [key: string]: string });
        
        setUploadedDocs(docsMap);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        toast({
          title: "Error",
          description: "Could not load your document status.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocuments();
  }, [toast]);

  // --- 2. Handle file selection ---
  const handleFileChange = (docId: string, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [docId]: file }));
  };

  // --- 3. Handle the actual upload to the backend ---
  const handleUpload = async (docId: string) => {
    const file = selectedFiles[docId as keyof typeof selectedFiles];
    if (!file) return;

    // We must use FormData to send files
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docId);

    try {
      // Call the new backend endpoint
      const response = await api.post<Document>('/student/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newDoc = response.data;

      // Update our state to show the new "Uploaded" file
      setUploadedDocs(prev => ({ ...prev, [newDoc.doc_type]: newDoc.file_url }));
      
      // Clear the selected file from the input
      setSelectedFiles(prev => ({ ...prev, [docId]: null }));

      toast({
        title: "Upload Successful",
        description: `${file.name} has been uploaded.`,
      });

    } catch (error: any) {
      const message = error.response?.data?.detail || "Upload failed.";
      toast({
        title: "Upload Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  // Check if all *required* documents are in the uploadedDocs state
  const allRequiredUploaded = documents
    .filter(doc => doc.required)
    .every(doc => uploadedDocs[doc.id]);

  if (isLoading) {
    return <div>Loading document status...</div>;
  }
  
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
              // Check if a file is newly selected
              const selectedFile = selectedFiles[doc.id as keyof typeof selectedFiles];
              
              // Check if a file is already on the server
              const fileUrl = uploadedDocs[doc.id as keyof typeof uploadedDocs];
              
              const isUploaded = !!fileUrl;

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
                      {selectedFile && (
                        <p className="text-sm text-blue-600 mt-2">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 pt-6">
                      {isUploaded ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Uploaded</span>
                          <a href={`http://localhost:8000${fileUrl}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleUpload(doc.id)}
                          disabled={!selectedFile}
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

            {allRequiredUploaded && (
              <div className="bg-success/10 border border-success rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-semibold text-success">All required documents uploaded!</p>
                  <p className="text-sm text-muted-foreground">You can now proceed to submit your application</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Link to="/dashboard/apply">
                <Button disabled={!allRequiredUploaded}>
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