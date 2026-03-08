import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Insurance from "./pages/Insurance";
import FindHospital from "./pages/FindHospital";
import Hospitals from "./pages/Hospitals";
import HospitalRequest from "./pages/HospitalRequest";
import AuthPage from "./pages/AuthPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientSignup from "./pages/PatientSignup";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalAdminLogin from "./pages/HospitalAdminLogin";
import HospitalAdminDashboard from "./pages/HospitalAdminDashboard";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/find-hospital" element={<FindHospital />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/hospital-request" element={<HospitalRequest />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/patient/signup" element={<PatientSignup />} />
              <Route path="/patient/login" element={<AuthPage />} />
              <Route path="/patient/dashboard" element={<PatientDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
              <Route path="/hospital-admin/dashboard" element={<HospitalAdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
