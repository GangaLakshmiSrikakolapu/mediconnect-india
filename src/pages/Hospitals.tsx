import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ShieldCheck, Users, ArrowRight } from 'lucide-react';

const Hospitals = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-16 max-w-3xl animate-fade-in">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">For Hospitals</h1>
          <p className="text-muted-foreground text-lg">Register, manage, and grow your hospital on MediConnect</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link to="/hospital-request">
            <Card className="h-full border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Register Hospital</h3>
                <p className="text-sm text-muted-foreground mb-4">Submit your hospital to be listed on MediConnect India</p>
                <Button variant="outline" className="rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Get Started <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/auth">
            <Card className="h-full border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer group">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Hospital Dashboard</h3>
                <p className="text-sm text-muted-foreground mb-4">Manage appointments, doctors, and analytics</p>
                <Button variant="outline" className="rounded-xl group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                  Login <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/login">
            <Card className="h-full border-0 card-shadow hover:card-shadow-lg transition-all cursor-pointer group sm:col-span-2">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-warning/20 transition-colors">
                  <ShieldCheck className="h-8 w-8 text-warning" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Super Admin Portal</h3>
                <p className="text-sm text-muted-foreground mb-4">Platform-wide hospital approval and management</p>
                <Button variant="outline" className="rounded-xl">
                  Admin Login <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
