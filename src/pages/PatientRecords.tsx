import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import PatientLayout from '@/components/PatientLayout';
import { Upload, FileText, Download, Trash2, Share2, Eye, CloudUpload, FolderOpen } from 'lucide-react';

const RECORD_TYPES = ['Blood Test', 'X-Ray', 'MRI', 'CT Scan', 'Prescription', 'Discharge Summary', 'Vaccination', 'Other'];

const MOCK_RECORDS = [
  { id: '1', type: 'Blood Test', name: 'CBC Report', date: '2025-12-15', hospital: 'Apollo Mumbai', notes: 'Routine checkup' },
  { id: '2', type: 'Prescription', name: 'Dr. Patel Prescription', date: '2025-11-20', hospital: 'Fortis Delhi', notes: 'Diabetes medication' },
  { id: '3', type: 'X-Ray', name: 'Chest X-Ray', date: '2025-10-05', hospital: 'AIIMS Bangalore', notes: 'Annual screening' },
];

const PatientRecords = () => {
  const [records] = useState(MOCK_RECORDS);
  const [filterType, setFilterType] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  const filtered = filterType ? records.filter(r => r.type === filterType) : records;

  const typeIcons: Record<string, string> = {
    'Blood Test': '🩸', 'X-Ray': '📷', 'MRI': '🧲', 'CT Scan': '🔬',
    'Prescription': '💊', 'Discharge Summary': '📋', 'Vaccination': '💉', 'Other': '📁',
  };

  return (
    <PatientLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-[1000px] space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold">Medical Records</h1>
          <Button className="rounded-full gap-2" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="h-4 w-4" />Upload Record
          </Button>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <Card className="border-dashed border-2 border-primary/30 bg-primary/[0.02]">
            <CardContent className="p-6">
              <div className="text-center py-6 cursor-pointer hover:bg-primary/[0.02] rounded-xl transition-colors">
                <CloudUpload className="h-12 w-12 text-primary/40 mx-auto mb-3" />
                <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — Max 10MB</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Record Type *</Label>
                  <Select><SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{RECORD_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input type="date" className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Input placeholder="Optional notes..." className="h-9 text-xs" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button size="sm" onClick={() => { toast({ title: 'Record uploaded!' }); setShowUpload(false); }}>Upload</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={!filterType ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterType('')}>All</Badge>
          {RECORD_TYPES.map(t => (
            <Badge key={t} variant={filterType === t ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterType(t)}>{t}</Badge>
          ))}
        </div>

        {/* Records List */}
        <div className="space-y-3">
          {filtered.map(rec => (
            <Card key={rec.id} className="border-0 card-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xl">
                  {typeIcons[rec.type] || '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{rec.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">{rec.type}</Badge>
                    <span className="text-xs text-muted-foreground">{rec.date}</span>
                    <span className="text-xs text-muted-foreground">· {rec.hospital}</span>
                  </div>
                  {rec.notes && <p className="text-xs text-muted-foreground mt-1">{rec.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Share2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PatientLayout>
  );
};

export default PatientRecords;
