import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockAuditLogs } from '@/lib/mock-data';

export default function AuditList() {
  const navigate = useNavigate();

  const passCount = mockAuditLogs.filter(a => a.result === 'PASS').length;
  const totalCount = mockAuditLogs.length;
  const score = Math.round((passCount / totalCount) * 100);

  return (
    <AppLayout title="Internal Audit" showBack>
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-sm text-muted-foreground">{totalCount} items checked</p>
          <p className="text-xs text-muted-foreground">Score: <span className={`font-mono font-bold ${score >= 85 ? 'text-[hsl(var(--status-pass))]' : score >= 70 ? 'text-[hsl(var(--status-warning))]' : 'text-[hsl(var(--status-fail))]'}`}>{score}%</span></p>
        </div>
        <Button size="sm" onClick={() => navigate('/audit/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Audit
        </Button>
      </div>

      <div className="space-y-2">
        {mockAuditLogs.map((audit) => (
          <Card key={audit.id} className={audit.result === 'FAIL' ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{audit.id}</span>
                    <Badge variant={audit.result === 'PASS' ? 'secondary' : 'destructive'}>
                      {audit.result}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm">{audit.checklistItem}</p>
                  <p className="text-xs text-muted-foreground">{audit.area}</p>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{audit.date} · {audit.auditor}</span>
                {audit.remark !== '-' && (
                  <span className="text-[hsl(var(--status-warning))]">{audit.remark}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
