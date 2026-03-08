import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, TrendingUp, Building2, Calendar } from 'lucide-react';

const COLORS = ['hsl(214, 67%, 37%)', 'hsl(174, 62%, 29%)', 'hsl(38, 92%, 50%)', 'hsl(142, 71%, 33%)', 'hsl(0, 72%, 51%)'];

const SuperAdminRevenue = () => {
  const { data: appointments } = useQuery({
    queryKey: ['sa-revenue-appts'],
    queryFn: async () => {
      const { data } = await supabase.from('appointments').select('*, hospitals(name)').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const allAppts = appointments || [];
  const totalRevenue = allAppts.length * 500;
  const thisMonth = allAppts.filter((a: any) => a.created_at?.startsWith(new Date().toISOString().slice(0, 7))).length * 500;

  // Revenue by hospital
  const hospMap: Record<string, number> = {};
  allAppts.forEach((a: any) => { const n = (a as any).hospitals?.name || 'Unknown'; hospMap[n] = (hospMap[n] || 0) + 500; });
  const hospData = Object.entries(hospMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Monthly trend
  const monthMap: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); monthMap[d.toISOString().slice(0, 7)] = 0; }
  allAppts.forEach((a: any) => { const m = a.created_at?.slice(0, 7); if (m && m in monthMap) monthMap[m] += 500; });
  const monthData = Object.entries(monthMap).map(([m, v]) => ({ month: new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), revenue: v }));

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Revenue</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: IndianRupee, label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'text-primary bg-primary/10' },
            { icon: TrendingUp, label: 'This Month', value: `₹${thisMonth.toLocaleString()}`, color: 'text-success bg-success/10' },
            { icon: Calendar, label: 'Total Bookings', value: allAppts.length, color: 'text-accent bg-accent/10' },
          ].map(k => (
            <Card key={k.label} className="border-0 card-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${k.color}`}><k.icon className="h-6 w-6" /></div>
                <div><p className="text-2xl font-heading font-bold">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Monthly Revenue Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="hsl(214, 67%, 37%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-0 card-shadow">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue by Hospital</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hospData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 91%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                  <Bar dataKey="value" fill="hsl(174, 62%, 29%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminRevenue;
