import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/api';
import { useThermalEquipment } from '@/hooks/useCcpModule';
import { FREQUENCY_TYPES, THERMAL_LIMITS, type PassFail, type ThermalStage } from '@/lib/ccp-types';
import { Flame, Snowflake, AlertTriangle, Paperclip, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

const STEPS = ['Setup', 'Reading', 'Containment', 'Confirm'];

export default function ThermalNewReading() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: equipment = [] } = useThermalEquipment();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [stage, setStage] = useState<ThermalStage>('COOKING');
  const [datetime, setDatetime] = useState(() => new Date().toISOString().slice(0, 16));
  const [shift, setShift] = useState('');
  const [line, setLine] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [frequencyType, setFrequencyType] = useState('Production period');
  const [product, setProduct] = useState('');
  const [fgCode, setFgCode] = useState('');
  const [lot, setLot] = useState('');
  const [batch, setBatch] = useState('');

  const [coreTemp, setCoreTemp] = useState('');
  const [holdMinutes, setHoldMinutes] = useState('');

  const [affectedFrom, setAffectedFrom] = useState('');
  const [affectedTo, setAffectedTo] = useState('');
  const [qtyHeld, setQtyHeld] = useState('');
  const [qtyUnit, setQtyUnit] = useState('kg');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [finalDisposition, setFinalDisposition] = useState('');

  const [inspector, setInspector] = useState('');
  const [remark, setRemark] = useState('');

  const limit = THERMAL_LIMITS[stage];
  const stageEquipment = equipment.filter((e) => e.stage === stage || e.type === 'PROBE');

  const temp = parseFloat(coreTemp);
  const isFail = useMemo(() => {
    if (coreTemp === '' || isNaN(temp)) return false;
    return limit.direction === 'MIN' ? temp < limit.value : temp > limit.value;
  }, [coreTemp, temp, limit]);
  const hasReading = coreTemp !== '' && !isNaN(temp);

  const canNext = () => {
    if (step === 0) return !!equipmentId;
    if (step === 1) return hasReading;
    return true;
  };
  const goNext = () => {
    if (step === 1 && !isFail) setStep(3);
    else setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => {
    if (step === 3 && !isFail) setStep(1);
    else setStep((s) => Math.max(s - 1, 0));
  };

  const submit = async () => {
    if (!inspector.trim()) {
      toast.error('กรุณาระบุผู้ตรวจ (Inspector)');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiPost<{ result: PassFail }>('/api/ccp/thermal-logs', {
        datetime: datetime.replace('T', ' '), shift, line, stage, product, fgCode, lot, batch,
        equipmentId, frequencyType, coreTemp, holdMinutes: stage === 'COOKING' ? holdMinutes : undefined,
        affectedFrom, affectedTo, qtyHeld: qtyHeld || undefined, qtyUnit,
        correctiveAction, finalDisposition, inspector, remark,
      });
      await queryClient.invalidateQueries({ queryKey: ['ccp'] });
      if (res.result === 'FAIL') {
        toast.error('🚨 CCP FAIL — หยุดผลิต, กักผลิตภัณฑ์, เปิด Deviation + CAPA แล้ว', { duration: 7000 });
        navigate('/ccp/deviations');
      } else {
        toast.success('✅ CCP PASS — บันทึกอุณหภูมิเรียบร้อย');
        navigate('/ccp/thermal/records');
      }
    } catch {
      toast.warning('บันทึกในโหมดเดโม — เชื่อมต่อ Cloudflare/D1 เพื่อบันทึกจริง');
      navigate('/ccp/thermal');
    } finally {
      setSubmitting(false);
    }
  };

  const StageIcon = stage === 'COOKING' ? Flame : Snowflake;

  return (
    <AppLayout title="บันทึกอุณหภูมิ CCP" showBack>
      <div className="flex items-center gap-1 mb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            <p className={`text-[10px] mt-1 text-center ${i === step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</p>
          </div>
        ))}
      </div>

      {isFail && step >= 1 && (
        <div className="mb-3 rounded-xl border-2 border-[hsl(var(--status-fail))] bg-[hsl(var(--status-fail)/0.1)] p-3 flex items-center gap-2 animate-pulse-alert">
          <ShieldAlert className="w-5 h-5 text-[hsl(var(--status-fail))] shrink-0" />
          <p className="text-xs font-semibold text-[hsl(var(--status-fail))]">
            CCP FAIL! อุณหภูมิไม่ผ่านเกณฑ์ — ต้องหยุดผลิตและกักผลิตภัณฑ์
          </p>
        </div>
      )}

      {/* STEP 1 — Setup */}
      {step === 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">ข้อมูลการตรวจ (Setup)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>ขั้นตอน · Stage</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => { setStage('COOKING'); setEquipmentId(''); }}
                  className={`h-14 rounded-xl font-bold text-sm border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${stage === 'COOKING' ? 'bg-[hsl(var(--status-warning))] text-white border-transparent shadow-md' : 'border-border text-muted-foreground'}`}>
                  <Flame className="w-4 h-4" /> Cooking ≥75°C
                </button>
                <button type="button" onClick={() => { setStage('FREEZING'); setEquipmentId(''); }}
                  className={`h-14 rounded-xl font-bold text-sm border-2 flex items-center justify-center gap-2 transition-all active:scale-95 ${stage === 'FREEZING' ? 'bg-[hsl(var(--status-info))] text-white border-transparent shadow-md' : 'border-border text-muted-foreground'}`}>
                  <Snowflake className="w-4 h-4" /> Freezing ≤-18°C
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="dt">วันที่/เวลา · Date/Time</Label>
              <Input id="dt" type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>กะ · Shift</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger><SelectValue placeholder="เลือกกะ" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A (เช้า)</SelectItem>
                    <SelectItem value="B">B (บ่าย)</SelectItem>
                    <SelectItem value="C">C (ดึก)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ไลน์ · Line</Label>
                <Input value={line} onChange={(e) => setLine(e.target.value)} placeholder="Line 1" />
              </div>
            </div>
            <div>
              <Label>อุปกรณ์ · Equipment *</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId} required>
                <SelectTrigger><SelectValue placeholder="เลือกอุปกรณ์" /></SelectTrigger>
                <SelectContent>
                  {stageEquipment.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ความถี่การตรวจ · Frequency</Label>
              <Select value={frequencyType} onValueChange={setFrequencyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FREQUENCY_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>สินค้า · Product</Label><Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="ไม้เสียบเนื้อ" /></div>
              <div><Label>FG Code</Label><Input value={fgCode} onChange={(e) => setFgCode(e.target.value)} className="font-mono" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Lot No.</Label><Input value={lot} onChange={(e) => setLot(e.target.value)} className="font-mono" /></div>
              <div><Label>Batch No.</Label><Input value={batch} onChange={(e) => setBatch(e.target.value)} className="font-mono" /></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 — Reading */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <StageIcon className={`w-4 h-4 ${stage === 'COOKING' ? 'text-[hsl(var(--status-warning))]' : 'text-[hsl(var(--status-info))]'}`} />
              วัดอุณหภูมิแกน · Core Temp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-lg text-xs">
              <p className="font-medium mb-0.5">Critical Limit (ล็อคตาม revision):</p>
              <p className="font-mono">{limit.label}</p>
            </div>
            <div>
              <Label htmlFor="temp" className="text-sm">อุณหภูมิแกน (°C) *</Label>
              <Input
                id="temp" type="number" step="0.1" inputMode="decimal"
                value={coreTemp} onChange={(e) => setCoreTemp(e.target.value)}
                className={`font-mono text-3xl h-16 text-center font-bold ${
                  hasReading ? (isFail ? 'border-[hsl(var(--status-fail))] text-[hsl(var(--status-fail))]' : 'border-[hsl(var(--status-pass))] text-[hsl(var(--status-pass))]') : ''
                }`}
                placeholder="0.0"
              />
            </div>
            {stage === 'COOKING' && (
              <div>
                <Label htmlFor="hold">เวลาคงอุณหภูมิ · Hold time (นาที)</Label>
                <Input id="hold" type="number" step="0.1" value={holdMinutes} onChange={(e) => setHoldMinutes(e.target.value)} className="font-mono" />
              </div>
            )}
            {hasReading && (
              <div className={`rounded-xl p-3 text-center font-black text-2xl ${isFail ? 'bg-[hsl(var(--status-fail)/0.12)] text-[hsl(var(--status-fail))]' : 'bg-[hsl(var(--status-pass)/0.12)] text-[hsl(var(--status-pass))]'}`}>
                {isFail ? 'FAIL' : 'PASS'}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 3 — Containment */}
      {step === 2 && (
        <Card className="border-[hsl(var(--status-fail))]/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[hsl(var(--status-fail))]">
              <AlertTriangle className="w-4 h-4" /> การควบคุม (Containment)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-[hsl(var(--status-fail)/0.1)] p-2 text-xs font-semibold text-[hsl(var(--status-fail))]">
              ✔ หยุดการผลิต — บังคับอัตโนมัติเมื่อ CCP FAIL
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ผลกระทบ ตั้งแต่ · From</Label><Input type="time" value={affectedFrom} onChange={(e) => setAffectedFrom(e.target.value)} /></div>
              <div><Label>ถึง · To</Label><Input type="time" value={affectedTo} onChange={(e) => setAffectedTo(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>จำนวนที่กัก · Qty</Label><Input type="number" step="0.01" value={qtyHeld} onChange={(e) => setQtyHeld(e.target.value)} className="font-mono" /></div>
              <div><Label>หน่วย · Unit</Label><Input value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} /></div>
            </div>
            <div>
              <Label>การแก้ไขเบื้องต้น · Corrective Action</Label>
              <Textarea rows={2} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)}
                placeholder={stage === 'COOKING' ? 'เช่น นำกลับไปทำสุกซ้ำ, ตรวจเตา' : 'เช่น นำกลับเข้าแช่แข็งซ้ำ, ตรวจ freezer'} />
            </div>
            <div>
              <Label>Final Disposition (เบื้องต้น)</Label>
              <Select value={finalDisposition} onValueChange={setFinalDisposition}>
                <SelectTrigger><SelectValue placeholder="ยังไม่ระบุ — รอ QA" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Recook/Refreeze">Recook / Refreeze</SelectItem>
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

      {/* STEP 4 — Confirm */}
      {step === 3 && (
        <Card className={isFail ? 'border-[hsl(var(--status-fail))]/40' : 'border-[hsl(var(--status-pass))]/40'}>
          <CardHeader className="pb-3"><CardTitle className="text-base">ยืนยันผล · Confirm</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className={`rounded-xl p-4 text-center ${isFail ? 'bg-[hsl(var(--status-fail)/0.12)]' : 'bg-[hsl(var(--status-pass)/0.12)]'}`}>
              <p className="text-xs text-muted-foreground mb-1">{stage === 'COOKING' ? 'Cooking' : 'Freezing'} · Result</p>
              <p className={`text-3xl font-black ${isFail ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}`}>{isFail ? 'FAIL' : 'PASS'}</p>
              <p className="text-[11px] font-mono mt-1">แกน {coreTemp || '—'}°C · เกณฑ์ {limit.direction === 'MIN' ? '≥' : '≤'} {limit.value}°C</p>
            </div>
            <div><Label>ผู้ตรวจ · Inspector *</Label><Input value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="ชื่อ / รหัสพนักงาน" /></div>
            <div><Label>หมายเหตุ · Remark</Label><Textarea rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} /></div>
            <div>
              <Label className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> แนบรูป/ไฟล์</Label>
              <Input type="file" disabled className="opacity-60" />
              <p className="text-[11px] text-muted-foreground mt-1">พร้อมรองรับ R2 storage (เร็วๆ นี้)</p>
            </div>
            {isFail && (
              <div className="text-[11px] text-muted-foreground bg-muted rounded-lg p-2">
                เมื่อบันทึก ระบบจะ: หยุดผลิต → กักผลิตภัณฑ์ → เปิด CCP Deviation → สร้าง CAPA (ร่าง) → รอ QA ตรวจสอบ
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 mt-4">
        {step > 0 && (
          <Button type="button" variant="outline" className="flex-1" onClick={goBack} disabled={submitting}>
            <ChevronLeft className="w-4 h-4 mr-1" /> ย้อนกลับ
          </Button>
        )}
        {step < 3 ? (
          <Button type="button" className="flex-1" onClick={goNext} disabled={!canNext()}>
            ถัดไป <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" className="flex-1" variant={isFail ? 'destructive' : 'default'} onClick={submit} disabled={submitting}>
            {submitting ? 'กำลังบันทึก…' : isFail ? 'บันทึก & หยุดผลิต' : 'บันทึกผล PASS'}
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
