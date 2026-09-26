import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCcpDeviations } from '@/hooks/useCcpModule';

export default function DeviationList() {
  const { data: deviations = [], isLoading } = useCcpDeviations();
  return (
    <AppLayout title="Deviations & CAPA" showBack>
      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">⚠ Open Deviations ({isLoading ? '…' : deviations.length})</h2>
        <div className="space-y-2">
          {deviations.map((dev) => (
            <Card key={dev.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div><div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs text-muted-foreground">{dev.id}</span><Badge variant="destructive">{dev.status}</Badge></div><p className="font-semibold text-sm">{dev.process} — {dev.parameter}</p><p className="text-xs text-muted-foreground">{dev.equipment} · {dev.timestamp}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs"><div><span className="text-muted-foreground">Value: </span><span className="font-mono font-bold text-[hsl(var(--status-fail))]">{dev.value}</span></div><div><span className="text-muted-foreground">Spec: </span><span className="font-mono">{dev.spec}</span></div></div>
                {dev.rootCause && <p className="text-xs bg-muted p-2 rounded mt-2"><span className="text-muted-foreground">Root Cause:</span> {dev.rootCause}</p>}
                <p className="text-xs mt-1"><span className="text-muted-foreground">Action:</span> {dev.correctiveAction} · <span className="text-muted-foreground">By:</span> {dev.responsible}</p>
              </CardContent>
            </Card>
          ))}
          {!isLoading && deviations.length === 0 && <p className="text-sm text-muted-foreground">ไม่พบข้อมูลจาก D1</p>}
        </div>
      </section>
      <section className="mt-6"><h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">✅ Corrective Actions (CAPA)</h2><p className="text-sm text-muted-foreground">ข้อมูล CAPA จะแสดงเมื่อมี endpoint จาก D1</p></section>
    </AppLayout>
  );
}
