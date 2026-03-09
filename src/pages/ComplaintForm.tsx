import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { mockProducts } from '@/lib/mock-data';

export default function ComplaintForm() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('บันทึกเรื่องร้องเรียนเรียบร้อย จะดำเนินการสอบสวนต่อไป');
    navigate('/complaints');
  };

  return (
    <AppLayout title="New Complaint" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer & Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="date">Complaint Date</Label>
              <Input id="date" type="date" required />
            </div>
            <div>
              <Label>Product</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {mockProducts.map(p => (
                    <SelectItem key={p.productId} value={p.productId}>{p.productName} ({p.productId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lot">Lot Number</Label>
              <Input id="lot" placeholder="LOT-XXXX" className="font-mono" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="issue">Issue Description</Label>
              <Textarea id="issue" placeholder="Describe the complaint..." rows={4} required />
            </div>
            <div>
              <Label htmlFor="action">Action Taken (if any)</Label>
              <Textarea id="action" placeholder="Immediate action..." rows={2} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1">Submit Complaint</Button>
        </div>
      </form>
    </AppLayout>
  );
}
