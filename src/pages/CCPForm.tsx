import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ScanLine } from 'lucide-react';

const machines = [
  { id: 'M-01', name: 'Cooker Line A', ccpType: 'Cooking Temperature', unit: '°C', lower: 72, upper: 85 },
  { id: 'M-02', name: 'Metal Detector', ccpType: 'Metal Detection', unit: 'mm', lower: 0, upper: 2.0 },
  { id: 'M-03', name: 'Blast Freezer', ccpType: 'Freezer Temperature', unit: '°C', lower: -25, upper: -18 },
];

export default function CCPForm() {
  const navigate = useNavigate();
  const [machineId, setMachineId] = useState('');
  const [value, setValue] = useState('');

  const machine = machines.find(m => m.id === machineId);
  const numVal = parseFloat(value);
  const exceeded = machine && !isNaN(numVal) && (numVal < machine.lower || numVal > machine.upper);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exceeded) {
      toast.error('CCP LIMIT EXCEEDED! Batch held. Alert sent to QA Supervisor.', { duration: 6000 });
    } else {
      toast.success('CCP value logged successfully.');
    }
    navigate('/ccp');
  };

  return (
    <AppLayout title="Log CCP Value" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-primary" />
              Machine / CCP Point
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Machine (or scan QR)</Label>
              <Select value={machineId} onValueChange={setMachineId} required>
                <SelectTrigger><SelectValue placeholder="Select machine" /></SelectTrigger>
                <SelectContent>
                  {machines.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name} ({m.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {machine && (
              <>
                <div className="bg-muted p-3 rounded-lg text-xs space-y-1">
                  <p><span className="text-muted-foreground">CCP Type:</span> {machine.ccpType}</p>
                  <p><span className="text-muted-foreground">Acceptable Range:</span>{' '}
                    <span className="font-mono font-semibold">{machine.lower} – {machine.upper} {machine.unit}</span>
                  </p>
                </div>

                <div>
                  <Label htmlFor="value">Measured Value ({machine.unit})</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`font-mono text-lg ${exceeded ? 'border-destructive text-destructive' : ''}`}
                    required
                  />
                  {exceeded && (
                    <p className="text-xs text-destructive mt-1 animate-pulse-alert font-semibold">
                      🚨 VALUE OUTSIDE CCP LIMITS — Batch will be held!
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="batch">Batch ID</Label>
                  <Input id="batch" placeholder="B-XXXX-XXXX-XX" required className="font-mono" />
                </div>

                {exceeded && (
                  <div>
                    <Label htmlFor="correction">Corrective Action Taken</Label>
                    <Textarea id="correction" placeholder="Describe immediate correction..." rows={3} required />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1" variant={exceeded ? 'destructive' : 'default'}>
            {exceeded ? 'Log & Hold Batch' : 'Log Value'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
