import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { KPICard } from '@/components/KPICard';
import { mockKPIs } from '@/lib/mock-data';
import {
  ClipboardList, Thermometer, AlertTriangle, Leaf,
  Wrench, CheckSquare, MessageSquare, GitBranch,
} from 'lucide-react';

const modules = [
  { title: 'Raw Material Receiving', description: 'Inspect incoming materials', icon: ClipboardList, path: '/receiving', badge: 3, badgeStatus: 'warning' as const },
  { title: 'CCP Monitoring', description: 'Critical control points', icon: Thermometer, path: '/ccp', badge: 1, badgeStatus: 'fail' as const },
  { title: 'NCR / CAPA', description: 'Nonconformance & actions', icon: AlertTriangle, path: '/ncr', badge: 2, badgeStatus: 'warning' as const },
  { title: 'Environmental / GMP', description: 'Temp, humidity, sanitation', icon: Leaf, path: '/environment' },
  { title: 'Calibration', description: 'Instrument tracking', icon: Wrench, path: '/calibration', badge: 1, badgeStatus: 'fail' as const },
  { title: 'Internal Audit', description: 'GMP/HACCP checklists', icon: CheckSquare, path: '/audit' },
  { title: 'Complaints', description: 'Customer complaint tracking', icon: MessageSquare, path: '/complaints' },
  { title: 'Traceability', description: 'Forward & backward trace', icon: GitBranch, path: '/traceability' },
];

export default function Dashboard() {
  return (
    <AppLayout>
      {/* KPI Grid */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Key Performance Indicators</h2>
        <div className="grid grid-cols-2 gap-2">
          {mockKPIs.map((kpi) => (
            <KPICard key={kpi.label} kpi={kpi} />
          ))}
        </div>
      </section>

      {/* Module Grid */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Modules</h2>
        <div className="grid grid-cols-1 gap-2">
          {modules.map((mod) => (
            <ModuleCard key={mod.path} {...mod} />
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
