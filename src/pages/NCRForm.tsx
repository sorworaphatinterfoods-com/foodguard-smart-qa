import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';

export default function NCRForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [whys, setWhys] = useState<string[]>(['', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);

  const setWhy = (index: number, value: string) =>
    setWhys((prev) => prev.map((w, i) => (i === index ? value : w)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const rootCause = whys
      .map((w, i) => (w.trim() ? `Why ${i + 1}: ${w.trim()}` : ''))
      .filter(Boolean)
      .join(' → ');

    try {
      const { id } = await apiPost<{ id: string }>('/api/ncrs', {
        title,
        category,
        severity,
        description,
        assignedTo,
        dueDate,
        rootCause,
      });
      await queryClient.invalidateQueries({ queryKey: ['ncrs'] });
      toast.success(`NCR ${id} created. Assigned for investigation.`);
      navigate('/ncr');
    } catch {
      // No backend (e.g. static mirror) — keep the demo flow usable.
      toast.warning('Saved in demo mode — connect Cloudflare/D1 to persist.');
      navigate('/ncr');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="New NCR" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Nonconformance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Brief description of nonconformance" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select required value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="foreign_body">Foreign Body</SelectItem>
                  <SelectItem value="labeling">Labeling</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="temperature">Temperature Deviation</SelectItem>
                  <SelectItem value="process">Process Deviation</SelectItem>
                  <SelectItem value="equipment">Equipment Failure</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select required value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue placeholder="Select severity" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="major">Major</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Detailed description of the nonconformance..." rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="assigned">Assigned To</Label>
                <Input id="assigned" placeholder="Name or role" required value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="due">Due Date</Label>
                <Input id="due" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Root Cause Analysis (5 Why)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {whys.map((why, idx) => (
              <div key={idx}>
                <Label htmlFor={`why${idx + 1}`}>Why {idx + 1}?</Label>
                <Input id={`why${idx + 1}`} placeholder={`Why ${idx + 1}...`} value={why} onChange={(e) => setWhy(idx, e.target.value)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? 'Saving…' : 'Create NCR'}</Button>
        </div>
      </form>
    </AppLayout>
  );
}
