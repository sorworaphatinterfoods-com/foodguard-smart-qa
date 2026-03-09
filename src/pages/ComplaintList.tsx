import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockComplaints } from '@/lib/mock-data';

const severityVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
};

const statusColors: Record<string, string> = {
  received: 'bg-status-warning',
  investigating: 'bg-[hsl(var(--status-info)/0.15)] text-[hsl(var(--status-info))]',
  resolved: 'bg-status-pass',
  closed: 'bg-muted text-muted-foreground',
};

export default function ComplaintList() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Complaints" showBack>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{mockComplaints.length} complaints</p>
        <Button size="sm" onClick={() => navigate('/complaints/new')}>
          <Plus className="w-4 h-4 mr-1" /> New Complaint
        </Button>
      </div>

      <div className="space-y-2">
        {mockComplaints.map((c) => (
          <Card key={c.id} className={c.status === 'closed' ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                    <Badge variant={severityVariant[c.severity]}>{c.severity}</Badge>
                  </div>
                  <p className="font-semibold text-sm">{c.customerName}</p>
                  <p className="text-xs text-muted-foreground">{c.productName} · Lot: {c.lotNumber}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>
                  {c.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{c.description}</p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{c.category} · {c.date}</span>
                {c.linkedNCR && (
                  <span className="font-mono text-[hsl(var(--status-info))]">→ {c.linkedNCR}</span>
                )}
              </div>
              {c.resolution && (
                <p className="text-xs mt-2 bg-muted p-2 rounded">
                  <span className="text-muted-foreground">Resolution:</span> {c.resolution}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
