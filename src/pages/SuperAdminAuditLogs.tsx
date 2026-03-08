import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Search, ScrollText } from 'lucide-react';
import { useState } from 'react';

const actionColors: Record<string, string> = {
  create: 'bg-success/10 text-success',
  update: 'bg-primary/10 text-primary',
  delete: 'bg-destructive/10 text-destructive',
  approve: 'bg-success/10 text-success',
  reject: 'bg-destructive/10 text-destructive',
};

const SuperAdminAuditLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs } = useQuery({
    queryKey: ['sa-audit-logs'],
    queryFn: async () => {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
      return data || [];
    },
  });

  const filtered = (logs || []).filter((l: any) =>
    !searchTerm || l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || l.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SuperAdminLayout>
      <div className="p-6 space-y-6">
        <h1 className="text-xl font-heading font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Immutable record of all admin actions. Cannot be deleted.</p>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-9 rounded-xl" />
        </div>
        <Card className="border-0 card-shadow">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No audit logs recorded yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30">
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm"><span className="font-medium">{log.user_email || 'System'}</span> — {log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.entity_type} {log.entity_id ? `#${log.entity_id.slice(0, 8)}` : ''}</p>
                    </div>
                    <Badge className={`${actionColors[log.action?.split('_')[0]] || 'bg-muted text-muted-foreground'} border-0 text-[10px]`}>
                      {log.action}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden md:block">{new Date(log.created_at).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAuditLogs;
