import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  BarChart3, Building2, Users, Calendar, IndianRupee, Shield, FileText,
  Settings, ScrollText, Menu, Bell, User, ChevronRight, LogOut, Heart,
  CheckCircle, Search
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/superadmin/dashboard', label: 'Dashboard', icon: BarChart3, emoji: '📊' },
  { path: '/superadmin/hospitals', label: 'Hospitals', icon: Building2, emoji: '🏥', badge: true },
  { path: '/superadmin/patients', label: 'Patients', icon: Users, emoji: '👥' },
  { path: '/superadmin/appointments', label: 'Appointments', icon: Calendar, emoji: '📅' },
  { path: '/superadmin/revenue', label: 'Revenue', icon: IndianRupee, emoji: '💰' },
  { path: '/superadmin/insurance', label: 'Insurance', icon: Shield, emoji: '🛡️' },
  { path: '/superadmin/content', label: 'Content (CMS)', icon: FileText, emoji: '📢' },
  { path: '/superadmin/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
  { path: '/superadmin/audit-logs', label: 'Audit Logs', icon: ScrollText, emoji: '📜' },
];

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  pendingHospitals?: number;
}

const SuperAdminLayout = ({ children, pendingHospitals = 0 }: SuperAdminLayoutProps) => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentPage = NAV_ITEMS.find(i => location.pathname === i.path || (i.path !== '/superadmin/dashboard' && location.pathname.startsWith(i.path)))?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Dark Navy Sidebar */}
      <aside className={`${collapsed ? 'w-[60px]' : 'w-[260px]'} flex flex-col transition-all duration-300 shrink-0 overflow-hidden`}
        style={{ background: 'hsl(215, 50%, 8%)' }}>
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 h-14 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <Heart className="h-5 w-5 text-white fill-white/20 shrink-0" />
          {!collapsed && <span className="font-heading text-base font-bold text-white truncate">MEDICONNECT</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || (item.path !== '/superadmin/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />}
                <item.icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-white' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.badge && pendingHospitals > 0 && (
                      <Badge className="ml-auto bg-warning text-warning-foreground text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center">
                        {pendingHospitals}
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
          <div className="p-3 border-t border-white/10 shrink-0">
            <button onClick={() => signOut()} className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-white/50 hover:bg-white/5 hover:text-white/80 transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar - white */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="shrink-0 h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              <Link to="/superadmin/dashboard" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-foreground font-medium">{currentPage}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] border-success/30 text-success bg-success/10 hidden md:flex">
              <CheckCircle className="h-3 w-3 mr-1" />All Systems Operational
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {pendingHospitals > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                  {pendingHospitals}
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
                    <Link to="/superadmin/settings" className="block px-4 py-2 text-sm hover:bg-muted" onClick={() => setShowUserMenu(false)}>Settings</Link>
                    <hr className="my-1 border-border" />
                    <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted">
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

export default SuperAdminLayout;
