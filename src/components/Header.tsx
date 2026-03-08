import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  // Hide header on auth, dashboard, and admin pages
  if (location.pathname === '/auth' || location.pathname === '/auth/reset-password') return null;
  if (location.pathname.startsWith('/patient/')) return null;
  if (location.pathname.startsWith('/hospital/')) return null;
  if (location.pathname.startsWith('/superadmin/')) return null;
  if (location.pathname.startsWith('/admin/')) return null;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/find-hospital', label: 'Find Hospital' },
    { path: '/hospitals', label: 'For Hospitals' },
    { path: '/insurance', label: 'Insurance' },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isLanding = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 border-b transition-all ${isLanding ? 'bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80' : 'bg-card shadow-sm'}`}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="font-heading text-xl font-bold text-primary">MEDICONNECT</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to={role === 'patient' ? '/patient/dashboard' : role === 'superAdmin' ? '/superadmin/dashboard' : role === 'hospitalAdmin' ? '/hospital/dashboard' : '/'}>
                <Button variant="outline" size="sm" className="hidden md:inline-flex gap-2">
                  <User className="h-4 w-4" />Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="hidden md:inline-flex gap-2" onClick={signOut}>
                <LogOut className="h-4 w-4" />Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="hidden md:inline-flex gap-2 rounded-full">
                <User className="h-4 w-4" />Sign In
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="lg:hidden border-t bg-card p-4 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { signOut(); setMobileOpen(false); }}
              className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
              Sign Out
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-muted">
              Sign In
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
