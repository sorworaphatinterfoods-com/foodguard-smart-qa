import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useComplaints } from '@/hooks/useComplaints';

const statusColors: Record<string, string> = {
  Open: 'bg-status-fail',
  Investigating: 'bg-status-warning',
  Resolved: 'bg-status-pass',
  Closed: 'bg-muted text-muted-foreground',
};

export default function ComplaintList() {
  const navigate = useNavigate();
  const { data: complaints = [], isLoading } = useComplaints();

  return (
    <AppLayout title="Complaints" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading…' : `${complaints.length} complaints`}
        </p>
        <Button size="sm" onClick={() => navigate('/complaints/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Complaint
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      )}

      <div className="space-y-2">
        {complaints.map((c) => (
          <Card key={c.id} className={c.status === 'Closed' ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="font-semibold text-sm">{c.productName}</p>
                  <p className="text-xs text-muted-foreground">Lot: <span className="font-mono">{c.lot}</span></p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{c.issue}</p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{c.date}</span>
                {c.actionTaken && (
                  <span className="text-[hsl(var(--status-pass))]">Action: {c.actionTaken}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
