import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useColdChainDashboard, useColdChainPoints } from '@/hooks/useCcpModule';
import type { ColdChainPoint } from '@/lib/ccp-types';
import {
  Snowflake, Truck, Refrigerator, ThermometerSnowflake, CheckCircle2, XCircle,
  AlertTriangle, PackageX, ShieldCheck, Plus, ListChecks,
} from 'lucide-react';

type Tone = 'default' | 'pass' | 'fail' | 'warning';
const toneClass: Record<Tone, string> = {
  default: 'text-foreground',
  pass: 'text-[hsl(var(--status-pass))]',
  fail: 'text-[hsl(var(--status-fail))]',
  warning: 'text-[hsl(var(--status-warning))]',
};

function StatCard({ icon: Icon, label, value, tone = 'default' }: {
  icon: typeof Truck; label: string; value: string | number; tone?: Tone;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${toneClass[tone]}`} />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        </div>
        <p className={`text-2xl font-bold font-mono ${toneClass[tone]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

const pointIcon = (t: string) =>
  t === 'TRANSPORT' ? Truck : t === 'CHILLER' ? Refrigerator : Snowflake;

function inAlarm(p: ColdChainPoint): boolean {
  return p.lastResult === 'FAIL';
}

function PointTile({ p, onClick }: { p: ColdChainPoint; onClick: () => void }) {
  const Icon = pointIcon(p.type);
  const alarm = inAlarm(p);
  const noData = p.lastTemp === null || p.lastResult === '';
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-3 transition-all active:scale-95 ${
        alarm
          ? 'border-[hsl(var(--status-fail))] bg-[hsl(var(--status-fail)/0.08)] animate-pulse-alert'
          : noData
            ? 'border-border bg-muted/40'
            : 'border-[hsl(var(--status-pass))]/40 bg-[hsl(var(--status-pass)/0.06)]'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <Icon className={`w-4 h-4 ${alarm ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-info))]'}`} />
        <span className="text-[10px] font-mono text-muted-foreground">{p.id}</span>
      </div>
      <p className="text-xs font-medium leading-tight line-clamp-1">{p.name}</p>
      <p className="text-[10px] text-muted-foreground mb-1">{p.targetLabel}</p>
      {noData ? (
        <p className="text-lg font-bold font-mono text-muted-foreground">— °C</p>
      ) : (
        <p className={`text-2xl font-black font-mono ${alarm ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}`}>
          {p.lastTemp}°C
        </p>
      )}
      <p className={`text-[10px] font-bold ${alarm ? 'text-[hsl(var(--status-fail))]' : noData ? 'text-muted-foreground' : 'text-[hsl(var(--status-pass))]'}`}>
        {noData ? 'ยังไม่มีข้อมูล' : alarm ? '⚠ OUT OF RANGE' : '✓ IN RANGE'}
      </p>
    </button>
  );
}

export default function ColdChainDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useColdChainDashboard();
  const { data: points = [], isLoading: pointsLoading } = useColdChainPoints();

  if (isLoading || !data) {
    return (
      <AppLayout title="CCP Cold Chain" showBack>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="CCP Cold Chain" showBack>
      <Card className="mb-4 border-primary/30 bg-brand-gradient text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThermometerSnowflake className="w-5 h-5" />
            <p className="font-semibold text-sm">CCP: Cold Chain (เก็บรักษา &amp; ขนส่ง)</p>
          </div>
          <p className="text-xs text-white/85">ห้องเย็น FG ≤ -18°C · ห้องเย็นวัตถุดิบ 0–4°C · รถห้องเย็น ≤ -18°C</p>
        </CardContent>
      </Card>

      {/* Live monitoring board */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Monitoring</p>
        {data.pointsInAlarm > 0 && (
          <span className="text-[11px] font-bold text-[hsl(var(--status-fail))] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> {data.pointsInAlarm} จุดผิดปกติ
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {pointsLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          : points.map((p) => (
              <PointTile key={p.id} p={p} onClick={() => navigate(`/ccp/coldchain/new?point=${p.id}`)} />
            ))}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard icon={ListChecks} label="Checks Today" value={data.checksToday} />
        <StatCard icon={CheckCircle2} label="PASS Rate"
          value={data.passRate === null ? '—' : `${data.passRate}%`}
          tone={data.passRate !== null && data.passRate < 100 ? 'warning' : 'pass'} />
        <StatCard icon={XCircle} label="Excursions" value={data.failCount} tone={data.failCount > 0 ? 'fail' : 'default'} />
        <StatCard icon={AlertTriangle} label="Open Deviations" value={data.openDeviations} tone={data.openDeviations > 0 ? 'fail' : 'default'} />
        <StatCard icon={PackageX} label="On HOLD" value={data.productsOnHold} tone={data.productsOnHold > 0 ? 'warning' : 'default'} />
        <StatCard icon={ShieldCheck} label="Verify Pending" value={data.pendingVerification} tone={data.pendingVerification > 0 ? 'warning' : 'default'} />
      </div>

      <div className="space-y-2">
        <Button className="w-full h-12 text-base" onClick={() => navigate('/ccp/coldchain/new')}>
          <Plus className="w-5 h-5 mr-2" /> บันทึกอุณหภูมิ Cold Chain
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => navigate('/ccp/coldchain/records')}>
            <ListChecks className="w-4 h-4 mr-1" /> Records
          </Button>
          <Button variant="outline" onClick={() => navigate('/ccp/deviations')}>
            <AlertTriangle className="w-4 h-4 mr-1" /> Deviations
          </Button>
          <Button variant="outline" onClick={() => navigate('/ccp/hold-products')}>
            <PackageX className="w-4 h-4 mr-1" /> Hold Products
          </Button>
          <Button variant="outline" onClick={() => navigate('/ccp/verification')}>
            <ShieldCheck className="w-4 h-4 mr-1" /> QA Verification
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
