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
import { useCcpDevices } from '@/hooks/useCcpModule';
import { CCP_CRITICAL_LIMITS, FREQUENCY_TYPES, type OkNg, type PassFail } from '@/lib/ccp-types';
import { ScanLine, AlertTriangle, Paperclip, ChevronRight, ChevronLeft, ShieldAlert } from 'lucide-react';

// Big touch-friendly PASS / FAIL (or OK / NG) selector for the production floor.
function BinaryToggle<T extends string>({
  value, onChange, pass, fail,
}: {
  value: T | ''; onChange: (v: T) => void; pass: T; fail: T;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChange(pass)}
        className={`h-14 rounded-xl font-bold text-sm border-2 transition-all active:scale-95 ${
          value === pass
            ? 'bg-[hsl(var(--status-pass))] text-white border-transparent shadow-md'
            : 'border-border text-muted-foreground hover:border-[hsl(var(--status-pass))]'
        }`}
      >
        {pass}
      </button>
      <button
        type="button"
        onClick={() => onChange(fail)}
        className={`h-14 rounded-xl font-bold text-sm border-2 transition-all active:scale-95 ${
          value === fail
            ? 'bg-[hsl(var(--status-fail))] text-white border-transparent shadow-md animate-pulse-alert'
            : 'border-border text-muted-foreground hover:border-[hsl(var(--status-fail))]'
        }`}
      >
        {fail}
      </button>
    </div>
  );
}

const STEPS = ['Setup', 'Test Pieces', 'Containment', 'Confirm'];

