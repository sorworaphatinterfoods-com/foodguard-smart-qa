import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const gmpChecklist = [
  'Personal hygiene compliance',
  'Handwashing facilities adequate',
  'Protective clothing worn correctly',
  'Floor & wall cleanliness',
  'Equipment sanitized before use',
  'Pest control devices in place',
  'Chemical storage properly labeled',
  'Temperature logs up to date',
  'Waste disposal procedures followed',
  'Cross-contamination controls in place',
];

export default function AuditForm() {
  const navigate = useNavigate();
  const [results, setResults] = useState<Record<number, string>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = gmpChecklist.length;
    const passed = Object.values(results).filter(r => r === 'conforming').length;
    const score = Math.round((passed / total) * 100);
    toast.success(`Audit completed. Score: ${score}% (${passed}/${total} items passed)`);
    navigate('/audit');
  };

  return (
    <AppLayout title="New Audit" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Audit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Audit Type</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GMP">GMP Audit</SelectItem>
                  <SelectItem value="HACCP">HACCP Audit</SelectItem>
                  <SelectItem value="Internal">Internal Audit</SelectItem>
                  <SelectItem value="Supplier">Supplier Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="area">Area / Department</Label>
                <Input id="area" placeholder="e.g., Production Line A" required />
              </div>
              <div>
                <Label htmlFor="auditor">Auditor</Label>
                <Input id="auditor" placeholder="Name" required />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">GMP Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {gmpChecklist.map((item, idx) => (
              <div key={idx} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium mb-2">{idx + 1}. {item}</p>
                <div className="flex gap-2 mb-2">
                  {(['conforming', 'minor_nc', 'major_nc', 'observation'] as const).map((val) => (
                    <Button
                      key={val}
                      type="button"
                      size="sm"
                      variant={results[idx] === val ? 'default' : 'outline'}
                      className={`text-xs flex-1 ${
                        results[idx] === val && val === 'conforming' ? 'bg-[hsl(var(--status-pass))] text-[hsl(var(--primary-foreground))]' :
                        results[idx] === val && val === 'major_nc' ? 'bg-[hsl(var(--status-fail))] text-[hsl(var(--destructive-foreground))]' :
                        results[idx] === val && val === 'minor_nc' ? 'bg-[hsl(var(--status-warning))] text-[hsl(var(--accent-foreground))]' :
                        ''
                      }`}
                      onClick={() => setResults(prev => ({ ...prev, [idx]: val }))}
                    >
                      {val === 'conforming' ? '✅ OK' : val === 'minor_nc' ? '⚠ Minor' : val === 'major_nc' ? '❌ Major' : '📝 Obs'}
                    </Button>
                  ))}
                </div>
                {results[idx] && results[idx] !== 'conforming' && (
                  <Input
                    placeholder="Finding notes..."
                    className="text-xs"
                    value={notes[idx] || ''}
                    onChange={(e) => setNotes(prev => ({ ...prev, [idx]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1">Complete Audit</Button>
        </div>
      </form>
    </AppLayout>
  );
}
