import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/StatusIndicator';
import { mockInspectionLogs } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InspectionLogList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Inspection Log" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockInspectionLogs.length} records</p>
        <Button size="sm" onClick={() => navigate('/inspection/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Entry
        </Button>
      </div>

      <div className="space-y-2">
        {mockInspectionLogs.map((log) => (
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
