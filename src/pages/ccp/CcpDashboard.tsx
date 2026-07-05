import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useCcpDashboard } from '@/hooks/useCcpModule';
import { CCP_CRITICAL_LIMITS } from '@/lib/ccp-types';
import {
  ScanLine, CheckCircle2, XCircle, AlertTriangle, PackageX,
  Clock, Cpu, ShieldCheck, Plus, ListChecks,
} from 'lucide-react';

type Tone = 'default' | 'pass' | 'fail' | 'warning';

const toneClass: Record<Tone, string> = {
  default: 'text-foreground',
  pass: 'text-[hsl(var(--status-pass))]',
  fail: 'text-[hsl(var(--status-fail))]',
  warning: 'text-[hsl(var(--status-warning))]',
};

function StatCard({
  icon: Icon, label, value, sub, tone = 'default',
}: {
  icon: typeof ScanLine; label: string; value: string | number; sub?: string; tone?: Tone;
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

export default function CcpDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useCcpDashboard();

  if (isLoading || !data) {
    return (
      <AppLayout title="CCP Metal Detector" showBack>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </AppLayout>
    );
  }

  const deviceStatus =
    data.devices.maintenance > 0 || data.devices.inactive > 0
      ? `${data.devices.active}/${data.devices.total} active`
      : `${data.devices.active} active`;

  return (
    <AppLayout title="CCP Metal Detector" showBack>
      {/* CCP profile banner */}
      <Card className="mb-4 border-primary/30 bg-brand-gradient text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="w-5 h-5" />
            <p className="font-semibold text-sm">CCP: Metal Detector ก่อนบรรจุ</p>
          </div>
          <p className="text-xs text-white/85 mb-2">
            ผลิตภัณฑ์: ไม้เสียบเนื้อแช่แข็ง (Frozen meat skewers) · ทุกไม้ต้องผ่านเครื่องตรวจโลหะก่อนแพ็ค
          </p>
          <div className="flex gap-2 flex-wrap">
            {CCP_CRITICAL_LIMITS.map((l) => (
              <span key={l.hazard} className="text-[11px] font-mono bg-white/20 rounded px-2 py-0.5">
                {l.hazard} ≤ {l.value.toFixed(1)} {l.unit}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatCard icon={ScanLine} label="CCP Checks Today" value={data.checksToday} />
        <StatCard
          icon={CheckCircle2} label="CCP PASS Rate"
          value={data.passRate === null ? '—' : `${data.passRate}%`}
          tone={data.passRate !== null && data.passRate < 100 ? 'warning' : 'pass'}
        />
        <StatCard icon={XCircle} label="CCP FAIL Count" value={data.failCount} tone={data.failCount > 0 ? 'fail' : 'default'} />
        <StatCard icon={AlertTriangle} label="Open Deviations" value={data.openDeviations} tone={data.openDeviations > 0 ? 'fail' : 'default'} />
        <StatCard icon={PackageX} label="Products on HOLD" value={data.productsOnHold} tone={data.productsOnHold > 0 ? 'warning' : 'default'} />
        <StatCard icon={ShieldCheck} label="Verification Pending" value={data.pendingVerification} tone={data.pendingVerification > 0 ? 'warning' : 'default'} />
        <StatCard
          icon={Clock} label="Last MD Test"
          value={data.lastTest ? data.lastTest.result : '—'}
          sub={data.lastTest ? data.lastTest.at : 'no tests yet'}
          tone={data.lastTest?.result === 'FAIL' ? 'fail' : 'pass'}
        />
        <StatCard icon={Cpu} label="Device Status" value={deviceStatus} tone={data.devices.active === data.devices.total ? 'pass' : 'warning'} />
      </div>

      {/* Primary actions */}
      <div className="space-y-2">
        <Button className="w-full h-12 text-base" onClick={() => navigate('/ccp/metal-detector/new-test')}>
          <Plus className="w-5 h-5 mr-2" /> บันทึกผลตรวจ Metal Detector
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={() => navigate('/ccp/metal-detector/test-records')}>
            <ListChecks className="w-4 h-4 mr-1" /> Test Records
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
