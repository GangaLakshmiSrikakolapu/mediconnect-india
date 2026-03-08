import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PatientLayout from '@/components/PatientLayout';
import {
  Star, MapPin, Phone, Clock, Heart, Share2, Navigation,
  Building2, CheckCircle, Stethoscope, Calendar, ArrowLeft,
  Bed, Award, Activity, Users
} from 'lucide-react';

const HospitalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: hospital, isLoading } = useQuery({
    queryKey: ['hospital-detail', id],
    queryFn: async () => {
      const { data } = await supabase.from('hospitals').select('*').eq('id', id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: doctors } = useQuery({
    queryKey: ['hospital-doctors', id],
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('hospital_id', id!).eq('status', 'active');
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading || !hospital) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="overflow-y-auto">
        {/* Cover */}
        <div className="relative h-56 md:h-72" style={{ background: 'linear-gradient(135deg, hsl(214, 67%, 37%) 0%, hsl(174, 62%, 29%) 100%)' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-4 flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div className="text-white mb-1">
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold">{hospital.name}</h1>
                <Badge className="bg-white/20 text-white border-0 gap-1"><CheckCircle className="h-3 w-3" />Verified</Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning fill-warning" />4.5 (128)</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{hospital.district}, {hospital.state}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 md:px-6 py-4 flex flex-wrap gap-2 border-b border-border bg-card">
          <Link to={`/find-hospital`}>
            <Button className="rounded-full gap-2"><Calendar className="h-4 w-4" />Book Appointment</Button>
          </Link>
          <Button variant="outline" className="rounded-full gap-2"><Heart className="h-4 w-4" />Save</Button>
          <Button variant="outline" className="rounded-full gap-2"><Share2 className="h-4 w-4" />Share</Button>
          <Button variant="outline" className="rounded-full gap-2 text-accent border-accent/30 hover:bg-accent/5">
            <Navigation className="h-4 w-4" />Directions
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 md:px-6 py-4">
          <TabsList className="bg-muted/50 h-10 w-full justify-start gap-0 overflow-x-auto">
            {['Overview', 'Doctors', 'Reviews', 'Gallery', 'Insurance', 'Location'].map(t => (
              <TabsTrigger key={t} value={t.toLowerCase()} className="text-xs data-[state=active]:bg-card rounded-lg">{t}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-6">
            <Card className="border-0 card-shadow">
              <CardContent className="p-5">
                <h3 className="font-heading font-bold mb-2">About</h3>
                <p className="text-sm text-muted-foreground">{hospital.name} is a premier healthcare facility located in {hospital.district}, {hospital.state}. Offering comprehensive medical services with state-of-the-art infrastructure.</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Bed, label: 'Beds', value: '250+' },
                { icon: Award, label: 'Accreditation', value: 'NABH' },
                { icon: Users, label: 'Doctors', value: doctors?.length || 0 },
                { icon: Activity, label: 'Specialties', value: (hospital.specializations || []).length },
              ].map(s => (
                <Card key={s.label} className="border-0 bg-muted/30">
                  <CardContent className="p-4 text-center">
                    <s.icon className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-heading font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <h3 className="font-heading font-bold mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {(hospital.specializations || []).map((s: string) => (
                  <Badge key={s} variant="secondary" className="px-3 py-1.5 text-xs">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold mb-3">Facilities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['ICU', 'Emergency 24/7', 'Blood Bank', 'Pharmacy', 'Ambulance', 'Parking', 'WiFi', 'Canteen'].map(f => (
                  <div key={f} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 text-xs">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />{f}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />{hospital.phone}</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{hospital.address}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="doctors" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(doctors || []).map((doc: any) => (
                <Card key={doc.id} className="border-0 card-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">Dr. {doc.name}</p>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">{doc.specialization}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{doc.experience} yrs experience</p>
                      <p className="text-xs text-success mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />Available today
                      </p>
                    </div>
                    <Link to="/find-hospital">
                      <Button size="sm" className="rounded-full text-xs shrink-0">Book</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {(!doctors || doctors.length === 0) && (
                <p className="text-muted-foreground text-sm col-span-full text-center py-8">No doctors listed yet.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            <Card className="border-0 card-shadow">
              <CardContent className="p-5 flex items-center gap-6">
                <div className="text-center">
                  <p className="text-4xl font-heading font-bold">4.5</p>
                  <div className="flex gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">128 reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(n => (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{n}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{ width: `${n === 5 ? 60 : n === 4 ? 25 : n === 3 ? 10 : 3}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-0 card-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">P</div>
                    <div>
                      <p className="text-sm font-medium">Patient {i}</p>
                      <p className="text-[10px] text-muted-foreground">2 weeks ago</p>
                    </div>
                    <div className="flex gap-0.5 ml-auto">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3 w-3 ${s <= 4 ? 'text-warning fill-warning' : 'text-muted'}`} />)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Excellent care and professional staff. The facilities are top-notch and the doctors are very attentive.</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="gallery" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                  <Building2 className="h-10 w-10 text-primary/20" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insurance" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Star Health', 'HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'Max Bupa', 'Niva Bupa', 'Care Health', 'Aditya Birla'].map(ins => (
                <Card key={ins} className="border-0 bg-muted/30">
                  <CardContent className="p-4 text-center">
                    <p className="text-sm font-medium">{ins}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Cashless available</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="location" className="mt-4">
            <Card className="border-0 card-shadow">
              <CardContent className="p-5">
                <div className="w-full h-64 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <MapPin className="h-10 w-10 text-muted-foreground/30" />
                  <span className="text-muted-foreground ml-2">Map view</span>
                </div>
                <p className="text-sm"><strong>Address:</strong> {hospital.address}</p>
                <p className="text-sm mt-1"><strong>District:</strong> {hospital.district}, {hospital.state}</p>
                <Button variant="outline" className="mt-3 rounded-full gap-2">
                  <Navigation className="h-4 w-4" />Get Directions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayout>
  );
};

export default HospitalDetail;
