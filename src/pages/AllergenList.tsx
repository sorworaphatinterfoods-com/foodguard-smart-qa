import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockAllergenLogs, mockAllergens } from '@/lib/mock-data';

export default function AllergenList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Allergen Control" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockAllergenLogs.length} logs</p>
        <Button size="sm" onClick={() => navigate('/allergen/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Log
        </Button>
      </div>

      {/* Allergen Master Reference */}
      <Card className="mb-4">
        <CardContent className="p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">Managed Allergens (FDA)</p>
          <div className="flex flex-wrap gap-1.5">
            {mockAllergens.map((a) => (
              <span key={a.allergen} className="text-xs bg-muted px-2 py-1 rounded font-medium">
                {a.allergen}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {mockAllergenLogs.map((log) => (
          <Card key={log.id} className={log.result === 'FAIL' ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{log.product} — <span className="text-[hsl(var(--status-warning))]">{log.allergen}</span></p>
                  <p className="text-xs text-muted-foreground">{log.area} · {log.timestamp}</p>
                </div>
                <StatusIndicator status={log.result === 'PASS' ? 'pass' : 'fail'} pulse={log.result === 'FAIL'}>
                  {log.result}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Control: </span>
                  <span>{log.controlMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Verification: </span>
                  <span>{log.verification}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
