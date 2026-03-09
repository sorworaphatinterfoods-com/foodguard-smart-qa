import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockWaterTests, mockWaterParams } from '@/lib/mock-data';

export default function WaterQualityList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Water Quality" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockWaterTests.length} test records</p>
        <Button size="sm" onClick={() => navigate('/water/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Test
        </Button>
      </div>

      {/* Parameter Specs */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Spec Reference (WHO)</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {mockWaterParams.map((p) => (
              <div key={p.parameter} className="bg-muted p-2 rounded">
                <span className="font-medium">{p.parameter}</span>
                <span className="text-muted-foreground ml-1 font-mono">{p.specMin}–{p.specMax} {p.unit}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {mockWaterTests.map((test) => (
          <Card key={test.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">{test.parameter}</p>
                  <p className="text-xs text-muted-foreground">{test.location} · {test.timestamp}</p>
                </div>
                <StatusIndicator status={test.status === 'PASS' ? 'pass' : 'fail'}>
                  {test.status}
                </StatusIndicator>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Value: </span>
                  <span className="font-mono font-bold">{test.value}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Spec: </span>
                  <span className="font-mono">{test.spec}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
