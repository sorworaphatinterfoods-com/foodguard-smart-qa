import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { useColdChainPoints } from '@/hooks/useCcpModule';
import type { PassFail } from '@/lib/ccp-types';
import { Snowflake, Truck, Refrigerator, AlertTriangle, Paperclip, ShieldAlert } from 'lucide-react';

const pointIcon = (t: string) => (t === 'TRANSPORT' ? Truck : t === 'CHILLER' ? Refrigerator : Snowflake);

export default function ColdChainNewReading() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { data: points = [] } = useColdChainPoints();

  const [pointId, setPointId] = useState('');
  const [datetime, setDatetime] = useState(() => new Date().toISOString().slice(0, 16));
  const [shift, setShift] = useState('');
  const [temp, setTemp] = useState('');
  const [product, setProduct] = useState('');
  const [fgCode, setFgCode] = useState('');
  const [lot, setLot] = useState('');
  const [excursionMinutes, setExcursionMinutes] = useState('');
  const [affectedFrom, setAffectedFrom] = useState('');
  const [affectedTo, setAffectedTo] = useState('');
  const [qtyHeld, setQtyHeld] = useState('');
  const [qtyUnit, setQtyUnit] = useState('kg');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [finalDisposition, setFinalDisposition] = useState('');
  const [recordedBy, setRecordedBy] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preselect the point from the dashboard tile (?point=CR-01).
  useEffect(() => {
    const q = searchParams.get('point');
    if (q && !pointId) setPointId(q);
  }, [searchParams, pointId]);

  const point = points.find((p) => p.id === pointId);
  const tempNum = parseFloat(temp);
  const hasReading = temp !== '' && !isNaN(tempNum);
  const isFail = useMemo(() => {
    if (!point || !hasReading) return false;
    const belowMin = point.limitMin != null && tempNum < point.limitMin;
    const aboveMax = point.limitMax != null && tempNum > point.limitMax;
    return belowMin || aboveMax;
  }, [point, hasReading, tempNum]);

  const submit = async () => {
    if (!pointId) return toast.error('กรุณาเลือกจุดตรวจ (Monitoring Point)');
    if (!hasReading) return toast.error('กรุณากรอกอุณหภูมิ');
    if (!recordedBy.trim()) return toast.error('กรุณาระบุผู้บันทึก (Recorded by)');
    setSubmitting(true);
    try {
      const res = await apiPost<{ result: PassFail }>('/api/ccp/coldchain-logs', {
        datetime: datetime.replace('T', ' '), shift, pointId, temp,
        product, fgCode, lot, excursionMinutes: excursionMinutes || undefined,
        affectedFrom, affectedTo, qtyHeld: qtyHeld || undefined, qtyUnit,
        correctiveAction, finalDisposition, recordedBy, remark,
      });
      await queryClient.invalidateQueries({ queryKey: ['ccp'] });
      if (res.result === 'FAIL') {
        toast.error('🚨 อุณหภูมิผิดเกณฑ์ — กักผลิตภัณฑ์, เปิด Deviation + CAPA แล้ว', { duration: 7000 });
        navigate('/ccp/deviations');
      } else {
        toast.success('✅ IN RANGE — บันทึกเรียบร้อย');
        navigate('/ccp/coldchain/records');
      }
    } catch {
      toast.warning('บันทึกในโหมดเดโม — เชื่อมต่อ Cloudflare/D1 เพื่อบันทึกจริง');
      navigate('/ccp/coldchain');
    } finally {
      setSubmitting(false);
    }
  };

  const Icon = point ? pointIcon(point.type) : Snowflake;

  return (
    <AppLayout title="บันทึกอุณหภูมิ Cold Chain" showBack>
      {isFail && (
        <div className="mb-3 rounded-xl border-2 border-[hsl(var(--status-fail))] bg-[hsl(var(--status-fail)/0.1)] p-3 flex items-center gap-2 animate-pulse-alert">
          <ShieldAlert className="w-5 h-5 text-[hsl(var(--status-fail))] shrink-0" />
          <p className="text-xs font-semibold text-[hsl(var(--status-fail))]">
            อุณหภูมิเกินเกณฑ์วิกฤต — ต้องกักผลิตภัณฑ์และเปิด Deviation
          </p>
        </div>
      )}

      <Card className="mb-3">
        <CardHeader className="pb-3"><CardTitle className="text-base">จุดตรวจ &amp; อุณหภูมิ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>จุดตรวจ · Monitoring Point *</Label>
            <Select value={pointId} onValueChange={setPointId}>
              <SelectTrigger><SelectValue placeholder="เลือกจุดตรวจ" /></SelectTrigger>
              <SelectContent>
                {points.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} ({p.id})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {point && (
            <div className="bg-muted p-2.5 rounded-lg text-xs flex items-center gap-2">
              <Icon className="w-4 h-4 text-[hsl(var(--status-info))]" />
              <span>เกณฑ์: <span className="font-mono font-semibold">{point.targetLabel}</span></span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dt">วันที่/เวลา</Label>
              <Input id="dt" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
            </div>
            <div>
              <Label>กะ · Shift</Label>
              <Select value={shift} onValueChange={setShift}>
                <SelectTrigger><SelectValue placeholder="กะ" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A (เช้า)</SelectItem>
                  <SelectItem value="B">B (บ่าย)</SelectItem>
                  <SelectItem value="C">C (ดึก)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="temp">อุณหภูมิ (°C) *</Label>
            <Input
              id="temp" type="number" step="0.1" inputMode="decimal"
              value={temp} onChange={(e) => setTemp(e.target.value)}
              className={`font-mono text-3xl h-16 text-center font-bold ${
                hasReading ? (isFail ? 'border-[hsl(var(--status-fail))] text-[hsl(var(--status-fail))]' : 'border-[hsl(var(--status-pass))] text-[hsl(var(--status-pass))]') : ''
              }`}
              placeholder="0.0"
            />
          </div>

          {hasReading && point && (
            <div className={`rounded-xl p-3 text-center font-black text-2xl ${isFail ? 'bg-[hsl(var(--status-fail)/0.12)] text-[hsl(var(--status-fail))]' : 'bg-[hsl(var(--status-pass)/0.12)] text-[hsl(var(--status-pass))]'}`}>
              {isFail ? 'OUT OF RANGE' : 'IN RANGE'}
            </div>
          )}
        </CardContent>
      </Card>

      {isFail && (
        <Card className="mb-3 border-[hsl(var(--status-fail))]/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[hsl(var(--status-fail))]">
              <AlertTriangle className="w-4 h-4" /> ผลิตภัณฑ์ที่กระทบ / การควบคุม
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>สินค้า · Product</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} /></div>
              <div><Label>FG Code</Label><Input value={fgCode} onChange={(e) => setFgCode(e.target.value)} className="font-mono" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Lot No.</Label><Input value={lot} onChange={(e) => setLot(e.target.value)} className="font-mono" /></div>
              <div><Label>ระยะเวลาเกินเกณฑ์ (นาที)</Label><Input type="number" value={excursionMinutes} onChange={(e) => setExcursionMinutes(e.target.value)} className="font-mono" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>กระทบ ตั้งแต่</Label><Input type="time" value={affectedFrom} onChange={(e) => setAffectedFrom(e.target.value)} /></div>
              <div><Label>ถึง</Label><Input type="time" value={affectedTo} onChange={(e) => setAffectedTo(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>จำนวนที่กัก</Label><Input type="number" step="0.01" value={qtyHeld} onChange={(e) => setQtyHeld(e.target.value)} className="font-mono" /></div>
              <div><Label>หน่วย</Label><Input value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} /></div>
            </div>
            <div>
              <Label>การแก้ไขเบื้องต้น · Corrective Action</Label>
              <Textarea rows={2} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder="เช่น ย้ายสินค้าไปห้องเย็นสำรอง, เรียกช่างตรวจระบบทำความเย็น" />
            </div>
            <div>
              <Label>Final Disposition (เบื้องต้น)</Label>
              <Select value={finalDisposition} onValueChange={setFinalDisposition}>
                <SelectTrigger><SelectValue placeholder="ยังไม่ระบุ — รอ QA" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Use as is">Use as is (ประเมินแล้วปลอดภัย)</SelectItem>
                  <SelectItem value="Rework">Rework</SelectItem>
                  <SelectItem value="Reject">Reject</SelectItem>
                  <SelectItem value="Pending QA">Pending QA</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">* การปล่อยผลิตภัณฑ์ต้องผ่าน QA เท่านั้น</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-3">
        <CardContent className="p-4 space-y-3">
          <div><Label>ผู้บันทึก · Recorded by *</Label><Input value={recordedBy} onChange={(e) => setRecordedBy(e.target.value)} placeholder="ชื่อ / รหัสพนักงาน" /></div>
          <div><Label>หมายเหตุ · Remark</Label><Textarea rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} /></div>
          <div>
            <Label className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> แนบรูป/ไฟล์</Label>
            <Input type="file" disabled className="opacity-60" />
            <p className="text-[11px] text-muted-foreground mt-1">พร้อมรองรับ R2 storage (เร็วๆ นี้)</p>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full h-12" variant={isFail ? 'destructive' : 'default'} onClick={submit} disabled={submitting}>
        {submitting ? 'กำลังบันทึก…' : isFail ? 'บันทึก & กักผลิตภัณฑ์' : 'บันทึกอุณหภูมิ'}
      </Button>
    </AppLayout>
  );
}
