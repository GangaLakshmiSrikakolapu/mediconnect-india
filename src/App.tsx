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
import PatientFindHospitals from "./pages/PatientFindHospitals";
import PatientHospitalDetail from "./pages/PatientHospitalDetail";
import PatientAppointments from "./pages/PatientAppointments";
import PatientRecords from "./pages/PatientRecords";
import PatientInsurance from "./pages/PatientInsurance";
import PatientProfile from "./pages/PatientProfile";
import PatientSettings from "./pages/PatientSettings";
import HospitalAdminLogin from "./pages/HospitalAdminLogin";
import HospitalDashboardHome from "./pages/HospitalDashboardHome";
import HospitalAppointments from "./pages/HospitalAppointments";
import HospitalDoctors from "./pages/HospitalDoctors";
import HospitalDepartments from "./pages/HospitalDepartments";
import HospitalPatients from "./pages/HospitalPatients";
import HospitalAnalytics from "./pages/HospitalAnalytics";
import HospitalReviews from "./pages/HospitalReviews";
import HospitalSettings from "./pages/HospitalSettings";
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
              <Route path="/patient/find-hospitals" element={<PatientFindHospitals />} />
              <Route path="/patient/hospital/:id" element={<PatientHospitalDetail />} />
              <Route path="/patient/appointments" element={<PatientAppointments />} />
              <Route path="/patient/records" element={<PatientRecords />} />
              <Route path="/patient/insurance" element={<PatientInsurance />} />
              <Route path="/patient/profile" element={<PatientProfile />} />
              <Route path="/patient/settings" element={<PatientSettings />} />
              <Route path="/patient/teleconsult" element={<PatientDashboard />} />
              <Route path="/patient/lab-tests" element={<PatientDashboard />} />
              <Route path="/patient/medicines" element={<PatientDashboard />} />
              <Route path="/patient/support" element={<PatientDashboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/hospital-admin/login" element={<HospitalAdminLogin />} />
              <Route path="/hospital/dashboard" element={<HospitalDashboardHome />} />
              <Route path="/hospital/appointments" element={<HospitalAppointments />} />
              <Route path="/hospital/doctors" element={<HospitalDoctors />} />
              <Route path="/hospital/departments" element={<HospitalDepartments />} />
              <Route path="/hospital/patients" element={<HospitalPatients />} />
              <Route path="/hospital/analytics" element={<HospitalAnalytics />} />
              <Route path="/hospital/reviews" element={<HospitalReviews />} />
              <Route path="/hospital/settings" element={<HospitalSettings />} />
              <Route path="/hospital/staff" element={<HospitalSettings />} />
              <Route path="/hospital/billing" element={<HospitalSettings />} />
              <Route path="/hospital/announcements" element={<HospitalDashboardHome />} />
              {/* Legacy redirect */}
              <Route path="/hospital-admin/dashboard" element={<HospitalDashboardHome />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
