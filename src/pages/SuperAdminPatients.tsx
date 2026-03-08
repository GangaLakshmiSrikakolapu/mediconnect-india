import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Search, Users, User } from 'lucide-react';
import { useState } from 'react';

const SuperAdminPatients = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: profiles } = useQuery({
    queryKey: ['sa-patients'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const filtered = (profiles || []).filter((p: any) =>
    !searchTerm || p.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-heading font-bold">Patients ({(profiles || []).length})</h1>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
        </div>
        {filtered.length === 0 ? (
          <Card className="border-0 card-shadow"><CardContent className="p-12 text-center text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-30" />No patients found.</CardContent></Card>
        ) : (
          <Card className="border-0 card-shadow">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {filtered.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{p.full_name || 'No Name'}</p>
                        <p className="text-xs text-muted-foreground">Joined {new Date(p.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminPatients;
