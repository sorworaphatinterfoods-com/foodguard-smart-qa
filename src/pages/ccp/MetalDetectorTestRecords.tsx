import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusIndicator } from '@/components/StatusIndicator';
import { ExportButton } from '@/components/ExportButton';
import { PrintReport, PrintColumn } from '@/components/PrintReport';
import { useMetalTests } from '@/hooks/useCcpModule';
import type { MetalTest } from '@/lib/ccp-types';
import { Plus, Printer, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Filter = 'ALL' | 'PASS' | 'FAIL' | 'HOLD' | 'PENDING';

const columns: PrintColumn<MetalTest>[] = [
  { header: 'Ref', cell: (r) => r.ref },
  { header: 'Date/Time', cell: (r) => r.datetime },
  { header: 'Line', cell: (r) => r.line },
  { header: 'Product', cell: (r) => r.product },
  { header: 'Lot', cell: (r) => r.lot },
  { header: 'Device', cell: (r) => r.deviceId },
  { header: 'Freq', cell: (r) => r.frequencyType },
  { header: 'Fe', cell: (r) => r.fe },
  { header: 'Non-Fe', cell: (r) => r.nonFe },
  { header: 'SUS', cell: (r) => r.sus },
  { header: 'Reject', cell: (r) => r.rejectMechanism },
  { header: 'Result', cell: (r) => r.result },
  { header: 'Inspector', cell: (r) => r.inspector },
  { header: 'Verified', cell: (r) => r.verifiedBy },
];

const filters: Filter[] = ['ALL', 'PASS', 'FAIL', 'HOLD', 'PENDING'];

export default function MetalDetectorTestRecords() {
  const navigate = useNavigate();
  const { data: tests = [], isLoading } = useMetalTests();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tests.filter((t) => {
      if (filter === 'PASS' && t.result !== 'PASS') return false;
      if (filter === 'FAIL' && t.result !== 'FAIL') return false;
      if (filter === 'HOLD' && !t.holdId) return false;
      if (filter === 'PENDING' && t.status !== 'PENDING_VERIFICATION') return false;
      if (!q) return true;
      return [t.ref, t.datetime, t.product, t.lot, t.deviceId, t.inspector, t.line]
        .join(' ').toLowerCase().includes(q);
    });
  }, [tests, query, filter]);

  return (
    <AppLayout title="MD Test Records" showBack>
      <div className="flex justify-between items-center mb-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${filtered.length}/${tests.length} records`}
        </p>
        <div className="flex gap-2">
          <ExportButton filename="ccp-metal-detector" columns={columns} rows={filtered} disabled={isLoading} />
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={filtered.length === 0}>
            <Printer className="w-4 h-4 mr-1" /> พิมพ์
          </Button>
          <Button size="sm" onClick={() => navigate('/ccp/metal-detector/new-test')}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="mb-3 space-y-2 print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="ค้นหา: วันที่ / สินค้า / lot / device / ผู้ตรวจ"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filter === f ? 'bg-primary text-primary-foreground border-transparent' : 'border-border text-muted-foreground'
              }`}
            >
              {f === 'PENDING' ? 'Pending Verify' : f}
            </button>
          ))}
        </div>
      </div>

      <PrintReport title="CCP Metal Detector — Test Records" formCode="FM-QA-CCP-MD" columns={columns} rows={filtered} />

      {isLoading && (
        <div className="space-y-2 print:hidden">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-10 print:hidden">ไม่พบรายการ</p>
      )}

      <div className="space-y-2 print:hidden">
        {filtered.map((t) => {
          const fail = t.result === 'FAIL';
          const open = openId === t.id;
          return (
            <Card key={t.id} className={fail ? 'border-[hsl(var(--status-fail))]/50' : ''}>
              <CardContent className="p-4">
                <button className="w-full text-left" onClick={() => setOpenId(open ? null : t.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">{t.ref}</span>
                        {t.status === 'PENDING_VERIFICATION' && (
                          <Badge variant="secondary" className="text-[10px]">Pending Verify</Badge>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{t.product || '—'} · <span className="font-mono">{t.lot || 'no lot'}</span></p>
                      <p className="text-xs text-muted-foreground">{t.datetime} · {t.line || t.deviceId} · {t.frequencyType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={fail ? 'fail' : 'pass'} pulse={fail}>{t.result}</StatusIndicator>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-4 gap-1.5 mt-2 text-center text-[11px]">
                  {[
                    { l: 'Fe', v: t.fe }, { l: 'Non-Fe', v: t.nonFe },
                    { l: 'SUS', v: t.sus }, { l: 'Reject', v: t.rejectMechanism },
                  ].map((p) => (
                    <div key={p.l} className={`rounded p-1 ${p.v === 'FAIL' || p.v === 'NG' ? 'bg-[hsl(var(--status-fail)/0.15)] text-[hsl(var(--status-fail))]' : 'bg-muted'}`}>
                      <span className="block text-muted-foreground">{p.l}</span>
                      <span className="font-bold font-mono">{p.v}</span>
                    </div>
                  ))}
                </div>

                {open && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1.5">
                    <Row label="Inspector" value={t.inspector} />
                    <Row label="Device" value={t.deviceId} />
                    {t.productionStopped && <Row label="Production" value="STOPPED" tone="fail" />}
                    {(t.affectedFrom || t.affectedTo) && <Row label="Affected range" value={`${t.affectedFrom || '?'} – ${t.affectedTo || '?'}`} />}
                    {t.qtyHeld != null && <Row label="Qty held" value={`${t.qtyHeld} ${t.qtyUnit}`} />}
                    {t.correctiveAction && <Row label="Corrective" value={t.correctiveAction} />}
                    {t.finalDisposition && <Row label="Disposition" value={t.finalDisposition} />}
                    {t.deviationId && <Row label="Deviation" value={t.deviationId} tone="fail" />}
                    {t.holdId && <Row label="Hold" value={t.holdId} tone="warning" />}
                    {t.capaId && <Row label="CAPA" value={t.capaId} />}
                    {t.verifiedBy ? <Row label="Verified by" value={`${t.verifiedBy} · ${t.verifiedAt}`} tone="pass" /> : t.result === 'FAIL' && <Row label="Verification" value="PENDING QA" tone="warning" />}
                    {t.remark && <Row label="Remark" value={t.remark} />}
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

function Row({ label, value, tone }: { label: string; value: string; tone?: 'fail' | 'warning' | 'pass' }) {
  const c = tone === 'fail' ? 'text-[hsl(var(--status-fail))]' : tone === 'warning' ? 'text-[hsl(var(--status-warning))]' : tone === 'pass' ? 'text-[hsl(var(--status-pass))]' : '';
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`text-right font-medium ${c}`}>{value}</span>
    </div>
  );
}
