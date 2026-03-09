import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ComplaintForm() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Complaint recorded. Investigation will be initiated.');
    navigate('/complaints');
  };

  return (
    <AppLayout title="New Complaint" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="customer">Customer Name</Label>
              <Input id="customer" placeholder="Company or individual name" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="product">Product Name</Label>
                <Input id="product" placeholder="e.g., Frozen Chicken" required />
              </div>
              <div>
                <Label htmlFor="lot">Lot Number</Label>
                <Input id="lot" placeholder="LOT-XXXX" className="font-mono" required />
              </div>
            </div>
            <div>
              <Label htmlFor="date">Complaint Date</Label>
              <Input id="date" type="date" required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Category</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="foreign_body">Foreign Body</SelectItem>
                  <SelectItem value="quality">Quality Issue</SelectItem>
                  <SelectItem value="labeling">Labeling Error</SelectItem>
                  <SelectItem value="allergen">Allergen Issue</SelectItem>
                  <SelectItem value="packaging">Packaging Defect</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Severity</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="Detailed complaint description..." rows={4} required />
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
