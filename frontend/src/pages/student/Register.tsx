import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import api from '@/services/api'; // 1. IMPORT AXIOS SERVICE

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // 2. CORRECTED: State matches the backend StudentCreate schema
  const [formData, setFormData] = useState({
    // StudentBase fields
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: '',
    aadhar_no: '',
    address: '',
    district: '',
    category: '',

    // Nested academic_details fields
    academic_details: {
      exam_board: '',
      hall_ticket_no: '',
      marks_obtained: '', // Will be sent as number
      max_marks: '',      // Will be sent as number
      percentage: '',     // Will be sent as number
      passed_year: ''     // Will be sent as number
    }
  });

  // 3. UNIFIED: Handles both top-level and nested state changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAcademicChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      academic_details: {
        ...prev.academic_details,
        [field]: value
      }
    }));
  };

  // 4. UPDATED: handleSubmit uses Axios and sends corrected data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 5. CONVERT: Change empty strings/string numbers to null/numbers
    const dataToSend = {
      ...formData,
      // Convert academic fields to numbers, or null if empty
      academic_details: {
        exam_board: formData.academic_details.exam_board,
        hall_ticket_no: formData.academic_details.hall_ticket_no,
        marks_obtained: Number(formData.academic_details.marks_obtained) || null,
        max_marks: Number(formData.academic_details.max_marks) || null,
        percentage: parseFloat(formData.academic_details.percentage) || null,
        passed_year: Number(formData.academic_details.passed_year) || null,
      },
      // Ensure optional fields are null if empty
      dob: formData.dob || null,
      gender: formData.gender || null,
      category: formData.category || null,
    };

    try {
      // 6. USE AXIOS: Call the /register endpoint with our formatted data
      await api.post('/register', dataToSend);

      toast({
        title: "Registration Successful!",
        description: "Please login with your credentials.",
      });
      navigate('/login');

    } catch (error: any) {
      // Axios puts the error response in error.response
      const message = error.response?.data?.detail || "An unknown error occurred.";
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-accent/30 py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Student Registration</CardTitle>
              <CardDescription>Complete all steps to create your account</CardDescription>
              
              {/* Progress Steps (NOW 2 STEPS) */}
              <div className="flex items-center justify-between mt-6 mb-2">
                {[1, 2].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      step >= s ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                    }`}>
                      {step > s ? <Check className="h-5 w-5" /> : s}
                    </div>
                    {s < 2 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                        step > s ? 'bg-primary' : 'bg-border'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex-1">Basic Details</span>
                <span className="flex-1 text-right">Academic Info</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Details */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fields from your original Step 1 */}
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(val) => handleChange('gender', val)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* ADDED: Missing fields from schema */}
                  <div>
                    <Label htmlFor="aadhar_no">Aadhar Number</Label>
                    <Input id="aadhar_no" value={formData.aadhar_no} onChange={(e) => handleChange('aadhar_no', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input id="district" value={formData.district} onChange={(e) => handleChange('district', e.target.value)} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(val) => handleChange('category', val)}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OC">OC</SelectItem>
                        <SelectItem value="BC">BC</SelectItem>
                        <SelectItem value="SC">SC</SelectItem>
                        <SelectItem value="ST">ST</SelectItem>
                        <SelectItem value="EWS">EWS</SelectItem>
                        <SelectItem value="Minority">Minority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-4">Qualifying Exam Details (12th / Diploma)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* UPDATED: Fields match 'academic_details' object */}
                    <div>
                      <Label htmlFor="exam_board">Board (e.g., Intermediate, CBSE)</Label>
                      <Input id="exam_board" value={formData.academic_details.exam_board} onChange={(e) => handleAcademicChange('exam_board', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="hall_ticket_no">Hall Ticket Number</Label>
                      <Input id="hall_ticket_no" value={formData.academic_details.hall_ticket_no} onChange={(e) => handleAcademicChange('hall_ticket_no', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="marks_obtained">Marks Obtained</Label>
                      <Input id="marks_obtained" type="number" value={formData.academic_details.marks_obtained} onChange={(e) => handleAcademicChange('marks_obtained', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="max_marks">Maximum Marks</Label>
                      <Input id="max_marks" type="number" value={formData.academic_details.max_marks} onChange={(e) => handleAcademicChange('max_marks', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="percentage">Percentage</Label>
                      <Input id="percentage" type="number" value={formData.academic_details.percentage} onChange={(e) => handleAcademicChange('percentage', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="passed_year">Year of Passing</Label>
                      <Input id="passed_year" type="number" value={formData.academic_details.passed_year} onChange={(e) => handleAcademicChange('passed_year', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons (Updated for 2 steps) */}
              <div className="flex justify-between pt-4">
                {step > 1 ? (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button variant="ghost">Already have an account?</Button>
                  </Link>
                )}

                {step < 2 ? (
                  <Button onClick={() => setStep(step + 1)}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    Complete Registration
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Register;