import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockDeviations, mockCAPALogs } from '@/lib/mock-data';

export default function DeviationList() {
  return (
    <AppLayout title="Deviations & CAPA" showBack>
      {/* Deviations */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          ⚠ Open Deviations ({mockDeviations.filter(d => d.status === 'OPEN').length})
        </h2>
        <div className="space-y-2">
          {mockDeviations.map((dev) => (
            <Card key={dev.id} className={dev.status === 'OPEN' ? 'border-destructive/50' : 'opacity-60'}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{dev.id}</span>
                      <Badge variant={dev.status === 'OPEN' ? 'destructive' : 'secondary'}>{dev.status}</Badge>
                    </div>
                    <p className="font-semibold text-sm">{dev.process} — {dev.parameter}</p>
                    <p className="text-xs text-muted-foreground">{dev.equipment} · {dev.timestamp}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-mono font-bold text-[hsl(var(--status-fail))]">{dev.value}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Spec: </span>
                    <span className="font-mono">{dev.spec}</span>
                  </div>
                </div>
                {dev.rootCause && (
                  <p className="text-xs bg-muted p-2 rounded mb-1">
                    <span className="text-muted-foreground">Root Cause:</span> {dev.rootCause}
                  </p>
                )}
                <p className="text-xs">
                  <span className="text-muted-foreground">Action:</span> {dev.correctiveAction} · <span className="text-muted-foreground">By:</span> {dev.responsible}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CAPA Logs */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          ✅ Corrective Actions (CAPA)
        </h2>
        <div className="space-y-2">
          {mockCAPALogs.map((capa) => (
            <Card key={capa.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">{capa.id}</span>
                      <span className="font-mono text-xs text-muted-foreground">→ {capa.deviationId}</span>
                      <Badge variant={capa.status === 'Closed' ? 'secondary' : 'destructive'}>{capa.status}</Badge>
                    </div>
                    <p className="text-sm">{capa.actionTaken}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Done by: {capa.doneBy} · Completed: {capa.completionDate}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
