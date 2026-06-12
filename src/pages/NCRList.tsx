import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useNcrs } from '@/hooks/useNcrs';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const severityVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  minor: 'secondary',
  major: 'default',
  critical: 'destructive',
};

const statusLabel: Record<string, string> = {
  open: 'Open',
  investigating: 'Investigating',
  corrective_action: 'Corrective Action',
  closed: 'Closed',
};

export default function NCRList() {
  const navigate = useNavigate();
  const { data: ncrs = [], isLoading } = useNcrs();

  return (
    <AppLayout title="NCR / CAPA" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${ncrs.length} records`}
        </p>
        <Button size="sm" onClick={() => navigate('/ncr/new')}>
          <Plus className="w-4 h-4 mr-1" /> New NCR
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {ncrs.map((ncr) => (
          <Card key={ncr.id} className={ncr.status === 'closed' ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{ncr.id}</span>
                    <Badge variant={severityVariant[ncr.severity]}>
                      {ncr.severity}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm">{ncr.title}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{ncr.description}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {ncr.category} · {ncr.assignedTo}
                </span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-[10px] ${
                  ncr.status === 'closed' ? 'bg-status-pass' :
                  ncr.status === 'investigating' ? 'bg-status-warning' :
                  'bg-status-fail'
                }`}>
                  {statusLabel[ncr.status]}
                </span>
              </div>
              {ncr.rootCause && (
                <p className="text-xs mt-2 bg-muted p-2 rounded">
                  <span className="text-muted-foreground">Root Cause:</span> {ncr.rootCause}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
