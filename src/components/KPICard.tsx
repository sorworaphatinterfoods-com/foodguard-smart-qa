import { Card, CardContent } from '@/components/ui/card';
import { DashboardKPI } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  kpi: DashboardKPI;
}

export function KPICard({ kpi }: KPICardProps) {
  const statusColor = {
    pass: 'text-status-pass border-status-pass/20',
    warning: 'text-status-warning border-status-warning/20',
    fail: 'text-status-fail border-status-fail/20',
  };

  const trendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  const TrendIcon = kpi.trend ? trendIcon[kpi.trend] : null;
  const colorClass = kpi.status ? statusColor[kpi.status] : '';

  return (
    <Card className={`border ${kpi.status ? statusColor[kpi.status].split(' ')[1] : ''}`}>
      <CardContent className="p-3">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">{kpi.label}</p>
        <div className="flex items-end justify-between">
          <span className={`text-xl font-bold font-mono ${kpi.status ? statusColor[kpi.status].split(' ')[0] : ''}`}>
            {kpi.value}
          </span>
          {TrendIcon && (
            <TrendIcon className={`w-4 h-4 ${kpi.status ? statusColor[kpi.status].split(' ')[0] : 'text-muted-foreground'}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
