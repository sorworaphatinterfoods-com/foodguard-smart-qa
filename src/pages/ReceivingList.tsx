import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { mockReceiving } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { InspectionResult } from '@/lib/types';

const resultStatus: Record<InspectionResult, 'pass' | 'warning' | 'fail'> = {
  pass: 'pass',
  hold: 'warning',
  reject: 'fail',
};

export default function ReceivingList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Raw Material Receiving" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockReceiving.length} records</p>
        <Button size="sm" onClick={() => navigate('/receiving/new')}>
          <Plus className="w-4 h-4 mr-1" /> New
        </Button>
      </div>

      <div className="space-y-2">
        {mockReceiving.map((rec) => (
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
