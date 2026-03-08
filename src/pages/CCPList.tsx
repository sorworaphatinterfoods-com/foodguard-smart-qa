import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { mockCCPRecords } from '@/lib/mock-data';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CCPList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="CCP Monitoring" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockCCPRecords.length} records</p>
        <Button size="sm" onClick={() => navigate('/ccp/new')}>
          <Plus className="w-4 h-4 mr-1" /> Log CCP
        </Button>
      </div>

      <div className="space-y-2">
        {mockCCPRecords.map((rec) => (
          <Card key={rec.id} className={rec.status === 'exceeded' ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{rec.machineName}</p>
                  <p className="text-xs text-muted-foreground">{rec.ccpType}</p>
                </div>
                <StatusIndicator
                  status={rec.status === 'within' ? 'pass' : 'fail'}
                  pulse={rec.status === 'exceeded'}
                >
                  {rec.status === 'within' ? 'OK' : 'EXCEEDED'}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Value: </span>
                  <span className={`font-mono font-bold ${rec.status === 'exceeded' ? 'text-status-fail' : 'text-status-pass'}`}>
                    {rec.value}{rec.unit}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Limits: </span>
                  <span className="font-mono">{rec.lowerLimit}–{rec.upperLimit}{rec.unit}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Batch: </span>
                  <span className="font-mono">{rec.batchId}</span>
                </div>
              </div>
              {rec.correctionTaken && (
                <p className="text-xs text-status-warning mt-2 bg-status-warning/10 p-2 rounded">
                  Correction: {rec.correctionTaken}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
