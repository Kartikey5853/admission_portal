import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Landing = () => {
  const [courses, setCourses] = useState([]);
  const [feeStructure, setFeeStructure] = useState([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/data/colleges.json')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error loading courses:', err));

    fetch('/data/fee_structure.json')
      .then(res => res.json())
      .then(data => setFeeStructure(data))
      .catch(err => console.error('Error loading fee structure:', err));

    fetch('/data/settings.json')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error loading settings:', err));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to TKRCET
            </h1>
            <p className="text-2xl mb-4 opacity-90">Your Future Starts Here</p>
            <p className="text-lg mb-8 opacity-80">
              Telangana Kakatiya Residential College of Engineering and Technology
            </p>
            
            {settings?.notification_banner && (
              <Alert className="mb-8 bg-card text-card-foreground border-2">
                <AlertDescription className="text-center">
                  {settings.notification_banner}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Apply Now <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Student Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: GraduationCap, label: 'Engineering Programs', value: '5+' },
              { icon: Users, label: 'Total Seats', value: '420' },
              { icon: Award, label: 'Years of Excellence', value: '15+' },
              { icon: BookOpen, label: 'Qualified Faculty', value: '50+' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About TKRCET</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Telangana Kakatiya Residential College of Engineering and Technology is a premier 
              institution committed to providing quality technical education. Established under the 
              Government of Telangana, we offer undergraduate engineering programs with state-of-the-art 
              infrastructure, experienced faculty, and excellent placement opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16 bg-accent/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Courses Offered</h2>
            <p className="text-muted-foreground">Choose from our wide range of engineering programs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    {course.code}
                  </CardTitle>
                  <CardDescription>{course.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Seats:</span>
                      <span className="font-medium">{course.seats}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fee Structure Section */}
      <section id="fees" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fee Structure</h2>
            <p className="text-muted-foreground">Transparent and affordable education</p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructure.map((fee: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{fee.category}</TableCell>
                      <TableCell>{fee.frequency}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{fee.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
