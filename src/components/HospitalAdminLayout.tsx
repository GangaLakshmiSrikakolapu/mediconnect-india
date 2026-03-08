import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3, Calendar, Users, Building2, UserCheck, FileText, Star,
  HardHat, CreditCard, Settings, Megaphone, Menu, Bell, User,
  ChevronRight, ChevronDown, LogOut, Heart, CheckCircle
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/hospital/dashboard', label: 'Dashboard', icon: BarChart3, emoji: '📊' },
  { path: '/hospital/appointments', label: 'Appointments', icon: Calendar, emoji: '📅', badge: true },
  { path: '/hospital/doctors', label: 'Doctors', icon: Users, emoji: '👨‍⚕️' },
  { path: '/hospital/departments', label: 'Departments', icon: Building2, emoji: '🏢' },
  { path: '/hospital/patients', label: 'Patients', icon: UserCheck, emoji: '👥' },
  { path: '/hospital/analytics', label: 'Reports & Analytics', icon: FileText, emoji: '📋' },
  { path: '/hospital/reviews', label: 'Reviews', icon: Star, emoji: '⭐' },
  { path: '/hospital/staff', label: 'Staff', icon: HardHat, emoji: '👷' },
  { path: '/hospital/billing', label: 'Billing', icon: CreditCard, emoji: '💳' },
  { path: '/hospital/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
  { path: '/hospital/announcements', label: 'Announcements', icon: Megaphone, emoji: '📢' },
];

interface HospitalAdminLayoutProps {
  children: React.ReactNode;
  hospital?: any;
  pendingCount?: number;
}

const HospitalAdminLayout = ({ children, hospital, pendingCount = 0 }: HospitalAdminLayoutProps) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const hospitalName = hospital?.name || 'Hospital';
  const currentPage = NAV_ITEMS.find(i => location.pathname === i.path || (i.path !== '/hospital/dashboard' && location.pathname.startsWith(i.path)))?.label || 'Dashboard';

  const handleLogout = () => {
    sessionStorage.removeItem('mediconnect_hospital_admin');
    window.location.href = '/hospital-admin/login';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[60px]' : 'w-[260px]'} bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0 overflow-hidden`}>
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 h-14 border-b border-border shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <Heart className="h-5 w-5 text-accent fill-accent shrink-0" />
          {!collapsed && <span className="font-heading text-base font-bold text-accent truncate">MEDICONNECT</span>}
        </div>

        {/* Hospital info */}
        {!collapsed && hospital && (
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{hospitalName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{hospital.district}, {hospital.state}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || (item.path !== '/hospital/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent rounded-r-full" />}
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-accent' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && pendingCount > 0 && (
                      <Badge className="ml-auto bg-warning text-warning-foreground text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center">
                        {pendingCount}
                      </Badge>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {!collapsed && (
          <div className="p-3 border-t border-border shrink-0">
            <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-muted hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0 h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <Link to="/hospital/dashboard" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-sm font-medium">
              {hospitalName}
              <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10">
                <CheckCircle className="h-3 w-3 mr-1" />Verified
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center hover:bg-accent/20 transition-colors">
                <User className="h-4 w-4 text-accent" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-10 z-50 w-48 bg-card rounded-xl shadow-lg border border-border py-1">
                    <Link to="/hospital/settings" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>Settings</Link>
                    <hr className="my-1 border-border" />
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">
                      <LogOut className="h-3.5 w-3.5 inline mr-2" />Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default HospitalAdminLayout;
