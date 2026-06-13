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
import { mockEquipment, mockEmployees } from '@/lib/mock-data';
import { useProcesses, useFinishedGoods, useParameters } from '@/hooks/useMasterData';

// Best-effort parse of a free-text spec limit ("0 - 4", "≥ 75", "≤ -18").
function parseSpec(spec: string): { min: number | null; max: number | null } {
  const s = (spec || '').replace(/[()]/g, ' ');
  const nums = (s.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  if (/≥|>=/.test(s)) return { min: nums[0] ?? null, max: null };
  if (/≤|<=/.test(s)) return { min: null, max: nums[0] ?? null };
  if (nums.length >= 2) return { min: Math.min(nums[0], nums[1]), max: Math.max(nums[0], nums[1]) };
  return { min: null, max: null };
}

export default function InspectionForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: processes = [] } = useProcesses();
  const { data: products = [] } = useFinishedGoods();
  const { data: parameters = [] } = useParameters();

  const [inspector, setInspector] = useState('');
  const [process, setProcess] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [productId, setProductId] = useState('');
  const [lot, setLot] = useState('');
  const [parameter, setParameter] = useState('');
  const [value, setValue] = useState('');
  const [action, setAction] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedParam = parameters.find(p => p.name === parameter);
  const { min, max } = selectedParam ? parseSpec(selectedParam.specLimit) : { min: null, max: null };

  const numVal = parseFloat(value);
  let isFail = false;
  if (selectedParam && !isNaN(numVal)) {
    if (min !== null && numVal < min) isFail = true;
    if (max !== null && numVal > max) isFail = true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const remarks = [remark, isFail && action ? `Action: ${action}` : '', isFail && rootCause ? `Root cause: ${rootCause}` : '']
      .filter(Boolean)
      .join(' | ');

    try {
      const { id } = await apiPost<{ id: string }>('/api/inspections', {
        inspector,
        process,
        equipmentId,
        productId,
        lot,
        parameter,
        spec: selectedParam?.specLimit ?? '',
        unit: selectedParam?.unit ?? '',
        value: isNaN(numVal) ? '' : numVal,
        result: isFail ? 'FAIL' : 'PASS',
        remark: remarks,
      });
      await queryClient.invalidateQueries({ queryKey: ['inspections'] });
      if (isFail) {
        toast.error(`❌ FAIL recorded (${id}) — deviation logged for QA review.`);
      } else {
        toast.success(`✅ Inspection PASS saved (${id}).`);
      }
      navigate('/inspection');
    } catch {
      toast.warning('Saved in demo mode — connect Cloudflare/D1 to persist.');
      navigate('/inspection');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="New Inspection" showBack>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📋 Inspection Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Inspector</Label>
              <Select required value={inspector} onValueChange={setInspector}>
                <SelectTrigger><SelectValue placeholder="Select inspector" /></SelectTrigger>
                <SelectContent>
                  {mockEmployees.filter(e => e.status === 'Active').map(e => (
                    <SelectItem key={e.employeeId} value={e.employeeName}>{e.employeeName} ({e.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Process</Label>
              <Select required value={process} onValueChange={(v) => { setProcess(v); setParameter(''); }}>
                <SelectTrigger><SelectValue placeholder="Select process" /></SelectTrigger>
                <SelectContent>
                  {processes.map(p => (
                    <SelectItem key={p.processId} value={p.processName}>{p.processName} ({p.processId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Equipment</Label>
              <Select required value={equipmentId} onValueChange={setEquipmentId}>
                <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                <SelectContent>
                  {mockEquipment.filter(e => e.status === 'Active').map(e => (
                    <SelectItem key={e.equipmentId} value={e.equipmentId}>{e.equipmentName} ({e.equipmentId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Product (FG)</Label>
              <Select required value={productId} onValueChange={setProductId}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.productId} value={p.productId}>{p.productName} ({p.productId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="lot">Lot Number</Label>
              <Input id="lot" placeholder="LOT-XXXX" className="font-mono" required value={lot} onChange={(e) => setLot(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {process && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🔬 Measurement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Parameter</Label>
                <Select required value={parameter} onValueChange={setParameter}>
                  <SelectTrigger><SelectValue placeholder="Select parameter" /></SelectTrigger>
                  <SelectContent>
                    {parameters.map(p => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}{p.category === 'Food Safety' ? ' ⚡' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedParam && (
                <>
                  <div className="bg-muted p-3 rounded-lg text-xs">
                    <p><span className="text-muted-foreground">Spec:</span>{' '}
                      <span className="font-mono font-semibold">{selectedParam.specLimit || '—'} {selectedParam.unit}</span>
                    </p>
                    {selectedParam.category && <p><span className="text-muted-foreground">Category:</span> {selectedParam.category}</p>}
                    {selectedParam.category === 'Food Safety' && <p className="text-[hsl(var(--status-warning))] font-semibold mt-1">⚡ Food Safety parameter</p>}
                  </div>
                  <div>
                    <Label htmlFor="value">Measured Value {selectedParam.unit ? `(${selectedParam.unit})` : ''}</Label>
                    <Input
                      id="value"
                      type="number"
                      step="0.1"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={`font-mono text-lg ${isFail ? 'border-destructive text-destructive' : ''}`}
                      required
                    />
                    {isFail && (
                      <p className="text-xs text-destructive mt-1 animate-pulse font-semibold">
                        🚨 VALUE OUT OF SPEC — Corrective Action required!
                      </p>
                    )}
                  </div>
                </>
              )}
              {isFail && (
                <>
                  <div>
                    <Label htmlFor="action">Corrective Action (required)</Label>
                    <Textarea id="action" placeholder="Describe immediate correction..." rows={2} required value={action} onChange={(e) => setAction(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="rootcause">Root Cause</Label>
                    <Input id="rootcause" placeholder="Why did this happen?" value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="remark">Remark</Label>
                <Textarea id="remark" placeholder="Additional notes..." rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)} disabled={submitting}>Cancel</Button>
          <Button type="submit" className="flex-1" variant={isFail ? 'destructive' : 'default'} disabled={submitting}>
            {submitting ? 'Saving…' : isFail ? 'Log FAIL & Alert' : 'Log PASS'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
