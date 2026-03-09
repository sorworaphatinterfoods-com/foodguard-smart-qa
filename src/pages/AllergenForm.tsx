import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mockAllergens } from '@/lib/mock-data';

export default function AllergenForm() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('บันทึกการควบคุมสารก่อภูมิแพ้เรียบร้อย');
    navigate('/allergen');
  };

  return (
    <AppLayout title="New Allergen Log" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🥜 Allergen Control Check</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Allergen</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select allergen" /></SelectTrigger>
                <SelectContent>
                  {mockAllergens.map(a => (
                    <SelectItem key={a.allergen} value={a.allergen}>{a.allergen} ({a.control})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="area">Area</Label>
              <Input id="area" placeholder="e.g., Marination Line" required />
            </div>
            <div>
              <Label htmlFor="product">Product</Label>
              <Input id="product" placeholder="e.g., Marinated Chicken" required />
            </div>
            <div>
              <Label>Verification Method</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Label Check">Label Check</SelectItem>
                  <SelectItem value="Allergen Swab">Allergen Swab</SelectItem>
                  <SelectItem value="Visual Inspection">Visual Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Result</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="PASS / FAIL" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PASS">✅ PASS</SelectItem>
                  <SelectItem value="FAIL">❌ FAIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inspector">Inspector</Label>
              <Input id="inspector" placeholder="Employee ID" required />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1">Save Log</Button>
        </div>
      </form>
    </AppLayout>
  );
}
