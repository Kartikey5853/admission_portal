import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-lg font-bold">TKRCET</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Telangana Kakatiya Residential College of Engineering and Technology
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Your Future Starts Here
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
              <li><a href="/#courses" className="hover:text-primary transition-colors">Courses</a></li>
              <li><a href="/#fees" className="hover:text-primary transition-colors">Fee Structure</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">Student Portal</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Warangal, Telangana</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>admissions@tkrcet.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TKRCET. All rights reserved. | Government of Telangana</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
