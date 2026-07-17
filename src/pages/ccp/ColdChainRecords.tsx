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
import { useColdChainLogs } from '@/hooks/useCcpModule';
import type { ColdChainLog } from '@/lib/ccp-types';
import { Plus, Printer, Search, Snowflake, Truck, Refrigerator, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Filter = 'ALL' | 'FAIL' | 'PENDING';

const columns: PrintColumn<ColdChainLog>[] = [
  { header: 'Ref', cell: (r) => r.ref },
  { header: 'Date/Time', cell: (r) => r.datetime },
  { header: 'Point', cell: (r) => `${r.pointName} (${r.pointId})` },
  { header: 'Temp °C', cell: (r) => r.temp },
  { header: 'Limit', cell: (r) => `${r.limitMin ?? ''}..${r.limitMax ?? ''}` },
  { header: 'Result', cell: (r) => r.result },
  { header: 'Product', cell: (r) => r.product },
  { header: 'Lot', cell: (r) => r.lot },
  { header: 'Recorded by', cell: (r) => r.recordedBy },
  { header: 'Verified', cell: (r) => r.verifiedBy },
];

const filters: Filter[] = ['ALL', 'FAIL', 'PENDING'];
const pointIcon = (t: string) => (t === 'TRANSPORT' ? Truck : t === 'CHILLER' ? Refrigerator : Snowflake);

export default function ColdChainRecords() {
  const navigate = useNavigate();
  const { data: logs = [], isLoading } = useColdChainLogs();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((t) => {
      if (filter === 'FAIL' && t.result !== 'FAIL') return false;
      if (filter === 'PENDING' && t.status !== 'PENDING_VERIFICATION') return false;
      if (!q) return true;
      return [t.ref, t.datetime, t.pointName, t.pointId, t.product, t.lot, t.recordedBy]
        .join(' ').toLowerCase().includes(q);
    });
  }, [logs, query, filter]);

  return (
    <AppLayout title="Cold Chain Records" showBack>
      <div className="flex justify-between items-center mb-3 print:hidden">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${filtered.length}/${logs.length} records`}
        </p>
        <div className="flex gap-2">
          <ExportButton filename="ccp-coldchain" columns={columns} rows={filtered} disabled={isLoading} />
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={filtered.length === 0}>
            <Printer className="w-4 h-4 mr-1" /> พิมพ์
          </Button>
          <Button size="sm" onClick={() => navigate('/ccp/coldchain/new')}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
      </div>

      <div className="mb-3 space-y-2 print:hidden">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="ค้นหา: วันที่ / จุดตรวจ / สินค้า / lot / ผู้บันทึก"
            value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === f ? 'bg-primary text-primary-foreground border-transparent' : 'border-border text-muted-foreground'}`}>
              {f === 'PENDING' ? 'Pending Verify' : f === 'FAIL' ? 'Excursion' : f}
            </button>
          ))}
        </div>
      </div>

      <PrintReport title="CCP Cold Chain — Records" formCode="FM-QA-CCP-CC" columns={columns} rows={filtered} />

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
          const Icon = pointIcon(t.pointType);
          return (
            <Card key={t.id} className={fail ? 'border-[hsl(var(--status-fail))]/50' : ''}>
              <CardContent className="p-4">
                <button className="w-full text-left" onClick={() => setOpenId(open ? null : t.id)}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${fail ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-info))]'}`} />
                        <span className="font-mono text-xs text-muted-foreground">{t.ref}</span>
                        {t.status === 'PENDING_VERIFICATION' && <Badge variant="secondary" className="text-[10px]">Pending Verify</Badge>}
                      </div>
                      <p className="font-semibold text-sm">{t.pointName} <span className="font-mono text-muted-foreground">({t.pointId})</span></p>
                      <p className="text-xs text-muted-foreground">{t.datetime}{t.shift ? ` · กะ ${t.shift}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className={`font-mono font-bold text-lg ${fail ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}`}>{t.temp}°C</p>
                        <StatusIndicator status={fail ? 'fail' : 'pass'} pulse={fail}>{fail ? 'OUT' : 'IN'}</StatusIndicator>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {open && (
                  <div className="mt-3 pt-3 border-t text-xs space-y-1.5">
                    <Row label="Limit" value={`${t.limitMin ?? '—'} … ${t.limitMax ?? '—'} °C`} />
                    <Row label="Recorded by" value={t.recordedBy} />
                    {t.product && <Row label="Product" value={`${t.product}${t.lot ? ` · ${t.lot}` : ''}`} />}
                    {t.excursionMinutes != null && <Row label="Excursion" value={`${t.excursionMinutes} min`} tone="warning" />}
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
