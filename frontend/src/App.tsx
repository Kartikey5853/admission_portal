import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; 
import { useAuth, AuthProvider } from './context/AuthContext'; 

// Page Imports
import Landing from "./pages/Landing";
import Register from "./pages/student/Register";
import Login from "./pages/student/Login";
import Dashboard from "./pages/student/Dashboard";
import DocumentUpload from "./pages/student/DocumentUpload";
import Apply from "./pages/student/Apply";
import Status from "./pages/student/Status";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import StudentDetail from "./pages/admin/StudentDetail";
import Colleges from "./pages/admin/Colleges";
import AdminSettings from "./pages/admin/Settings";
import ProtectedRoute from "./components/ProtectedRoute"; // Student protector
import AdminProtectedRoute from "./components/AdminProtectedRoute"; // Admin protector
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { auth } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* === Auth Routes === */}
      <Route 
        path="/login" 
        element={auth ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={auth ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      
      {/* === Student Routes (Nested) === */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/documents" element={<DocumentUpload />} />
        <Route path="/dashboard/apply" element={<Apply />} />
        <Route path="/dashboard/status" element={<Status />} />
      </Route>
      
      {/* === Admin Routes (Nested) === */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<Students />} />
        <Route path="/admin/students/:id" element={<StudentDetail />} />
        <Route path="/admin/colleges" element={<Colleges />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes /> 
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;