import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function MetalDetectorForm() {
  const navigate = useNavigate();
  const [fe, setFe] = useState('');
  const [nonFe, setNonFe] = useState('');
  const [sus, setSus] = useState('');

  // Standard: Fe=2.0mm, NonFe=2.5mm, SUS=3.0mm
  const susVal = parseFloat(sus);
  const isFail = !isNaN(susVal) && susVal < 3.0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFail) {
      toast.error('🚨 Metal Detector FAIL! Batch rejected. Calibration required.');
    } else {
      toast.success('Metal detector test PASS.');
    }
    navigate('/metal-detector');
  };

  return (
    <AppLayout title="Metal Detector Test" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🔍 Test Piece Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Line</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select line" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Line1">Line 1</SelectItem>
                  <SelectItem value="Line2">Line 2</SelectItem>
                  <SelectItem value="Line3">Line 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted p-3 rounded-lg text-xs">
              <p className="font-medium mb-1">Standard Test Pieces:</p>
              <p>Fe: 2.0 mm · Non-Fe: 2.5 mm · SUS: 3.0 mm</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="fe">Fe (mm)</Label>
                <Input id="fe" type="number" step="0.1" value={fe} onChange={(e) => setFe(e.target.value)} className="font-mono" required />
              </div>
              <div>
                <Label htmlFor="nonfe">Non-Fe (mm)</Label>
                <Input id="nonfe" type="number" step="0.1" value={nonFe} onChange={(e) => setNonFe(e.target.value)} className="font-mono" required />
              </div>
              <div>
                <Label htmlFor="sus">SUS (mm)</Label>
                <Input id="sus" type="number" step="0.1" value={sus} onChange={(e) => setSus(e.target.value)}
                  className={`font-mono ${isFail ? 'border-destructive text-destructive' : ''}`} required />
              </div>
            </div>
            {isFail && (
              <p className="text-xs text-destructive animate-pulse font-semibold">
                ⚠ SUS test piece not detected at 3.0mm — FAIL! Calibration required.
              </p>
            )}
            <div>
              <Label htmlFor="inspector">Inspector</Label>
              <Input id="inspector" placeholder="Employee ID" required />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1" variant={isFail ? 'destructive' : 'default'}>
            {isFail ? 'Log FAIL' : 'Log PASS'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
