import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Skeleton } from '@/components/ui/skeleton';
import { useReceiving } from '@/hooks/useReceiving';
import { Plus, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InspectionResult } from '@/lib/types';
import { PrintReport, PrintColumn } from '@/components/PrintReport';
import type { RawMaterialReceiving } from '@/lib/types';

const receivingColumns: PrintColumn<RawMaterialReceiving>[] = [
  { header: 'ID', cell: (r) => r.id },
  { header: 'Date', cell: (r) => r.date },
  { header: 'Supplier', cell: (r) => r.supplierName },
  { header: 'Material', cell: (r) => r.materialName },
  { header: 'Lot', cell: (r) => r.lotNumber },
  { header: 'Qty', cell: (r) => `${r.quantity} ${r.unit}` },
  { header: 'Temp(°C)', cell: (r) => r.temperature },
  { header: 'Result', cell: (r) => r.result.toUpperCase() },
  { header: 'Inspector', cell: (r) => r.inspector },
];

const resultStatus: Record<InspectionResult, 'pass' | 'warning' | 'fail'> = {
  pass: 'pass',
  hold: 'warning',
  reject: 'fail',
};

export default function ReceivingList() {
  const navigate = useNavigate();
  const { data: receiving = [], isLoading } = useReceiving();

  return (
    <AppLayout title="Raw Material Receiving" showBack>
      <div className="flex justify-between items-center mb-4 print:hidden">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${receiving.length} records`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} disabled={isLoading || receiving.length === 0}>
            <Printer className="w-4 h-4 mr-1" /> พิมพ์ A4
          </Button>
          <Button size="sm" onClick={() => navigate('/receiving/new')}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
      </div>

      <PrintReport title="Raw Material Receiving Report" formCode="FM-QA-001" columns={receivingColumns} rows={receiving} />

      {isLoading && (
        <div className="space-y-2 print:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      <div className="space-y-2 print:hidden">
        {receiving.map((rec) => (
          <Card key={rec.id} className="active:scale-[0.99] transition-transform">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{rec.materialName}</p>
                  <p className="text-xs text-muted-foreground">{rec.supplierName}</p>
                </div>
                <StatusIndicator status={resultStatus[rec.result]} pulse={rec.result === 'hold'}>
                  {rec.result.toUpperCase()}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Lot: </span>
                  <span className="font-mono">{rec.lotNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Temp: </span>
                  <span className={`font-mono ${rec.temperature > 4 ? 'text-status-fail font-bold' : ''}`}>
                    {rec.temperature}°C
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Qty: </span>
                  <span className="font-mono">{rec.quantity} {rec.unit}</span>
                </div>
              </div>
              {rec.notes && (
                <p className="text-xs text-status-warning mt-2">{rec.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
