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

export default function EnvironmentForm() {
  const navigate = useNavigate();
  const [type, setType] = useState('');

  const showValueField = type === 'temperature' || type === 'humidity';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Environmental check recorded.');
    navigate('/environment');
  };

  return (
    <AppLayout title="New Environmental Check" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Check Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Check Type</Label>
              <Select required onValueChange={setType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="humidity">Humidity</SelectItem>
                  <SelectItem value="sanitation">Sanitation (ATP Swab)</SelectItem>
                  <SelectItem value="pest_control">Pest Control</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zone">Zone / Area</Label>
              <Input id="zone" placeholder="e.g., Production Zone A" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" required />
              </div>
            </div>
            {showValueField && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="value">Value</Label>
                  <Input id="value" type="number" step="0.1" placeholder="0.0" className="font-mono" required />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" value={type === 'temperature' ? '°C' : '%RH'} readOnly className="font-mono bg-muted" />
                </div>
              </div>
            )}
            <div>
              <Label>Result</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Pass / Fail" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">✅ Pass</SelectItem>
                  <SelectItem value="fail">❌ Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="inspector">Inspector</Label>
              <Input id="inspector" placeholder="Name or ID" required />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Observations..." rows={3} />
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
