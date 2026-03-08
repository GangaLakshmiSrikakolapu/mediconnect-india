import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const ThankYouPage = () => {
  const { t } = useLanguage();
  return (
    <div className="text-center py-16 animate-fade-in">
      <Heart className="h-16 w-16 text-primary fill-primary/20 mx-auto mb-6" />
      <h2 className="font-heading text-3xl font-bold mb-3">{t.thankYou.title}</h2>
      <p className="text-muted-foreground mb-4">{t.thankYou.message}</p>
      <p className="text-lg italic text-primary mb-8">{t.thankYou.quote}</p>
      <Link to="/"><Button>{t.thankYou.backHome}</Button></Link>
    </div>
  );
};
export default ThankYouPage;
