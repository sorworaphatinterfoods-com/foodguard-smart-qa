import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockEnvironmental } from '@/lib/mock-data';

const typeLabels: Record<string, string> = {
  temperature: '🌡 Temperature',
  humidity: '💧 Humidity',
  sanitation: '🧹 Sanitation',
  pest_control: '🪲 Pest Control',
};

export default function EnvironmentList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Environmental / GMP" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockEnvironmental.length} records</p>
        <Button size="sm" onClick={() => navigate('/environment/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Check
        </Button>
      </div>

      <div className="space-y-2">
        {mockEnvironmental.map((rec) => (
          <Card key={rec.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{typeLabels[rec.type]}</p>
                  <p className="text-xs text-muted-foreground">{rec.zone} · {rec.date} {rec.time}</p>
                </div>
                <StatusIndicator status={rec.result === 'pass' ? 'pass' : 'fail'} pulse={rec.result === 'fail'}>
                  {rec.result.toUpperCase()}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {rec.value !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-mono">{rec.value}{rec.unit}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Inspector: </span>
                  <span>{rec.inspector}</span>
                </div>
              </div>
              {rec.notes && (
                <p className="text-xs text-muted-foreground mt-2">{rec.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
