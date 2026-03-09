import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockAudits } from '@/lib/mock-data';

const statusColors: Record<string, string> = {
  scheduled: 'bg-status-warning',
  in_progress: 'bg-[hsl(var(--status-info)/0.15)] text-[hsl(var(--status-info))]',
  completed: 'bg-status-pass',
};

export default function AuditList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Internal Audit" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockAudits.length} audits</p>
        <Button size="sm" onClick={() => navigate('/audit/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Audit
        </Button>
      </div>

      <div className="space-y-2">
        {mockAudits.map((audit) => (
          <Card key={audit.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{audit.id}</span>
                    <Badge variant="secondary">{audit.auditType}</Badge>
                  </div>
                  <p className="font-semibold text-sm">{audit.area}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[audit.status]}`}>
                  {audit.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              {audit.status !== 'scheduled' && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Score</span>
                    <span className={`font-mono font-semibold ${
                      audit.score >= 85 ? 'text-[hsl(var(--status-pass))]' :
                      audit.score >= 70 ? 'text-[hsl(var(--status-warning))]' :
                      'text-[hsl(var(--status-fail))]'
                    }`}>{audit.score}%</span>
                  </div>
                  <Progress value={audit.score} className="h-1.5" />
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Date: </span>
                  <span className="font-mono">{audit.date}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auditor: </span>
                  <span>{audit.auditor}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Items: </span>
                  <span className="font-mono">{audit.passedItems}/{audit.totalItems}</span>
                </div>
              </div>
              {audit.findings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {audit.findings.filter(f => f.result !== 'conforming').map((f) => (
                    <p key={f.id} className="text-xs bg-muted p-2 rounded">
                      <span className={`font-medium ${
                        f.result === 'major_nc' ? 'text-[hsl(var(--status-fail))]' :
                        f.result === 'minor_nc' ? 'text-[hsl(var(--status-warning))]' :
                        'text-muted-foreground'
                      }`}>
                        {f.result === 'major_nc' ? 'Major NC' : f.result === 'minor_nc' ? 'Minor NC' : 'Obs'}:
                      </span>{' '}
                      {f.checkItem} — {f.notes}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
