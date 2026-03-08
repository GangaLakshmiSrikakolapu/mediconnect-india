import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import PatientLayout from '@/components/PatientLayout';
import { indianStatesAndDistricts, healthProblems } from '@/data/indianLocations';
import {
  Search, Star, MapPin, Building2, Heart, LayoutGrid, List,
  Filter, X, SlidersHorizontal, CheckCircle, Clock
} from 'lucide-react';

const specialties = healthProblems;
const indianStates = Object.keys(indianStatesAndDistricts);

const PatientFindHospitals = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [feeRange, setFeeRange] = useState([0, 5000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(true);

  const districts = stateFilter ? indianStatesAndDistricts[stateFilter] || [] : [];

  const { data: hospitals, isLoading } = useQuery({
    queryKey: ['patient-hospitals', stateFilter, districtFilter, searchQuery],
    queryFn: async () => {
      let q = supabase.from('hospitals').select('*').eq('status', 'approved');
      if (stateFilter) q = q.eq('state', stateFilter);
      if (districtFilter) q = q.eq('district', districtFilter);
      if (searchQuery) q = q.ilike('name', `%${searchQuery}%`);
      const { data } = await q.order('name');
      return data || [];
    },
  });

  const { data: allReviews } = useQuery({
    queryKey: ['all-hospital-reviews'],
    queryFn: async () => {
      const { data } = await supabase.from('reviews').select('hospital_id, rating');
      return data || [];
    },
  });

  const getHospitalRating = (hId: string) => {
    const hRevs = (allReviews || []).filter((r: any) => r.hospital_id === hId);
    if (hRevs.length === 0) return { avg: 'New', count: 0 };
    const avg = (hRevs.reduce((s: number, r: any) => s + r.rating, 0) / hRevs.length).toFixed(1);
    return { avg, count: hRevs.length };
  };

  const filtered = (hospitals || []).filter((h: any) => {
    if (selectedSpecs.length > 0) {
      const specs = h.specializations || [];
      if (!selectedSpecs.some(s => specs.includes(s))) return false;
    }
    return true;
  });

  return (
    <PatientLayout>
      <div className="flex h-full">
        {/* Filters Panel */}
        {showFilters && (
          <aside className="w-[280px] border-r border-border bg-card p-4 overflow-y-auto shrink-0 hidden lg:block">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-sm flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />Filters
              </h3>
              <button onClick={() => { setStateFilter(''); setDistrictFilter(''); setSelectedSpecs([]); setFeeRange([0, 5000]); }}
                className="text-xs text-primary hover:underline">Reset</button>
            </div>

            <div className="space-y-5">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Hospital name..." className="pl-8 h-9 text-xs" />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">State</Label>
                <Select value={stateFilter} onValueChange={v => { setStateFilter(v); setDistrictFilter(''); }}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All states" /></SelectTrigger>
                  <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {stateFilter && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium">City/District</Label>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All cities" /></SelectTrigger>
                    <SelectContent>{districts.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {/* Specialty */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Specialty</Label>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {specialties.map(s => (
                    <label key={s} className="flex items-center gap-2 text-xs cursor-pointer hover:text-foreground text-muted-foreground">
                      <Checkbox
                        checked={selectedSpecs.includes(s)}
                        onCheckedChange={checked => setSelectedSpecs(checked ? [...selectedSpecs, s] : selectedSpecs.filter(x => x !== s))}
                        className="h-3.5 w-3.5"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              {/* Fee Range */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Consultation Fee</Label>
                <Slider value={feeRange} onValueChange={setFeeRange} min={0} max={5000} step={100} className="mt-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>₹{feeRange[0]}</span><span>₹{feeRange[1]}</span>
                </div>
              </div>

              {/* Facilities */}
              <div className="space-y-2">
                <Label className="text-xs font-medium">Facilities</Label>
                <div className="flex flex-wrap gap-1.5">
                  {['ICU', 'Emergency', 'Pharmacy', 'Parking', 'Blood Bank', 'Ambulance'].map(f => (
                    <Badge key={f} variant="outline" className="text-[10px] cursor-pointer hover:bg-primary/5">{f}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Sort Bar */}
          <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-1" />Filters
              </Button>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filtered.length}</span> hospitals found
                {stateFilter && <> in <span className="font-medium text-foreground">{districtFilter || stateFilter}</span></>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue="relevance">
                <SelectTrigger className="h-8 text-xs w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance" className="text-xs">Relevance</SelectItem>
                  <SelectItem value="rating" className="text-xs">Rating</SelectItem>
                  <SelectItem value="fee" className="text-xs">Fee: Low-High</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Hospital Cards */}
          <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}`}>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-0 card-shadow animate-pulse"><CardContent className="p-4"><div className="h-36 bg-muted rounded-xl mb-3" /><div className="h-4 bg-muted rounded w-3/4 mb-2" /><div className="h-3 bg-muted rounded w-1/2" /></CardContent></Card>
              ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-5xl mb-4 opacity-30">🏥</div>
                <p className="text-muted-foreground font-medium">No hospitals match your filters</p>
                <Button variant="outline" className="mt-4 rounded-full" onClick={() => { setStateFilter(''); setDistrictFilter(''); setSelectedSpecs([]); }}>Clear Filters</Button>
              </div>
            ) : (
              filtered.map((h: any) => (
                <Card key={h.id} className="border-0 card-shadow hover:-translate-y-1 hover:shadow-md transition-all group relative">
                  <button className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm">
                    <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                  <CardContent className="p-4">
                    <div className="w-full h-36 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center mb-3 relative overflow-hidden">
                      <Building2 className="h-12 w-12 text-primary/20" />
                      {h.status === 'approved' && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] gap-1">
                          <CheckCircle className="h-3 w-3" />Verified
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm truncate">{h.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-warning fill-warning" />
                        <span className="text-xs font-medium">4.5</span>
                      </div>
                      <span className="text-xs text-muted-foreground">· 128 reviews</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(h.specializations || []).slice(0, 3).map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px] px-1.5 py-0">{s}</Badge>
                      ))}
                      {(h.specializations || []).length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{h.specializations.length - 3}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />{h.district}, {h.state}
                    </div>
                    <p className="text-xs text-success font-medium mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />Slots available today
                    </p>
                    <Link to={`/patient/hospital/${h.id}`}>
                      <Button className="w-full mt-3 rounded-xl h-9 text-xs">Book Appointment</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientFindHospitals;
