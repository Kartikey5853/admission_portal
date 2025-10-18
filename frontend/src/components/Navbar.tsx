import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-foreground">TKRCET</span>
            <span className="text-xs text-muted-foreground">Admission Portal</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/#courses" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Courses
          </Link>
          <Link to="/#fees" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Fee Structure
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Student Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">
              Apply Now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
