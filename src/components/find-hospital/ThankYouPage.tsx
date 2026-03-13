import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Heart, CheckCircle, Calendar, Clock, User, Building2, Hash } from 'lucide-react';
import { BookingConfirmation } from '@/pages/FindHospital';

const ThankYouPage = ({ confirmation }: { confirmation: BookingConfirmation | null }) => {
  const { t } = useLanguage();
  return (
    <div className="text-center py-8 animate-fade-in max-w-lg mx-auto">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
      <h2 className="font-heading text-3xl font-bold mb-3">{t.thankYou.title}</h2>
      <p className="text-muted-foreground mb-6">{t.thankYou.message}</p>

      {confirmation && (
        <Card className="mb-6 text-left">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Token Number</p>
                <p className="font-bold text-lg">{confirmation.tokenNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">Dr. {confirmation.doctorName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Hospital</p>
                <p className="font-medium">{confirmation.hospitalName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Appointment Time</p>
                <p className="font-medium">{confirmation.appointmentTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Booking Date</p>
                <p className="font-medium">{confirmation.bookingDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-muted/50 rounded-lg p-6 mb-6">
        <Heart className="h-8 w-8 text-primary fill-primary/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          Thank you for choosing MediConnect.<br />
          Your health matters to us.<br />
          Visit again and stay healthy.
        </p>
      </div>

      <p className="text-lg italic text-primary mb-6">{t.thankYou.quote}</p>
      <Link to="/"><Button>{t.thankYou.backHome}</Button></Link>
    </div>
  );
};
export default ThankYouPage;
