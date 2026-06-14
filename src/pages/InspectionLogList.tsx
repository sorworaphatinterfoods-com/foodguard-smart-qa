import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Skeleton } from '@/components/ui/skeleton';
import { useInspections } from '@/hooks/useInspections';
import { Button } from '@/components/ui/button';
import { Plus, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PrintReport, PrintColumn } from '@/components/PrintReport';
import { ExportButton } from '@/components/ExportButton';
import type { InspectionLog } from '@/lib/types';

const inspectionColumns: PrintColumn<InspectionLog>[] = [
  { header: 'ID', cell: (r) => r.id },
  { header: 'Timestamp', cell: (r) => r.timestamp },
  { header: 'Process', cell: (r) => r.process },
  { header: 'Parameter', cell: (r) => r.parameter },
  { header: 'Value', cell: (r) => r.value },
  { header: 'Spec', cell: (r) => r.spec },
  { header: 'Result', cell: (r) => r.status },
  { header: 'Inspector', cell: (r) => r.inspector },
];

export default function InspectionLogList() {
  const navigate = useNavigate();
  const { data: logs = [], isLoading } = useInspections();

  return (
    <AppLayout title="Inspection Log" showBack>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${logs.length} records`}
        </p>
        <div className="flex flex-wrap gap-2 justify-end">
          <ExportButton filename="inspection-log" columns={inspectionColumns} rows={logs} disabled={isLoading} />
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={isLoading || logs.length === 0}>
            <Printer className="w-4 h-4 mr-1" /> พิมพ์ A4
          </Button>
          <Button size="sm" onClick={() => navigate('/inspection/new')}>
            <Plus className="w-4 h-4 mr-1" /> New Entry
          </Button>
        </div>
      </div>

      <PrintReport title="Inspection Log Report" formCode="FM-QA-INS" columns={inspectionColumns} rows={logs} />

      {isLoading && (
        <div className="space-y-2 print:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      <div className="space-y-2 print:hidden">
        {logs.map((log) => (
          <Card key={log.id} className={log.status === 'FAIL' ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{log.process} — {log.parameter}</p>
                  <p className="text-xs text-muted-foreground">{log.equipment} · {log.timestamp}</p>
                </div>
                <StatusIndicator status={log.status === 'PASS' ? 'pass' : 'fail'} pulse={log.status === 'FAIL'}>
                  {log.status}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Value: </span>
                  <span className={`font-mono font-bold ${log.status === 'FAIL' ? 'text-[hsl(var(--status-fail))]' : 'text-[hsl(var(--status-pass))]'}`}>
                    {log.value}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Spec: </span>
                  <span className="font-mono">{log.spec}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lot: </span>
                  <span className="font-mono">{log.lot}</span>
                </div>
              </div>
              {log.action && (
                <p className="text-xs text-[hsl(var(--status-warning))] mt-2">Action: {log.action}</p>
              )}
              {log.remark && (
                <p className="text-xs text-muted-foreground mt-1">{log.remark}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
