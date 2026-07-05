import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { useCcpDeviations } from '@/hooks/useCcpModule';
import type { CcpDeviation } from '@/lib/ccp-types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const statusBadge: Record<CcpDeviation['status'], string> = {
  OPEN: 'bg-[hsl(var(--status-fail))] text-white',
  UNDER_REVIEW: 'bg-[hsl(var(--status-warning))] text-white',
  VERIFIED: 'bg-[hsl(var(--status-pass))] text-white',
  CLOSED: 'bg-muted text-muted-foreground',
};

export default function CcpDeviations() {
  const { data: deviations = [], isLoading } = useCcpDeviations();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [rootCause, setRootCause] = useState('');
  const [disposition, setDisposition] = useState('');
  const [verifiedBy, setVerifiedBy] = useState('');
  const [busy, setBusy] = useState(false);

  const openForm = (id: string) => {
    setOpenId(openId === id ? null : id);
    setRootCause(''); setDisposition(''); setVerifiedBy('');
  };

  const verify = async (id: string) => {
    if (!verifiedBy.trim() || !disposition) {
      toast.error('ต้องระบุ QA Supervisor และ Disposition ก่อนยืนยัน');
      return;
    }
    setBusy(true);
    try {
      await apiPost('/api/ccp/deviations', {
        id, rootCause, disposition, verifiedBy, status: 'VERIFIED',
      });
      await queryClient.invalidateQueries({ queryKey: ['ccp'] });
      toast.success('ยืนยัน Deviation โดย QA เรียบร้อย');
      setOpenId(null);
    } catch {
      toast.warning('บันทึกไม่สำเร็จ — เชื่อมต่อ Cloudflare/D1 หรือยัง?');
    } finally {
      setBusy(false);
    }
  };

  const openCount = deviations.filter((d) => d.status === 'OPEN' || d.status === 'UNDER_REVIEW').length;

  return (
    <AppLayout title="CCP Deviations" showBack>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-fail))]" />
        <p className="text-sm">
          <span className="font-bold text-[hsl(var(--status-fail))]">{openCount}</span>
          <span className="text-muted-foreground"> open · {deviations.length} total</span>
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
      )}

      {!isLoading && deviations.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">ไม่มี CCP Deviation 🎉</p>
      )}

      <div className="space-y-2">
        {deviations.map((d) => {
          const open = openId === d.id;
          const actionable = d.status === 'OPEN' || d.status === 'UNDER_REVIEW';
          return (
            <Card key={d.id} className={actionable ? 'border-[hsl(var(--status-fail))]/40' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{d.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[d.status]}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{d.product || '—'} · <span className="font-mono">{d.lot || 'no lot'}</span></p>
                  </div>
                  {d.productionStopped && <Badge variant="destructive" className="text-[10px]">STOPPED</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{d.description}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span>{d.datetime}</span>
                  {d.line && <span>· {d.line}</span>}
                  {d.capaId && <span>· CAPA <span className="font-mono">{d.capaId}</span></span>}
                  {d.holdId && <span>· HOLD <span className="font-mono">{d.holdId}</span></span>}
                </div>
                {d.verifiedBy && (
                  <p className="text-[11px] text-[hsl(var(--status-pass))] mt-1">
                    ✔ Verified by {d.verifiedBy} · {d.verifiedAt} {d.disposition && `· ${d.disposition}`}
                  </p>
                )}

                {actionable && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => openForm(d.id)}>
                      <ShieldCheck className="w-4 h-4 mr-1" /> {open ? 'ยกเลิก' : 'QA Verify & Close'}
                    </Button>
                    {open && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <div>
                          <Label className="text-xs">Root Cause</Label>
                          <Textarea rows={2} value={rootCause} onChange={(e) => setRootCause(e.target.value)} />
                        </div>
                        <div>
                          <Label className="text-xs">Final Disposition *</Label>
                          <Select value={disposition} onValueChange={setDisposition}>
                            <SelectTrigger><SelectValue placeholder="เลือก disposition" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Release">Release</SelectItem>
                              <SelectItem value="Rework">Rework</SelectItem>
                              <SelectItem value="Reject">Reject</SelectItem>
                              <SelectItem value="Destroy">Destroy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">QA Supervisor (e-signature) *</Label>
                          <Input value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="ชื่อ QA Supervisor" />
                        </div>
                        <Button size="sm" className="w-full" onClick={() => verify(d.id)} disabled={busy}>
                          {busy ? 'กำลังบันทึก…' : 'ยืนยันโดย QA Supervisor'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
