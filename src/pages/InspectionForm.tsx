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
import { mockProcesses, mockEquipment, mockProducts, mockParameters, mockEmployees } from '@/lib/mock-data';

export default function InspectionForm() {
  const navigate = useNavigate();
  const [process, setProcess] = useState('');
  const [parameter, setParameter] = useState('');
  const [value, setValue] = useState('');

  const filteredParams = mockParameters.filter(p => p.process === process);
  const selectedParam = filteredParams.find(p => p.parameter === parameter);

  const numVal = parseFloat(value);
  let isFail = false;
  if (selectedParam && !isNaN(numVal)) {
    if (selectedParam.specMin !== null && numVal < selectedParam.specMin) isFail = true;
    if (selectedParam.specMax !== null && numVal > selectedParam.specMax) isFail = true;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFail) {
      toast.error('❌ FAIL — Deviation recorded & LINE alert sent to QA Supervisor.');
    } else {
      toast.success('✅ Inspection PASS — Record saved.');
    }
    navigate('/inspection');
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
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select inspector" /></SelectTrigger>
                <SelectContent>
                  {mockEmployees.filter(e => e.status === 'Active').map(e => (
                    <SelectItem key={e.employeeId} value={e.employeeId}>{e.employeeName} ({e.employeeId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Process</Label>
              <Select required onValueChange={(v) => { setProcess(v); setParameter(''); }}>
                <SelectTrigger><SelectValue placeholder="Select process" /></SelectTrigger>
                <SelectContent>
                  {mockProcesses.map(p => (
                    <SelectItem key={p.processId} value={p.processName}>{p.processName} ({p.type})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Equipment</Label>
              <Select required>
                <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                <SelectContent>
                  {mockEquipment.filter(e => e.status === 'Active').map(e => (
                    <SelectItem key={e.equipmentId} value={e.equipmentId}>{e.equipmentName} ({e.equipmentId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {process && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🔬 Measurement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Parameter</Label>
                <Select required onValueChange={setParameter}>
                  <SelectTrigger><SelectValue placeholder="Select parameter" /></SelectTrigger>
                  <SelectContent>
                    {filteredParams.map(p => (
                      <SelectItem key={p.parameter} value={p.parameter}>
                        {p.parameter} ({p.unit}) {p.isCCP ? '⚡ CCP' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedParam && (
                <>
                  <div className="bg-muted p-3 rounded-lg text-xs">
                    <p><span className="text-muted-foreground">Spec:</span>{' '}
                      <span className="font-mono font-semibold">
                        {selectedParam.specMin !== null ? selectedParam.specMin : '—'} – {selectedParam.specMax !== null ? selectedParam.specMax : '—'} {selectedParam.unit}
                      </span>
                    </p>
                    <p><span className="text-muted-foreground">Method:</span> {selectedParam.method} · {selectedParam.frequency}</p>
                    {selectedParam.isCCP && <p className="text-[hsl(var(--status-warning))] font-semibold mt-1">⚡ This is a Critical Control Point (CCP)</p>}
                  </div>
                  <div>
                    <Label htmlFor="value">Measured Value ({selectedParam.unit})</Label>
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
                    <Textarea id="action" placeholder="Describe immediate correction..." rows={2} required />
                  </div>
                  <div>
                    <Label htmlFor="rootcause">Root Cause</Label>
                    <Input id="rootcause" placeholder="Why did this happen?" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="remark">Remark</Label>
                <Textarea id="remark" placeholder="Additional notes..." rows={2} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" className="flex-1" variant={isFail ? 'destructive' : 'default'}>
            {isFail ? 'Log FAIL & Alert' : 'Log PASS'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
