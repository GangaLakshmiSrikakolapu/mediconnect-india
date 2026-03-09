import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PatientProvider } from "@/contexts/PatientContext";
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
import MyAppointments from "./pages/MyAppointments";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <PatientProvider>
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
              <Route path="/my-appointments" element={<MyAppointments />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PatientProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
