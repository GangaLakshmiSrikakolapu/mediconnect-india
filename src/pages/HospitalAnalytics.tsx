import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import HospitalAdminLayout from '@/components/HospitalAdminLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Users, TrendingUp, IndianRupee, Star, XCircle } from 'lucide-react';

const COLORS = ['hsl(174, 62%, 29%)', 'hsl(214, 67%, 37%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 33%)', 'hsl(0, 72%, 51%)', '#8b5cf6'];

const HospitalAnalytics = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('mediconnect_hospital_admin');
    if (!stored) { navigate('/auth'); return; }
    setHospital(JSON.parse(stored));
  }, [navigate]);

  const { data: appointments } = useQuery({
    queryKey: ['hosp-analytics-appts', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, doctors(name, specialization)').eq('hospital_id', hospital!.id);
      return data || [];
    },
  });

  const { data: doctors } = useQuery({
    queryKey: ['hosp-analytics-docs', hospital?.id],
    enabled: !!hospital?.id,
    queryFn: async () => {
      const { data } = await supabase.from('doctors').select('*').eq('hospital_id', hospital!.id).eq('status', 'active');
      return data || [];
    },
  });

  if (!hospital) return null;

  const allAppts = appointments || [];
  const totalRevenue = allAppts.length * 500;
  const completedCount = allAppts.filter(a => a.status === 'completed').length;
  const cancelledCount = allAppts.filter(a => a.status === 'cancelled').length;
  const cancelRate = allAppts.length > 0 ? Math.round((cancelledCount / allAppts.length) * 100) : 0;

  // Specialty distribution
  const specMap: Record<string, number> = {};
  allAppts.forEach((a: any) => {
    const spec = a.doctors?.specialization || 'Other';
    specMap[spec] = (specMap[spec] || 0) + 1;
  });
  const specData = Object.entries(specMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Doctor-wise
  const docMap: Record<string, number> = {};
  allAppts.forEach((a: any) => {
    const name = a.doctors?.name || 'Unknown';
    docMap[name] = (docMap[name] || 0) + 1;
  });
  const docData = Object.entries(docMap).map(([name, count]) => ({ name: `Dr. ${name}`, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Daily trend (last 7 days)
  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyMap[key] = 0;
  }
  allAppts.forEach((a: any) => {
    const day = a.created_at?.split('T')[0];
    if (day && day in dailyMap) dailyMap[day]++;
  });
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    count,
  }));

  // Age groups
  const ageGroups = { '0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0 };
  allAppts.forEach((a: any) => {
    const age = a.patient_age;
    if (age <= 18) ageGroups['0-18']++;
    else if (age <= 35) ageGroups['19-35']++;
    else if (age <= 50) ageGroups['36-50']++;
    else if (age <= 65) ageGroups['51-65']++;
    else ageGroups['65+']++;
  });
  const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));

  const kpis = [
    { icon: Calendar, label: 'Total Appointments', value: allAppts.length, color: 'text-accent bg-accent/10' },
    { icon: IndianRupee, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-success bg-success/10' },
    { icon: Users, label: 'Unique Patients', value: new Set(allAppts.map((a: any) => a.patient_name)).size, color: 'text-primary bg-primary/10' },
    { icon: TrendingUp, label: 'Completed', value: completedCount, color: 'text-accent bg-accent/10' },
    { icon: Star, label: 'Avg Rating', value: '4.5', color: 'text-warning bg-warning/10' },
    { icon: XCircle, label: 'Cancel Rate', value: `${cancelRate}%`, color: 'text-destructive bg-destructive/10' },
  ];

  return (
    <HospitalAdminLayout hospital={hospital} pendingCount={0}>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Reports & Analytics</h1>

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

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Appointments (Last 7 Days)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(174, 62%, 29%)" strokeWidth={2} dot={{ r: 4, fill: 'hsl(174, 62%, 29%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Doctor-wise Appointments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={docData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 91%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(214, 67%, 37%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Specialty Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={specData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                    {specData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Patient Age Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 91%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(174, 62%, 29%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </HospitalAdminLayout>
  );
};

export default HospitalAnalytics;
