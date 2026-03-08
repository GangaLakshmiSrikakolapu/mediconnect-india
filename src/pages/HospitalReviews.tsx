import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Star, MessageCircle, ThumbsUp } from 'lucide-react';

const MOCK_REVIEWS = [
  { id: '1', patient: 'R*** K***', rating: 5, text: 'Excellent service and very professional doctors. The staff was friendly and the hospital was clean.', date: '2025-06-08', doctor: 'Dr. Sharma', replied: false },
  { id: '2', patient: 'A*** S***', rating: 4, text: 'Good experience overall. Wait time was a bit long but the consultation was thorough.', date: '2025-06-07', doctor: 'Dr. Patel', replied: true, reply: 'Thank you for your feedback! We are working on reducing wait times.' },
  { id: '3', patient: 'M*** G***', rating: 3, text: 'Average experience. The billing process could be smoother.', date: '2025-06-06', doctor: 'Dr. Kumar', replied: false },
  { id: '4', patient: 'S*** P***', rating: 5, text: 'Best hospital in the area! Highly recommended for anyone.', date: '2025-06-05', doctor: 'Dr. Sharma', replied: false },
  { id: '5', patient: 'V*** R***', rating: 2, text: 'Long waiting time and the receptionist was not helpful.', date: '2025-06-04', doctor: 'Dr. Singh', replied: false },
];

const HospitalReviews = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/hospital-admin/login'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  if (!hospital) return null;

  const avgRating = (MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length).toFixed(1);
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: MOCK_REVIEWS.filter(r => r.rating === star).length,
    pct: Math.round((MOCK_REVIEWS.filter(r => r.rating === star).length / MOCK_REVIEWS.length) * 100),
  }));

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Reviews</h1>

        {/* Rating Summary */}
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-8">
              <div className="text-center">
                <p className="text-5xl font-heading font-bold text-accent">{avgRating}</p>
                <div className="flex items-center justify-center gap-0.5 my-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                </div>
                <p className="text-xs text-muted-foreground">{MOCK_REVIEWS.length} reviews</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratingDist.map(r => (
                  <div key={r.star} className="flex items-center gap-2">
                    <span className="text-xs w-4">{r.star}</span>
                    <Star className="h-3 w-3 text-warning fill-warning" />
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews */}
        <div className="space-y-4">
          {MOCK_REVIEWS.map(review => (
            <Card key={review.id} className="border-0 card-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.patient}</p>
                    <p className="text-xs text-muted-foreground">{review.date} · {review.doctor}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                  </div>
                </div>
                <p className="text-sm text-foreground mb-3">{review.text}</p>

                {review.replied && review.reply && (
                  <div className="bg-accent/5 border border-accent/10 rounded-xl p-3 mb-3">
                    <p className="text-xs font-medium text-accent mb-1">Hospital Response:</p>
                    <p className="text-xs text-muted-foreground">{review.reply}</p>
                  </div>
                )}

                {replyingTo === review.id ? (
                  <div className="space-y-2">
                    <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your response..." className="text-sm" rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-lg bg-accent hover:bg-accent/90" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Post Reply</Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</Button>
                    </div>
                  </div>
                ) : !review.replied && (
                  <Button size="sm" variant="ghost" className="text-accent text-xs" onClick={() => setReplyingTo(review.id)}>
                    <MessageCircle className="h-3 w-3 mr-1" />Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalReviews;
