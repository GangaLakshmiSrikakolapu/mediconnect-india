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
import PatientSignup from "./pages/PatientSignup";
import PatientDashboard from "./pages/PatientDashboard";
import PatientFindHospitals from "./pages/PatientFindHospitals";
import PatientHospitalDetail from "./pages/PatientHospitalDetail";
import PatientAppointments from "./pages/PatientAppointments";
import PatientRecords from "./pages/PatientRecords";
import PatientInsurance from "./pages/PatientInsurance";
import PatientProfile from "./pages/PatientProfile";
import PatientSettings from "./pages/PatientSettings";
import HospitalDashboardHome from "./pages/HospitalDashboardHome";
import HospitalAppointments from "./pages/HospitalAppointments";
import HospitalDoctors from "./pages/HospitalDoctors";
import HospitalDepartments from "./pages/HospitalDepartments";
import HospitalPatients from "./pages/HospitalPatients";
import HospitalAnalytics from "./pages/HospitalAnalytics";
import HospitalReviews from "./pages/HospitalReviews";
import HospitalSettings from "./pages/HospitalSettings";
import HospitalInsurancePlans from "./pages/HospitalInsurancePlans";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminHospitals from "./pages/SuperAdminHospitals";
import SuperAdminPatients from "./pages/SuperAdminPatients";
import SuperAdminAppointments from "./pages/SuperAdminAppointments";
import SuperAdminRevenue from "./pages/SuperAdminRevenue";
import SuperAdminInsurance from "./pages/SuperAdminInsurance";
import SuperAdminContent from "./pages/SuperAdminContent";
import SuperAdminSettings from "./pages/SuperAdminSettings";
import SuperAdminAuditLogs from "./pages/SuperAdminAuditLogs";
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
              <Route path="/register/hospital" element={<HospitalRequest />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/patient/signup" element={<PatientSignup />} />
              <Route path="/patient/login" element={<AuthPage />} />
              {/* Patient Dashboard */}
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
              {/* Hospital Admin Dashboard */}
              <Route path="/hospital/dashboard" element={<HospitalDashboardHome />} />
              <Route path="/hospital/appointments" element={<HospitalAppointments />} />
              <Route path="/hospital/doctors" element={<HospitalDoctors />} />
              <Route path="/hospital/departments" element={<HospitalDepartments />} />
              <Route path="/hospital/patients" element={<HospitalPatients />} />
              <Route path="/hospital/analytics" element={<HospitalAnalytics />} />
              <Route path="/hospital/reviews" element={<HospitalReviews />} />
              <Route path="/hospital/insurance" element={<HospitalInsurancePlans />} />
              <Route path="/hospital/settings" element={<HospitalSettings />} />
              <Route path="/hospital/staff" element={<HospitalSettings />} />
              <Route path="/hospital/billing" element={<HospitalSettings />} />
              <Route path="/hospital/announcements" element={<HospitalDashboardHome />} />
              {/* Super Admin Dashboard */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/hospitals" element={<SuperAdminHospitals />} />
              <Route path="/superadmin/patients" element={<SuperAdminPatients />} />
              <Route path="/superadmin/appointments" element={<SuperAdminAppointments />} />
              <Route path="/superadmin/revenue" element={<SuperAdminRevenue />} />
              <Route path="/superadmin/insurance" element={<SuperAdminInsurance />} />
              <Route path="/superadmin/content" element={<SuperAdminContent />} />
              <Route path="/superadmin/settings" element={<SuperAdminSettings />} />
              <Route path="/superadmin/audit-logs" element={<SuperAdminAuditLogs />} />
              {/* Legacy */}
              <Route path="/hospital-admin/login" element={<AuthPage />} />
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
