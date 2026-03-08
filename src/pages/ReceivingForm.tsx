import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockSuppliers } from '@/lib/mock-data';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ReceivingForm() {
  const navigate = useNavigate();
  const [temperature, setTemperature] = useState('');
  const tempNum = parseFloat(temperature);
  const tempExceeded = !isNaN(tempNum) && tempNum > 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempExceeded) {
      toast.warning('Temperature exceeds 4°C! Record flagged and batch held.', { duration: 5000 });
    } else {
      toast.success('Receiving record saved successfully.');
    }
    navigate('/receiving');
  };

  return (
    <AppLayout title="New Receiving" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Material Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {mockSuppliers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="material">Material Name</Label>
                <Input id="material" placeholder="e.g., Chicken Breast" required />
              </div>
              <div>
                <Label htmlFor="lot">Lot Number</Label>
                <Input id="lot" placeholder="LOT-XXXX" required className="font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" placeholder="0" required />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="boxes">boxes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Inspection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="temp">Temperature (°C)</Label>
              <Input
                id="temp"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className={`font-mono ${tempExceeded ? 'border-destructive text-destructive' : ''}`}
                required
              />
              {tempExceeded && (
                <p className="text-xs text-destructive mt-1 animate-pulse-alert font-semibold">
                  ⚠ Temperature exceeds 4°C limit! Batch will be held.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="appearance">Appearance</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="packaging">Packaging Condition</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intact">Intact</SelectItem>
                  <SelectItem value="minor_damage">Minor Damage</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="result">Result</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Pass / Hold / Reject" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">✅ Pass</SelectItem>
                  <SelectItem value="hold">⚠️ Hold</SelectItem>
                  <SelectItem value="reject">❌ Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional observations..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1">Save Record</Button>
        </div>
      </form>
    </AppLayout>
  );
}
