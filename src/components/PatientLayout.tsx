import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Home, Search, Calendar, Video, TestTube2, Pill, FolderOpen, Shield,
  MessageCircle, Settings, User, Heart, Menu, Bell, MapPin, LogOut,
  ChevronRight, ChevronDown
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/patient/dashboard', label: 'Dashboard', icon: Home, emoji: '🏠' },
  { path: '/patient/find-hospitals', label: 'Find Hospitals', icon: Search, emoji: '🔍' },
  { path: '/patient/appointments', label: 'My Appointments', icon: Calendar, emoji: '📅', badge: true },
  { path: '/patient/teleconsult', label: 'Teleconsult', icon: Video, emoji: '👨‍⚕️' },
  { path: '/patient/lab-tests', label: 'Lab Tests', icon: TestTube2, emoji: '🧪' },
  { path: '/patient/medicines', label: 'Medicines', icon: Pill, emoji: '💊' },
  { path: '/patient/records', label: 'Medical Records', icon: FolderOpen, emoji: '📁' },
  { path: '/patient/insurance', label: 'Insurance', icon: Shield, emoji: '🛡️' },
  { path: '/patient/support', label: 'Support', icon: MessageCircle, emoji: '💬' },
  { path: '/patient/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
  { path: '/patient/profile', label: 'Profile', icon: User, emoji: '👤' },
];

interface PatientLayoutProps {
  children: React.ReactNode;
  upcomingCount?: number;
}

const PatientLayout = ({ children, upcomingCount = 0 }: PatientLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Patient';
  const currentPage = NAV_ITEMS.find(i => location.pathname.startsWith(i.path))?.label || 'Dashboard';

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-[60px]' : 'w-[260px]'} bg-card border-r border-border flex flex-col transition-all duration-300 shrink-0 overflow-hidden`}>
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 h-16 border-b border-border shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <Heart className="h-6 w-6 text-primary fill-primary shrink-0" />
          {!collapsed && <span className="font-heading text-lg font-bold text-primary truncate">MEDICONNECT</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || (item.path !== '/patient/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active
                    ? 'bg-[hsl(214,100%,97%)] text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />}
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-primary' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && upcomingCount > 0 && (
                      <Badge className="ml-auto bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center">
                        {upcomingCount}
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
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-muted/50">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <Link to="/patient/dashboard" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{currentPage}</span>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-md mx-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search hospitals, doctors, specialties..." className="pl-10 h-9 bg-muted/50 border-0 rounded-xl" />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>Chandigarh</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {upcomingCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {upcomingCount}
                </span>
              )}
            </Button>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <User className="h-4 w-4 text-primary" />
              </button>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-10 z-50 w-48 bg-card rounded-xl shadow-lg border border-border py-1">
                    <Link to="/patient/profile" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>My Profile</Link>
                    <Link to="/patient/settings" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>Settings</Link>
                    <hr className="my-1 border-border" />
                    <button onClick={() => { signOut(); setShowUserMenu(false); }} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">
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

export default PatientLayout;
