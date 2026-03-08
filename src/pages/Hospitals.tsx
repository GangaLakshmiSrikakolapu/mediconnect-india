import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, ShieldCheck } from 'lucide-react';

const Hospitals = () => {
  const { t } = useLanguage();
  return (
    <div className="container py-12 max-w-2xl animate-fade-in">
      <h1 className="font-heading text-3xl font-bold text-center mb-8">{t.hospitalMenu.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link to="/hospital-request">
          <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full bg-primary/10 p-4 mb-2"><Hospital className="h-8 w-8 text-primary" /></div>
              <CardTitle>{t.hospitalMenu.request}</CardTitle>
            </CardHeader>
            <CardContent><CardDescription className="text-center">{t.hospitalMenu.requestDesc}</CardDescription></CardContent>
          </Card>
        </Link>
        <Link to="/admin/login">
          <Card className="h-full hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto rounded-full bg-accent/10 p-4 mb-2"><ShieldCheck className="h-8 w-8 text-accent" /></div>
              <CardTitle>{t.hospitalMenu.admin}</CardTitle>
            </CardHeader>
            <CardContent><CardDescription className="text-center">{t.hospitalMenu.adminDesc}</CardDescription></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
export default Hospitals;
