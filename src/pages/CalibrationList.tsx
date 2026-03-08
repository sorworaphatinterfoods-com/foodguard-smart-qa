import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/StatusIndicator';
import { mockCalibration } from '@/lib/mock-data';

const statusMap: Record<string, 'pass' | 'warning' | 'fail'> = {
  current: 'pass',
  due_soon: 'warning',
  overdue: 'fail',
};

export default function CalibrationList() {
  return (
    <AppLayout title="Calibration" showBack>
      <p className="text-sm text-muted-foreground mb-4">{mockCalibration.length} instruments</p>
      <div className="space-y-2">
        {mockCalibration.map((cal) => (
          <Card key={cal.id} className={cal.status === 'overdue' ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{cal.instrumentName}</p>
                  <p className="text-xs text-muted-foreground">{cal.instrumentId} · {cal.location}</p>
                </div>
                <StatusIndicator status={statusMap[cal.status]} pulse={cal.status === 'overdue'}>
                  {cal.status.replace('_', ' ').toUpperCase()}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Last Cal: </span>
                  <span className="font-mono">{cal.lastCalibration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Due: </span>
                  <span className={`font-mono ${cal.status === 'overdue' ? 'text-status-fail font-bold' : ''}`}>
                    {cal.nextDue}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
