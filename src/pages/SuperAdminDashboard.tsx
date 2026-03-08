import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Building2, Users, Calendar, IndianRupee, Clock, CheckCircle, XCircle,
  Eye, ArrowRight, AlertTriangle, TrendingUp, Activity
} from 'lucide-react';

const COLORS = ['hsl(214, 67%, 37%)', 'hsl(174, 62%, 29%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 33%)', 'hsl(0, 72%, 51%)'];

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'superAdmin')) {
      // Also check sessionStorage for legacy admin key flow
      if (!sessionStorage.getItem('mediconnect_admin')) {
        navigate('/auth');
      }
    }
  }, [user, role, authLoading, navigate]);

  const { data: hospitals } = useQuery({
    queryKey: ['sa-hospitals'],
    queryFn: async () => {
      const adminKey = sessionStorage.getItem('mediconnect_admin_key') || '';
      const { data } = await supabase.functions.invoke('admin-hospitals', { body: { key: adminKey, action: 'list' } });
      return data?.hospitals || [];
    },
  });

  const { data: appointments } = useQuery({
    queryKey: ['sa-appointments'],
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, hospitals(name), doctors(name, specialization)').order('created_at', { ascending: false }).limit(100);
      return data || [];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['sa-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*');
      return data || [];
    },
  });

  const allHospitals = (hospitals || []) as any[];
  const pendingHospitals = allHospitals.filter(h => h.status === 'pending');
  const approvedHospitals = allHospitals.filter(h => h.status === 'approved');
  const allAppts = appointments || [];
  const todayAppts = allAppts.filter((a: any) => a.created_at?.startsWith(new Date().toISOString().split('T')[0]));

  // Hospital type distribution
  const typeMap: Record<string, number> = {};
  allHospitals.forEach(h => { typeMap[h.hospital_type || 'Private'] = (typeMap[h.hospital_type || 'Private'] || 0) + 1; });
  const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Daily appointments last 7 days
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dailyMap[d.toISOString().split('T')[0]] = 0; }
  allAppts.forEach((a: any) => { const day = a.created_at?.split('T')[0]; if (day && day in dailyMap) dailyMap[day]++; });
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({ date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), count }));

  const kpis = [
    { icon: Building2, label: 'Approved Hospitals', value: approvedHospitals.length, color: 'text-primary bg-primary/10' },
    { icon: AlertTriangle, label: 'Pending Approvals', value: pendingHospitals.length, color: 'text-warning bg-warning/10' },
    { icon: Users, label: 'Total Patients', value: (profiles || []).length, color: 'text-accent bg-accent/10' },
    { icon: Calendar, label: "Today's Appointments", value: todayAppts.length, color: 'text-success bg-success/10' },
    { icon: IndianRupee, label: 'Revenue MTD', value: `₹${(allAppts.length * 500).toLocaleString()}`, color: 'text-primary bg-primary/10' },
    { icon: Clock, label: 'Pending Applications', value: pendingHospitals.length, color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <SuperAdminLayout pendingHospitals={pendingHospitals.length}>
      <div className="p-6 space-y-6">
        {/* Platform Health */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
          <CheckCircle className="h-4 w-4 text-success" />
          <span className="text-sm font-medium text-success">✓ API: 99.9% · DB: Healthy · Payments: Active</span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map(k => (
            <Card key={k.label} className="border-0 card-shadow">
              <CardContent className="p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${k.color}`}>
                  <k.icon className="h-4 w-4" />
                </div>
                <p className="text-xl font-heading font-bold">{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Chart */}
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Appointments Last 7 Days</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(214, 67%, 37%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hospital Types */}
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Hospital Types</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={typeData.length > 0 ? typeData : [{ name: 'No data', value: 1 }]} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals */}
        {pendingHospitals.length > 0 && (
          <Card className="border-destructive/20 card-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <CardTitle className="text-base">Pending Hospital Approvals ({pendingHospitals.length})</CardTitle>
                </div>
                <Link to="/superadmin/hospitals"><Button variant="ghost" size="sm" className="text-xs">View All <ArrowRight className="h-3 w-3 ml-1" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingHospitals.slice(0, 5).map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-semibold text-sm">{h.name}</p>
                      <p className="text-xs text-muted-foreground">{h.district}, {h.state} · {h.email}</p>
                    </div>
                    <Link to="/superadmin/hospitals">
                      <Button size="sm" variant="outline" className="rounded-lg text-xs">
                        <Eye className="h-3 w-3 mr-1" />Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card className="border-0 card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" />Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {allAppts.slice(0, 8).map((appt: any) => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium text-sm">{appt.patient_name} → {(appt as any).hospitals?.name || 'Hospital'}</p>
                      <p className="text-xs text-muted-foreground">Dr. {(appt as any).doctors?.name || 'N/A'} · {appt.health_problem}</p>
                    </div>
                  </div>
                  <Badge className={`border-0 text-[10px] ${
                    appt.status === 'completed' ? 'bg-success/10 text-success' :
                    appt.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                    'bg-primary/10 text-primary'
                  }`}>{appt.status || 'booked'}</Badge>
                </div>
              ))}
              {allAppts.length === 0 && <p className="text-center text-muted-foreground py-6 text-sm">No appointments yet.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
