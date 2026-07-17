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
import { useThermalLogs } from '@/hooks/useCcpModule';
import type { ThermalLog } from '@/lib/ccp-types';
import { Plus, Printer, Search, Flame, Snowflake, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Filter = 'ALL' | 'COOKING' | 'FREEZING' | 'FAIL' | 'PENDING';

const columns: PrintColumn<ThermalLog>[] = [
  { header: 'Ref', cell: (r) => r.ref },
  { header: 'Date/Time', cell: (r) => r.datetime },
  { header: 'Stage', cell: (r) => r.stage },
  { header: 'Line', cell: (r) => r.line },
  { header: 'Product', cell: (r) => r.product },
  { header: 'Lot', cell: (r) => r.lot },
  { header: 'Equipment', cell: (r) => r.equipmentId },
  { header: 'Core °C', cell: (r) => (r.coreTemp ?? '') },
  { header: 'Limit', cell: (r) => (r.limitValue != null ? `${r.limitDirection === 'MIN' ? '≥' : '≤'} ${r.limitValue}` : '') },
  { header: 'Hold min', cell: (r) => (r.holdMinutes ?? '') },
  { header: 'Result', cell: (r) => r.result },
  { header: 'Inspector', cell: (r) => r.inspector },
  { header: 'Verified', cell: (r) => r.verifiedBy },
];

const filters: Filter[] = ['ALL', 'COOKING', 'FREEZING', 'FAIL', 'PENDING'];

export default function ThermalRecords() {
  const navigate = useNavigate();
  const { data: logs = [], isLoading } = useThermalLogs();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((t) => {
      if (filter === 'COOKING' && t.stage !== 'COOKING') return false;
      if (filter === 'FREEZING' && t.stage !== 'FREEZING') return false;
      if (filter === 'FAIL' && t.result !== 'FAIL') return false;
      if (filter === 'PENDING' && t.status !== 'PENDING_VERIFICATION') return false;
      if (!q) return true;
      return [t.ref, t.datetime, t.product, t.lot, t.equipmentId, t.inspector, t.line]
        .join(' ').toLowerCase().includes(q);
    });
  }, [logs, query, filter]);

  return (
    <AppLayout title="Thermal CCP Records" showBack>
      <div className="flex justify-between items-center mb-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${filtered.length}/${logs.length} records`}
        </p>
        <div className="flex gap-2">
          <ExportButton filename="ccp-thermal" columns={columns} rows={filtered} disabled={isLoading} />
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={filtered.length === 0}>
            <Printer className="w-4 h-4 mr-1" /> พิมพ์
          </Button>
          <Button size="sm" onClick={() => navigate('/ccp/thermal/new')}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
      </div>

      <div className="mb-3 space-y-2 print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="ค้นหา: วันที่ / สินค้า / lot / อุปกรณ์ / ผู้ตรวจ"
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-transparent' : 'border-border text-muted-foreground'}`}>
              {f === 'PENDING' ? 'Pending Verify' : f}
            </button>
          ))}
        </div>
      </div>

      <PrintReport title="CCP Thermal (Cooking/Freezing) — Records" formCode="FM-QA-CCP-TH" columns={columns} rows={filtered} />

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
          const StageIcon = t.stage === 'COOKING' ? Flame : Snowflake;
          return (
            <Card key={t.id} className={fail ? 'border-[hsl(var(--status-fail))]/50' : ''}>
              <CardContent className="p-4">
                <button className="w-full text-left" onClick={() => setOpenId(open ? null : t.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StageIcon className={`w-3.5 h-3.5 ${t.stage === 'COOKING' ? 'text-[hsl(var(--status-warning))]' : 'text-[hsl(var(--status-info))]'}`} />
                        <span className="font-mono text-xs text-muted-foreground">{t.ref}</span>
                        {t.status === 'PENDING_VERIFICATION' && <Badge variant="secondary" className="text-[10px]">Pending Verify</Badge>}
                      </div>
                      <p className="font-semibold text-sm">{t.product || '—'} · <span className="font-mono">{t.lot || 'no lot'}</span></p>
                      <p className="text-xs text-muted-foreground">{t.datetime} · {t.equipmentId} · {t.frequencyType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`font-mono font-bold text-lg ${fail ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}`}>{t.coreTemp}°C</p>
                        <StatusIndicator status={fail ? 'fail' : 'pass'} pulse={fail}>{t.result}</StatusIndicator>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1.5">
                    <Row label="Limit" value={t.limitValue != null ? `${t.limitDirection === 'MIN' ? '≥' : '≤'} ${t.limitValue}°C` : '—'} />
                    {t.holdMinutes != null && <Row label="Hold time" value={`${t.holdMinutes} min`} />}
                    <Row label="Inspector" value={t.inspector} />
                    {t.batch && <Row label="Batch" value={t.batch} />}
                    {t.productionStopped && <Row label="Production" value="STOPPED" tone="fail" />}
                    {(t.affectedFrom || t.affectedTo) && <Row label="Affected range" value={`${t.affectedFrom || '?'} – ${t.affectedTo || '?'}`} />}
                    {t.qtyHeld != null && <Row label="Qty held" value={`${t.qtyHeld} ${t.qtyUnit}`} />}
                    {t.correctiveAction && <Row label="Corrective" value={t.correctiveAction} />}
                    {t.finalDisposition && <Row label="Disposition" value={t.finalDisposition} />}
                    {t.deviationId && <Row label="Deviation" value={t.deviationId} tone="fail" />}
                    {t.holdId && <Row label="Hold" value={t.holdId} tone="warning" />}
                    {t.capaId && <Row label="CAPA" value={t.capaId} />}
                    {t.verifiedBy ? <Row label="Verified by" value={`${t.verifiedBy} · ${t.verifiedAt}`} tone="pass" /> : fail && <Row label="Verification" value="PENDING QA" tone="warning" />}
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
