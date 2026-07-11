import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useThermalDashboard } from '@/hooks/useCcpModule';
import { THERMAL_LIMITS } from '@/lib/ccp-types';
import {
  Thermometer, Flame, Snowflake, CheckCircle2, XCircle,
  AlertTriangle, PackageX, ShieldCheck, Plus, ListChecks,
} from 'lucide-react';

type Tone = 'default' | 'pass' | 'fail' | 'warning';
const toneClass: Record<Tone, string> = {
  default: 'text-foreground',
  pass: 'text-[hsl(var(--status-pass))]',
  fail: 'text-[hsl(var(--status-fail))]',
  warning: 'text-[hsl(var(--status-warning))]',
};

function StatCard({ icon: Icon, label, value, sub, tone = 'default' }: {
  icon: typeof Flame; label: string; value: string | number; sub?: string; tone?: Tone;
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${toneClass[tone]}`} />
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        </div>
        <p className={`text-2xl font-bold font-mono ${toneClass[tone]}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function ThermalDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useThermalDashboard();

  if (isLoading || !data) {
    return (
      <AppLayout title="CCP อุณหภูมิ" showBack>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="CCP อุณหภูมิ" showBack>
      <Card className="mb-4 border-primary/30 bg-brand-gradient text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Thermometer className="w-5 h-5" />
            <p className="font-semibold text-sm">CCP: อุณหภูมิ (Cooking &amp; Freezing)</p>
          </div>
          <p className="text-xs text-white/85 mb-2">ไม้เสียบเนื้อแช่แข็ง · ทำสุกทั่วถึง แล้วแช่เยือกแข็งเร็ว</p>
          <div className="flex gap-2 flex-wrap">
            <span className="text-[11px] font-mono bg-white/20 rounded px-2 py-0.5 flex items-center gap-1">
              <Flame className="w-3 h-3" /> {THERMAL_LIMITS.COOKING.value}{THERMAL_LIMITS.COOKING.unit} ↑
            </span>
            <span className="text-[11px] font-mono bg-white/20 rounded px-2 py-0.5 flex items-center gap-1">
              <Snowflake className="w-3 h-3" /> {THERMAL_LIMITS.FREEZING.value}{THERMAL_LIMITS.FREEZING.unit} ↓
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard icon={Thermometer} label="Checks Today" value={data.checksToday} />
        <StatCard icon={CheckCircle2} label="PASS Rate" value={data.passRate === null ? '—' : `${data.passRate}%`}
          tone={data.passRate !== null && data.passRate < 100 ? 'warning' : 'pass'} />
        <StatCard icon={Flame} label="Cooking Today" value={data.cookingToday} tone="warning" />
        <StatCard icon={Snowflake} label="Freezing Today" value={data.freezingToday} tone="default" />
        <StatCard icon={XCircle} label="CCP FAIL" value={data.failCount} tone={data.failCount > 0 ? 'fail' : 'default'} />
        <StatCard icon={AlertTriangle} label="Open Deviations" value={data.openDeviations} tone={data.openDeviations > 0 ? 'fail' : 'default'} />
        <StatCard icon={PackageX} label="On HOLD" value={data.productsOnHold} tone={data.productsOnHold > 0 ? 'warning' : 'default'} />
        <StatCard icon={ShieldCheck} label="Verify Pending" value={data.pendingVerification} tone={data.pendingVerification > 0 ? 'warning' : 'default'} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1"><Flame className="w-4 h-4 text-[hsl(var(--status-warning))]" /><span className="text-xs font-medium">Last Cooking</span></div>
            {data.lastCooking
              ? <p className="text-sm font-mono font-bold">{data.lastCooking.temp}°C <span className={data.lastCooking.result === 'FAIL' ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}>· {data.lastCooking.result}</span></p>
              : <p className="text-xs text-muted-foreground">—</p>}
            {data.lastCooking && <p className="text-[10px] text-muted-foreground">{data.lastCooking.at}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 mb-1"><Snowflake className="w-4 h-4 text-[hsl(var(--status-info))]" /><span className="text-xs font-medium">Last Freezing</span></div>
            {data.lastFreezing
              ? <p className="text-sm font-mono font-bold">{data.lastFreezing.temp}°C <span className={data.lastFreezing.result === 'FAIL' ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}>· {data.lastFreezing.result}</span></p>
              : <p className="text-xs text-muted-foreground">—</p>}
            {data.lastFreezing && <p className="text-[10px] text-muted-foreground">{data.lastFreezing.at}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <Button className="w-full h-12 text-base" onClick={() => navigate('/ccp/thermal/new')}>
          <Plus className="w-5 h-5 mr-2" /> บันทึกอุณหภูมิ CCP
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => navigate('/ccp/thermal/records')}>
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
