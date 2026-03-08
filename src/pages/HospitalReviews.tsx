import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { Star, MessageCircle } from 'lucide-react';

const HospitalReviews = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [hospital, setHospital] = useState<any>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/auth'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: reviews } = useQuery({
    queryKey: ['hosp-reviews', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, doctors(name)')
        .eq('hospital_id', hospital!.id)
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!hospital?.id) return;
    const channel = supabase
      .channel('reviews-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `hospital_id=eq.${hospital.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['hosp-reviews'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [hospital?.id, queryClient]);

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    const { error } = await supabase.from('reviews').update({
      reply_text: replyText,
      replied_at: new Date().toISOString(),
    }).eq('id', reviewId);
    if (error) { toast({ title: 'Failed to reply', variant: 'destructive' }); return; }
    queryClient.invalidateQueries({ queryKey: ['hosp-reviews'] });
    setReplyingTo(null);
    setReplyText('');
    toast({ title: 'Reply posted!' });
  };

  if (!hospital) return null;

  const allReviews = reviews || [];
  const avgRating = allReviews.length > 0
    ? (allReviews.reduce((s: number, r: any) => s + r.rating, 0) / allReviews.length).toFixed(1)
    : '0.0';
  const ratingDist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: allReviews.filter((r: any) => r.rating === star).length,
    pct: allReviews.length > 0 ? Math.round((allReviews.filter((r: any) => r.rating === star).length / allReviews.length) * 100) : 0,
  }));

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Reviews ({allReviews.length})</h1>

        {/* Rating Summary */}
        <Card className="border-0 card-shadow">
          <CardContent className="p-6">
            {allReviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No reviews yet. Reviews will appear here when patients rate their experience.</p>
            ) : (
              <div className="flex items-start gap-8">
                <div className="text-center">
                  <p className="text-5xl font-heading font-bold text-accent">{avgRating}</p>
                  <div className="flex items-center justify-center gap-0.5 my-2">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                  </div>
                  <p className="text-xs text-muted-foreground">{allReviews.length} reviews</p>
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
            )}
          </CardContent>
        </Card>

        {/* Reviews */}
        <div className="space-y-4">
          {allReviews.map((review: any) => (
            <Card key={review.id} className="border-0 card-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{review.patient_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('en-IN')}
                      {review.doctors?.name && ` · Dr. ${review.doctors.name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                  </div>
                </div>
                <p className="text-sm text-foreground mb-3">{review.review_text || 'No text review'}</p>

                {review.reply_text && (
                  <div className="bg-accent/5 border border-accent/10 rounded-xl p-3 mb-3">
                    <p className="text-xs font-medium text-accent mb-1">Hospital Response:</p>
                    <p className="text-xs text-muted-foreground">{review.reply_text}</p>
                  </div>
                )}

                {replyingTo === review.id ? (
                  <div className="space-y-2">
                    <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your response..." className="text-sm" rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-lg bg-accent hover:bg-accent/90" onClick={() => handleReply(review.id)}>Post Reply</Button>
                      <Button size="sm" variant="outline" className="rounded-lg" onClick={() => { setReplyingTo(null); setReplyText(''); }}>Cancel</Button>
                    </div>
                  </div>
                ) : !review.reply_text && (
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
