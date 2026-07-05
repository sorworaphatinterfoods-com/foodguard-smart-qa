import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { useProductHolds } from '@/hooks/useCcpModule';
import type { ProductHold } from '@/lib/ccp-types';
import { PackageX, Lock } from 'lucide-react';

const statusBadge: Record<ProductHold['status'], string> = {
  ON_HOLD: 'bg-[hsl(var(--status-warning))] text-white',
  RELEASED: 'bg-[hsl(var(--status-pass))] text-white',
  DISPOSED: 'bg-muted text-muted-foreground',
};

export default function CcpHoldProducts() {
  const { data: holds = [], isLoading } = useProductHolds();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [disposition, setDisposition] = useState('');
  const [releasedBy, setReleasedBy] = useState('');
  const [busy, setBusy] = useState(false);

  const openForm = (id: string) => {
    setOpenId(openId === id ? null : id);
    setDisposition(''); setReleasedBy('');
  };

  const submit = async (id: string) => {
    if (!disposition || !releasedBy.trim()) {
      toast.error('ต้องระบุ disposition และ QA ผู้อนุมัติ');
      return;
    }
    setBusy(true);
    try {
      await apiPost('/api/ccp/holds', { id, disposition, releasedBy });
      await queryClient.invalidateQueries({ queryKey: ['ccp'] });
      toast.success(disposition === 'RELEASE' ? 'ปล่อยผลิตภัณฑ์แล้ว' : `บันทึก disposition: ${disposition}`);
      setOpenId(null);
    } catch (err) {
      const msg = err instanceof Error && err.message.includes('409')
        ? 'ปล่อยไม่ได้ — CCP Deviation ที่เกี่ยวข้องยังไม่ปิด'
        : 'บันทึกไม่สำเร็จ — เชื่อมต่อ Cloudflare/D1 หรือยัง?';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const onHold = holds.filter((h) => h.status === 'ON_HOLD').length;

  return (
    <AppLayout title="Products on HOLD" showBack>
      <div className="flex items-center gap-2 mb-4">
        <PackageX className="w-5 h-5 text-[hsl(var(--status-warning))]" />
        <p className="text-sm">
          <span className="font-bold text-[hsl(var(--status-warning))]">{onHold}</span>
          <span className="text-muted-foreground"> on hold · {holds.length} total</span>
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
      )}

      {!isLoading && holds.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">ไม่มีผลิตภัณฑ์ที่ถูกกัก 🎉</p>
      )}

      <div className="space-y-2">
        {holds.map((h) => {
          const open = openId === h.id;
          const active = h.status === 'ON_HOLD';
          return (
            <Card key={h.id} className={active ? 'border-[hsl(var(--status-warning))]/40' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{h.id}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge[h.status]}`}>
                        {h.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-semibold text-sm">{h.product || '—'} · <span className="font-mono">{h.lot || 'no lot'}</span></p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    {h.qtyHeld != null && <span>{h.qtyHeld} {h.qtyUnit}</span>}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{h.reason}</p>
                <div className="flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                  {h.line && <span>{h.line}</span>}
                  {(h.affectedFrom || h.affectedTo) && <span>· {h.affectedFrom || '?'}–{h.affectedTo || '?'}</span>}
                  {h.deviationId && <span>· DEV <span className="font-mono">{h.deviationId}</span></span>}
                </div>
                {h.releasedBy && (
                  <p className="text-[11px] text-[hsl(var(--status-pass))] mt-1">
                    ✔ {h.disposition} by {h.releasedBy} · {h.releasedAt}
                  </p>
                )}

                {active && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => openForm(h.id)}>
                      <Lock className="w-4 h-4 mr-1" /> {open ? 'ยกเลิก' : 'Disposition (QA)'}
                    </Button>
                    {open && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <p className="text-[11px] text-muted-foreground">
                          * ปล่อยผลิตภัณฑ์ได้เฉพาะเมื่อ CCP Deviation ปิดแล้ว และต้องมี QA อนุมัติ
                        </p>
                        <div>
                          <Label className="text-xs">Disposition *</Label>
                          <Select value={disposition} onValueChange={setDisposition}>
                            <SelectTrigger><SelectValue placeholder="เลือก" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="RELEASE">Release (ปล่อย)</SelectItem>
                              <SelectItem value="REWORK">Rework</SelectItem>
                              <SelectItem value="REJECT">Reject</SelectItem>
                              <SelectItem value="DESTROY">Destroy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">QA ผู้อนุมัติ (e-signature) *</Label>
                          <Input value={releasedBy} onChange={(e) => setReleasedBy(e.target.value)} placeholder="ชื่อ QA" />
                        </div>
                        <Button size="sm" className="w-full" onClick={() => submit(h.id)} disabled={busy}>
                          {busy ? 'กำลังบันทึก…' : 'ยืนยัน'}
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
