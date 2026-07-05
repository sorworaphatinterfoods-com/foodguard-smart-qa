import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusIndicator } from '@/components/StatusIndicator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { useVerifications } from '@/hooks/useCcpModule';
import type { Verification } from '@/lib/ccp-types';
import { ShieldCheck, PenLine } from 'lucide-react';

export default function CcpVerification() {
  const { data: verifications = [], isLoading } = useVerifications();
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [verifiedBy, setVerifiedBy] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const openForm = (id: string) => {
    setOpenId(openId === id ? null : id);
    setVerifiedBy(''); setComment('');
  };

  const sign = async (id: string, result: 'VERIFIED' | 'REJECTED') => {
    if (!verifiedBy.trim()) {
      toast.error('ต้องระบุชื่อ QA ผู้ตรวจสอบ (e-signature)');
      return;
    }
    setBusy(true);
    try {
      await apiPost('/api/ccp/verifications', { id, result, verifiedBy, comment });
      await queryClient.invalidateQueries({ queryKey: ['ccp'] });
      toast.success(result === 'VERIFIED' ? 'ยืนยันโดย QA เรียบร้อย' : 'ปฏิเสธการยืนยันแล้ว');
      setOpenId(null);
    } catch {
      toast.warning('บันทึกไม่สำเร็จ — เชื่อมต่อ Cloudflare/D1 หรือยัง?');
    } finally {
      setBusy(false);
    }
  };

  const pending = verifications.filter((v) => v.result === 'PENDING');

  return (
    <AppLayout title="QA Verification" showBack>
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-[hsl(var(--status-warning))]" />
        <p className="text-sm">
          <span className="font-bold text-[hsl(var(--status-warning))]">{pending.length}</span>
          <span className="text-muted-foreground"> pending · {verifications.length} total</span>
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
      )}

      {!isLoading && verifications.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10">ไม่มีรายการรอตรวจสอบ 🎉</p>
      )}

      <div className="space-y-2">
        {verifications.map((v: Verification) => {
          const open = openId === v.id;
          const isPending = v.result === 'PENDING';
          return (
            <Card key={v.id} className={isPending ? 'border-[hsl(var(--status-warning))]/40' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{v.sourceRef}</span>
                    </div>
                    <p className="font-semibold text-sm">{v.product || '—'} · <span className="font-mono">{v.lot || 'no lot'}</span></p>
                    <p className="text-[11px] text-muted-foreground">{v.line} · {v.device} · {v.testAt}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusIndicator status={v.testResult === 'FAIL' ? 'fail' : 'pass'}>{v.testResult}</StatusIndicator>
                    {!isPending && (
                      <span className={`text-[10px] font-semibold ${v.result === 'VERIFIED' ? 'text-[hsl(var(--status-pass))]' : 'text-[hsl(var(--status-fail))]'}`}>
                        {v.result}
                      </span>
                    )}
                  </div>
                </div>

                {v.verifiedBy && (
                  <p className="text-[11px] text-[hsl(var(--status-pass))]">
                    ✔ {v.result} by {v.verifiedBy} · {v.verifiedAt}
                    {v.comment && <span className="text-muted-foreground"> — {v.comment}</span>}
                  </p>
                )}

                {isPending && (
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => openForm(v.id)}>
                      <PenLine className="w-4 h-4 mr-1" /> {open ? 'ยกเลิก' : 'ลงนาม QA (e-signature)'}
                    </Button>
                    {open && (
                      <div className="mt-3 space-y-2 border-t pt-3">
                        <div>
                          <Label className="text-xs">QA ผู้ตรวจสอบ *</Label>
                          <Input value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="ชื่อ QA / QA Supervisor" />
                        </div>
                        <div>
                          <Label className="text-xs">ความเห็น · Comment</Label>
                          <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button size="sm" variant="destructive" onClick={() => sign(v.id, 'REJECTED')} disabled={busy}>
                            Reject
                          </Button>
                          <Button size="sm" onClick={() => sign(v.id, 'VERIFIED')} disabled={busy}>
                            {busy ? '…' : 'Verify & Sign'}
                          </Button>
                        </div>
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
