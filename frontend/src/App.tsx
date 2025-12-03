import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from './context/AuthContext'; // Import both

// --- Page Imports ---
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
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// --- This component holds all your routing logic ---
const AppRoutes = () => {
  const { auth } = useAuth();

  // --- DEBUG LINE ---
  console.log("AppRoutes re-rendered. Auth state is:", auth);

  return (
    <Routes>
      {/* === Public Routes === */}
      <Route path="/" element={<Landing />} />

      {/* === Auth Routes === */}
      {/* This logic handles automatic redirection */}
      <Route 
        path="/login" 
        element={auth ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={auth ? <Navigate to="/dashboard" replace /> : <Register />} 
      />
      <Route 
        path="/admin/login" 
        element={auth && auth.user.role !== 'student' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin />} 
      />
      
      {/* === Student Routes (Corrected Layout) === */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/documents" element={<DocumentUpload />} />
        <Route path="/dashboard/apply" element={<Apply />} />
        <Route path="/dashboard/status" element={<Status />} />
      </Route>
      
      {/* === Admin Routes (Corrected Layout) === */}
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

// --- Your main App component just sets up the providers ---
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          {/* --- THIS IS THE FIX --- */}
          {/* We render the AppRoutes component here */}
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;