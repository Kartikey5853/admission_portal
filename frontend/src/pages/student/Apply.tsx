import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';

const Apply = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();
  const [selectedBranch, setSelectedBranch] = useState('');

  const handleSubmit = async () => {
    if (!selectedBranch) {
      toast({
        title: "Branch Required",
        description: "Please select your preferred branch.",
        variant: "destructive",
      });
      return;
    }

    // Mock application submission
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted for verification.",
      });

      navigate('/dashboard/status');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

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
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Submit Application</h1>
          <p className="text-muted-foreground">Review your details and submit your application for verification</p>
        </div>

        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>Review your details before submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Student ID:</span>
                  <p className="font-medium">{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branch Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Selection</CardTitle>
              <CardDescription>Choose your preferred engineering branch</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="branch">Preferred Branch *</Label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                    <SelectItem value="ECE">Electronics & Communication Engineering</SelectItem>
                    <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                    <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                    <SelectItem value="EEE">Electrical Engineering</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Declaration */}
          <Card>
            <CardHeader>
              <CardTitle>Declaration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-accent/50 p-4 rounded-lg text-sm">
                <p className="mb-2">I hereby declare that:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>All the information provided is true and accurate</li>
                  <li>I have uploaded genuine documents</li>
                  <li>I understand that any false information may lead to cancellation of admission</li>
                  <li>I agree to the terms and conditions of TKRCET</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link to="/dashboard/documents">
              <Button variant="outline">
                Back to Documents
              </Button>
            </Link>
            <Button onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Submit Application for Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;
