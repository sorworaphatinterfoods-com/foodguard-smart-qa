import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockMetalDetectorLogs } from '@/lib/mock-data';

export default function MetalDetectorList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Metal Detector" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockMetalDetectorLogs.length} test records</p>
        <Button size="sm" onClick={() => navigate('/metal-detector/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Test
        </Button>
      </div>

      <div className="space-y-2">
        {mockMetalDetectorLogs.map((log) => (
          <Card key={log.id} className={log.result === 'FAIL' ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{log.line}</p>
                  <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                </div>
                <StatusIndicator status={log.result === 'PASS' ? 'pass' : 'fail'} pulse={log.result === 'FAIL'}>
                  {log.result}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted p-2 rounded text-center">
                  <span className="text-muted-foreground block">Fe</span>
                  <span className="font-mono font-bold">{log.feMm} mm</span>
                </div>
                <div className="bg-muted p-2 rounded text-center">
                  <span className="text-muted-foreground block">Non-Fe</span>
                  <span className="font-mono font-bold">{log.nonFeMm} mm</span>
                </div>
                <div className={`p-2 rounded text-center ${log.result === 'FAIL' ? 'bg-[hsl(var(--status-fail)/0.15)]' : 'bg-muted'}`}>
                  <span className="text-muted-foreground block">SUS</span>
                  <span className={`font-mono font-bold ${log.result === 'FAIL' ? 'text-[hsl(var(--status-fail))]' : ''}`}>{log.susMm} mm</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Inspector: {log.inspector}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