export default function MetalDetectorNewTest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: devices = [] } = useCcpDevices();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [datetime, setDatetime] = useState(() => new Date().toISOString().slice(0, 16));
  const [shift, setShift] = useState('');
  const [line, setLine] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [frequencyType, setFrequencyType] = useState<string>('Production period');
  const [product, setProduct] = useState('');
  const [fgCode, setFgCode] = useState('');
  const [lot, setLot] = useState('');

  // Step 2
  const [fe, setFe] = useState<PassFail | ''>('');
  const [nonFe, setNonFe] = useState<PassFail | ''>('');
  const [sus, setSus] = useState<PassFail | ''>('');
  const [rejectMechanism, setRejectMechanism] = useState<OkNg | ''>('');

  // Step 3 (containment)
  const [affectedFrom, setAffectedFrom] = useState('');
  const [affectedTo, setAffectedTo] = useState('');
  const [qtyHeld, setQtyHeld] = useState('');
  const [qtyUnit, setQtyUnit] = useState('kg');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [finalDisposition, setFinalDisposition] = useState('');

  // Step 4
  const [inspector, setInspector] = useState('');
  const [remark, setRemark] = useState('');

  const isFail = useMemo(
    () => fe === 'FAIL' || nonFe === 'FAIL' || sus === 'FAIL' || rejectMechanism === 'NG',
    [fe, nonFe, sus, rejectMechanism],
  );
  const testPiecesDone = fe && nonFe && sus && rejectMechanism;
  const device = devices.find((d) => d.id === deviceId);

  const canNext = () => {
    if (step === 0) return !!deviceId && !!frequencyType;
    if (step === 1) return !!testPiecesDone;
    return true;
  };

  const goNext = () => {
    // Skip the containment step entirely when the CCP result is PASS.
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
      const res = await apiPost<{ result: PassFail; deviationId?: string; holdId?: string }>(
        '/api/ccp/metal-tests',
        {
          datetime: datetime.replace('T', ' '),
          shift, line, product, fgCode, lot, deviceId, frequencyType,
          fe: fe || 'PASS', nonFe: nonFe || 'PASS', sus: sus || 'PASS',
          rejectMechanism: rejectMechanism || 'OK',
          affectedFrom, affectedTo,
          qtyHeld: qtyHeld || undefined, qtyUnit,
          correctiveAction, finalDisposition, inspector, remark,
        },
      );
      await queryClient.invalidateQueries({ queryKey: ['ccp'] });
      if (res.result === 'FAIL') {
        toast.error('🚨 CCP FAIL — หยุดผลิต, กักผลิตภัณฑ์, เปิด Deviation + CAPA แล้ว', { duration: 7000 });
        navigate('/ccp/deviations');
      } else {
        toast.success('✅ CCP PASS — บันทึกผลเรียบร้อย');
        navigate('/ccp/metal-detector/test-records');
      }
    } catch {
      toast.warning('บันทึกในโหมดเดโม — เชื่อมต่อ Cloudflare/D1 เพื่อบันทึกจริง');
      navigate('/ccp/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="New Metal Detector Test" showBack>
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
            <p className={`text-[10px] mt-1 text-center ${i === step ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{s}</p>
          </div>
        ))}
      </div>

      {/* Live FAIL warning */}
      {isFail && step >= 1 && (
        <div className="mb-3 rounded-xl border-2 border-[hsl(var(--status-fail))] bg-[hsl(var(--status-fail)/0.1)] p-3 flex items-center gap-2 animate-pulse-alert">
          <ShieldAlert className="w-5 h-5 text-[hsl(var(--status-fail))] shrink-0" />
          <p className="text-xs font-semibold text-[hsl(var(--status-fail))]">
            CCP FAIL! ต้องหยุดผลิต กักผลิตภัณฑ์ และเปิด Deviation ทันที
          </p>
        </div>
      )}

      {/* STEP 1 — Setup */}
      {step === 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ScanLine className="w-4 h-4 text-primary" /> ข้อมูลการตรวจ (Setup)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
              <Label>เครื่องตรวจโลหะ · Device *</Label>
              <Select value={deviceId} onValueChange={setDeviceId} required>
                <SelectTrigger><SelectValue placeholder="เลือกเครื่อง" /></SelectTrigger>
                <SelectContent>
                  {devices.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name} ({d.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {device && (
                <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                  Sensitivity: Fe {device.fe} · Non-Fe {device.nonFe} · SUS {device.sus} mm
                </p>
              )}
            </div>
            <div>
              <Label>ความถี่การตรวจ · Frequency *</Label>
              <Select value={frequencyType} onValueChange={setFrequencyType} required>
                <SelectTrigger><SelectValue placeholder="เลือกความถี่" /></SelectTrigger>
                <SelectContent>
                  {FREQUENCY_TYPES.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>สินค้า · Product</Label>
                <Input value={product} onChange={(e) => setProduct(e.target.value)} placeholder="ไม้เสียบเนื้อ" />
              </div>
              <div>
                <Label>FG Code</Label>
                <Input value={fgCode} onChange={(e) => setFgCode(e.target.value)} className="font-mono" />
              </div>
            </div>
            <div>
              <Label>Lot No.</Label>
              <Input value={lot} onChange={(e) => setLot(e.target.value)} className="font-mono" placeholder="LOT-XXXX" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 — Test pieces */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ทดสอบชิ้นมาตรฐาน · Test Pieces</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-lg text-xs">
              <p className="font-medium mb-1">Critical Limits (ล็อคตาม revision):</p>
              <p className="font-mono">
                {CCP_CRITICAL_LIMITS.map((l) => `${l.hazard} ≤ ${l.value.toFixed(1)}${l.unit}`).join(' · ')}
              </p>
            </div>
            {[
              { key: 'fe', label: 'Fe (เหล็ก)', limit: '1.0 mm', value: fe, set: setFe },
              { key: 'nonFe', label: 'Non-Fe (อโลหะ)', limit: '1.5 mm', value: nonFe, set: setNonFe },
              { key: 'sus', label: 'SUS (สแตนเลส)', limit: '2.0 mm', value: sus, set: setSus },
            ].map((p) => (
              <div key={p.key}>
                <Label className="flex justify-between">
                  <span>{p.label}</span>
                  <span className="text-muted-foreground font-mono">{p.limit}</span>
                </Label>
                <BinaryToggle
                  value={p.value}
                  onChange={(v) => p.set(v as PassFail)}
                  pass="PASS"
                  fail="FAIL"
                />
              </div>
            ))}
            <div className="border-t pt-3">
              <Label>กลไก Reject · Reject Mechanism</Label>
              <BinaryToggle
                value={rejectMechanism}
                onChange={(v) => setRejectMechanism(v as OkNg)}
                pass="OK"
                fail="NG"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3 — Containment (FAIL only) */}
      {step === 2 && (
        <Card className="border-[hsl(var(--status-fail))]/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-[hsl(var(--status-fail))]">
              <AlertTriangle className="w-4 h-4" /> การควบคุม (Containment)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg bg-[hsl(var(--status-fail)/0.1)] p-2 text-xs font-semibold text-[hsl(var(--status-fail))]">
              ✔ หยุดการผลิต (Production Stopped) — บังคับอัตโนมัติเมื่อ CCP FAIL
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>ผลกระทบ ตั้งแต่เวลา · From</Label>
                <Input type="time" value={affectedFrom} onChange={(e) => setAffectedFrom(e.target.value)} />
              </div>
              <div>
                <Label>ถึงเวลา · To</Label>
                <Input type="time" value={affectedTo} onChange={(e) => setAffectedTo(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>จำนวนที่กัก · Qty Held</Label>
                <Input type="number" step="0.01" value={qtyHeld} onChange={(e) => setQtyHeld(e.target.value)} className="font-mono" />
              </div>
              <div>
                <Label>หน่วย · Unit</Label>
                <Input value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>การแก้ไขเบื้องต้น · Corrective Action</Label>
              <Textarea rows={2} value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} placeholder="เช่น แยกผลิตภัณฑ์, ตรวจซ้ำ, สอบเทียบเครื่อง" />
            </div>
            <div>
              <Label>Final Disposition (เบื้องต้น)</Label>
              <Select value={finalDisposition} onValueChange={setFinalDisposition}>
                <SelectTrigger><SelectValue placeholder="ยังไม่ระบุ — รอ QA" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Rework">Rework</SelectItem>
                  <SelectItem value="Reject">Reject</SelectItem>
                  <SelectItem value="Destroy">Destroy</SelectItem>
                  <SelectItem value="Pending QA">Pending QA</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                * การปล่อยผลิตภัณฑ์ต้องผ่านการตรวจสอบโดย QA เท่านั้น
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4 — Confirm */}
      {step === 3 && (
        <Card className={isFail ? 'border-[hsl(var(--status-fail))]/40' : 'border-[hsl(var(--status-pass))]/40'}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ยืนยันผล · Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={`rounded-xl p-4 text-center ${isFail ? 'bg-[hsl(var(--status-fail)/0.12)]' : 'bg-[hsl(var(--status-pass)/0.12)]'}`}>
              <p className="text-xs text-muted-foreground mb-1">ผลรวม CCP · Result</p>
              <p className={`text-3xl font-black ${isFail ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}`}>
                {isFail ? 'FAIL' : 'PASS'}
              </p>
              <p className="text-[11px] font-mono mt-1">
                Fe {fe || 'PASS'} · Non-Fe {nonFe || 'PASS'} · SUS {sus || 'PASS'} · Reject {rejectMechanism || 'OK'}
              </p>
            </div>
            <div>
              <Label>ผู้ตรวจ · Inspector *</Label>
              <Input value={inspector} onChange={(e) => setInspector(e.target.value)} placeholder="ชื่อ / รหัสพนักงาน" />
            </div>
            <div>
              <Label>หมายเหตุ · Remark</Label>
              <Textarea rows={2} value={remark} onChange={(e) => setRemark(e.target.value)} />
            </div>
            <div>
              <Label className="flex items-center gap-1"><Paperclip className="w-3.5 h-3.5" /> แนบรูป/ไฟล์ · Attachment</Label>
              <Input type="file" disabled className="opacity-60" />
              <p className="text-[11px] text-muted-foreground mt-1">พร้อมรองรับ R2 storage (เร็วๆ นี้)</p>
            </div>
            {isFail && (
              <div className="text-[11px] text-muted-foreground bg-muted rounded-lg p-2">
                เมื่อบันทึก ระบบจะ: หยุดผลิต → กักผลิตภัณฑ์ → เปิด CCP Deviation → สร้าง CAPA (ฉบับร่าง) → รอ QA ตรวจสอบ
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nav buttons */}
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
          <Button
            type="button"
            className="flex-1"
            variant={isFail ? 'destructive' : 'default'}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'กำลังบันทึก…' : isFail ? 'บันทึก & หยุดผลิต' : 'บันทึกผล PASS'}
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
