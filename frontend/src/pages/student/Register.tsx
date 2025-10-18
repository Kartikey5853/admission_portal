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

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Details
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    gender: '',
    // Academic Details
    tenthPercentage: '',
    tenthBoard: '',
    tenthYear: '',
    twelfthPercentage: '',
    twelfthBoard: '',
    twelfthYear: '',
    // Branch Preference
    branchPreference: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Mock registration - in real app, would POST to server
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Registration Successful!",
        description: "Please login with your credentials.",
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later.",
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
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mt-6 mb-2">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      step >= s ? 'bg-primary border-primary text-primary-foreground' : 'border-border'
                    }`}>
                      {step > s ? <Check className="h-5 w-5" /> : s}
                    </div>
                    {s < 3 && (
                      <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                        step > s ? 'bg-primary' : 'bg-border'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Basic Details</span>
                <span>Academic Info</span>
                <span>Branch Preference</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Basic Details */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Create a strong password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dob">Date of Birth *</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleChange('dob', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(val) => handleChange('gender', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Step 2: Academic Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="pb-4 border-b">
                    <h3 className="font-semibold mb-4">10th Standard Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="tenthPercentage">Percentage *</Label>
                        <Input
                          id="tenthPercentage"
                          type="number"
                          value={formData.tenthPercentage}
                          onChange={(e) => handleChange('tenthPercentage', e.target.value)}
                          placeholder="85.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenthBoard">Board *</Label>
                        <Input
                          id="tenthBoard"
                          value={formData.tenthBoard}
                          onChange={(e) => handleChange('tenthBoard', e.target.value)}
                          placeholder="SSC"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tenthYear">Year *</Label>
                        <Input
                          id="tenthYear"
                          type="number"
                          value={formData.tenthYear}
                          onChange={(e) => handleChange('tenthYear', e.target.value)}
                          placeholder="2021"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">12th Standard Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="twelfthPercentage">Percentage *</Label>
                        <Input
                          id="twelfthPercentage"
                          type="number"
                          value={formData.twelfthPercentage}
                          onChange={(e) => handleChange('twelfthPercentage', e.target.value)}
                          placeholder="88.0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twelfthBoard">Board *</Label>
                        <Input
                          id="twelfthBoard"
                          value={formData.twelfthBoard}
                          onChange={(e) => handleChange('twelfthBoard', e.target.value)}
                          placeholder="Intermediate"
                        />
                      </div>
                      <div>
                        <Label htmlFor="twelfthYear">Year *</Label>
                        <Input
                          id="twelfthYear"
                          type="number"
                          value={formData.twelfthYear}
                          onChange={(e) => handleChange('twelfthYear', e.target.value)}
                          placeholder="2023"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Branch Preference */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="branch">Branch Preference *</Label>
                    <Select value={formData.branchPreference} onValueChange={(val) => handleChange('branchPreference', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CSE">Computer Science Engineering</SelectItem>
                        <SelectItem value="ECE">Electronics & Communication</SelectItem>
                        <SelectItem value="MECH">Mechanical Engineering</SelectItem>
                        <SelectItem value="CIVIL">Civil Engineering</SelectItem>
                        <SelectItem value="EEE">Electrical Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-accent/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Review Your Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Name: {formData.name}</p>
                      <p>Email: {formData.email}</p>
                      <p>Phone: {formData.phone}</p>
                      <p>Branch: {formData.branchPreference}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
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

                {step < 3 ? (
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
