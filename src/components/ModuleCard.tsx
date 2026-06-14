import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  badge?: string | number;
  badgeStatus?: 'pass' | 'warning' | 'fail';
}

export function ModuleCard({ title, description, icon: Icon, path, badge, badgeStatus }: ModuleCardProps) {
  const navigate = useNavigate();

  const badgeBg = {
    pass: 'bg-[hsl(var(--status-pass))]',
    warning: 'bg-[hsl(var(--status-warning))]',
    fail: 'bg-[hsl(var(--status-fail))]',
  };

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98]"
      onClick={() => navigate(path)}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-sm">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeBg[badgeStatus || 'pass']} text-white shadow-sm`}>
            {badge}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
