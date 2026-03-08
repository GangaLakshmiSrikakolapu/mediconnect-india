import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/Header";
import Index from "./pages/Index";
import Insurance from "./pages/Insurance";
import FindHospital from "./pages/FindHospital";
import Hospitals from "./pages/Hospitals";
import HospitalRequest from "./pages/HospitalRequest";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorLogin from "./pages/DoctorLogin";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientLogin from "./pages/PatientLogin";
import PatientSignup from "./pages/PatientSignup";
import PatientDashboard from "./pages/PatientDashboard";
import HospitalAdminLogin from "./pages/HospitalAdminLogin";
import HospitalAdminDashboard from "./pages/HospitalAdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/signup" element={<PatientSignup />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
          <Route path="/hospital-admin/dashboard" element={<HospitalAdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
