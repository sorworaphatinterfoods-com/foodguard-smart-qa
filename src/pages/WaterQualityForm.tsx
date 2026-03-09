import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mockWaterParams } from '@/lib/mock-data';

export default function WaterQualityForm() {
  const navigate = useNavigate();
  const [param, setParam] = useState('');
  const [value, setValue] = useState('');

  const selectedParam = mockWaterParams.find(p => p.parameter === param);
  const numVal = parseFloat(value);
  const outOfSpec = selectedParam && !isNaN(numVal) && (numVal < selectedParam.specMin || numVal > selectedParam.specMax);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (outOfSpec) {
      toast.error('⚠ Water quality FAIL! Deviation recorded.');
    } else {
      toast.success('Water test recorded — PASS');
    }
    navigate('/water');
  };

  return (
    <AppLayout title="New Water Test" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">💧 Water Quality Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Parameter</Label>
              <Select required onValueChange={setParam}>
                <SelectTrigger><SelectValue placeholder="Select parameter" /></SelectTrigger>
                <SelectContent>
                  {mockWaterParams.map(p => (
                    <SelectItem key={p.parameter} value={p.parameter}>{p.parameter} ({p.method})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Tap A, Tank B" required />
            </div>
            {selectedParam && (
              <>
                <div className="bg-muted p-3 rounded-lg text-xs">
                  <p><span className="text-muted-foreground">Spec:</span> <span className="font-mono font-semibold">{selectedParam.specMin}–{selectedParam.specMax} {selectedParam.unit}</span></p>
                  <p><span className="text-muted-foreground">Method:</span> {selectedParam.method} · {selectedParam.frequency}</p>
                </div>
                <div>
                  <Label htmlFor="value">Measured Value</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className={`font-mono ${outOfSpec ? 'border-destructive text-destructive' : ''}`}
                    required
                  />
                  {outOfSpec && (
                    <p className="text-xs text-destructive mt-1 animate-pulse font-semibold">
                      ⚠ Value out of specification!
                    </p>
                  )}
                </div>
              </>
            )}
            <div>
              <Label htmlFor="inspector">Inspector</Label>
              <Input id="inspector" placeholder="Employee ID" required />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1" variant={outOfSpec ? 'destructive' : 'default'}>
            {outOfSpec ? 'Log FAIL' : 'Log PASS'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
