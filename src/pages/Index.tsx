import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Hospital, Heart } from 'lucide-react';

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-3xl mx-auto animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary/10 p-5">
            <Heart className="h-14 w-14 text-primary fill-primary/20" />
          </div>
        </div>
        <h1 className="font-heading text-5xl md:text-6xl font-extrabold text-primary tracking-tight mb-4">
          {t.home.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          {t.home.subtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
          <Link to="/insurance">
            <Card className="group cursor-pointer border-2 border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto rounded-full bg-accent/10 p-4 mb-2 group-hover:bg-accent/20 transition-colors">
                  <Shield className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-heading text-xl">{t.home.insurance}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{t.home.insuranceDesc}</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to="/find-hospital">
            <Card className="group cursor-pointer border-2 border-transparent hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto rounded-full bg-primary/10 p-4 mb-2 group-hover:bg-primary/20 transition-colors">
                  <Hospital className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-heading text-xl">{t.home.findHospital}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">{t.home.findHospitalDesc}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
