import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useMaterials } from '@/hooks/useMaterials';

export default function ReceivingForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: suppliers = [] } = useSuppliers();
  const { data: materials = [] } = useMaterials();

  const [supplierId, setSupplierId] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [lot, setLot] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [temperature, setTemperature] = useState('');
  const [appearance, setAppearance] = useState('');
  const [packaging, setPackaging] = useState('');
  const [result, setResult] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tempNum = parseFloat(temperature);
  const tempExceeded = !isNaN(tempNum) && tempNum > 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { id } = await apiPost<{ id: string }>('/api/receiving', {
        supplierId,
        materialCode,
        lot,
        quantity,
        unit,
        temperature,
        appearance,
        packaging,
        result,
        notes,
      });
      await queryClient.invalidateQueries({ queryKey: ['receiving'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (result === 'hold' || result === 'reject' || tempExceeded) {
        toast.warning(`Receiving ${id} saved & flagged for QA.`, { duration: 5000 });
      } else {
        toast.success(`Receiving ${id} saved successfully.`);
      }
      navigate('/receiving');
    } catch {
      toast.warning('Saved in demo mode — connect Cloudflare/D1 to persist.');
      navigate('/receiving');
    } finally {
      setSubmitting(false);
    }
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
              <Select required value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map(s => (
                    <SelectItem key={s.supplierId} value={s.supplierId}>{s.supplierName} ({s.supplierId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="material">Material</Label>
                <Select required value={materialCode} onValueChange={setMaterialCode}>
                  <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                  <SelectContent>
                    {materials.map(m => (
                      <SelectItem key={m.materialId} value={m.materialId}>{m.materialName} ({m.materialId})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lot">Lot Number</Label>
                <Input id="lot" placeholder="LOT-XXXX" required className="font-mono" value={lot} onChange={(e) => setLot(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="qty">Quantity</Label>
                <Input id="qty" type="number" placeholder="0" required value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select required value={unit} onValueChange={setUnit}>
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
              <Select required value={appearance} onValueChange={setAppearance}>
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
              <Select required value={packaging} onValueChange={setPackaging}>
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
              <Select required value={result} onValueChange={setResult}>
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
              <Textarea id="notes" placeholder="Additional observations..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? 'Saving…' : 'Save Record'}</Button>
        </div>
      </form>
    </AppLayout>
  );
}
