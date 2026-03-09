import { Link, useLocation } from 'react-router-dom';
import { useLanguage, languageNames, Language } from '@/contexts/LanguageContext';
import { usePatient } from '@/contexts/PatientContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Menu, X, User, LogOut, CalendarDays, Edit } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { patient, isLoggedIn, logout } = usePatient();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/', label: t.nav.home },
    { path: '/hospitals', label: t.nav.hospitals },
    { path: '/find-hospital', label: 'Appointments' },
    { path: '/insurance', label: t.nav.info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="font-heading text-xl font-bold text-primary">MEDICONNECT</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!isLoggedIn ? (
            <Link
              to="/patient/login"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/patient/login')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Login
            </Link>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="max-w-[100px] truncate">{patient?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/my-appointments" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />My Appointments
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/edit-profile" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Link
            to="/admin/login"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin/login')
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            Super Admin
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
            <SelectTrigger className="w-[130px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(languageNames) as [Language, string][]).map(([code, name]) => (
                <SelectItem key={code} value={code}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-card p-4 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!isLoggedIn ? (
            <Link to="/patient/login" onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
              Login
            </Link>
          ) : (
            <>
              <Link to="/my-appointments" onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
                My Appointments
              </Link>
              <Link to="/edit-profile" onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
                Edit Profile
              </Link>
              <button onClick={() => { logout(); setMobileOpen(false); }}
                className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-muted">
                Logout
              </button>
            </>
          )}
          <Link to="/admin/login" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted">
            Super Admin
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
