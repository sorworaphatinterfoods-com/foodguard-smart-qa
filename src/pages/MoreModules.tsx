import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { Leaf, Wrench, CheckSquare, MessageSquare, GitBranch } from 'lucide-react';

const modules = [
  { title: 'Environmental / GMP', description: 'Temperature, humidity, sanitation, pest logs', icon: Leaf, path: '/environment' },
  { title: 'Calibration', description: 'Instrument tracking & due dates', icon: Wrench, path: '/calibration' },
  { title: 'Internal Audit', description: 'GMP/HACCP checklists & scoring', icon: CheckSquare, path: '/audit' },
  { title: 'Complaints', description: 'Customer complaint tracking', icon: MessageSquare, path: '/complaints' },
  { title: 'Traceability', description: 'Forward & backward lot tracing', icon: GitBranch, path: '/traceability' },
];

export default function MoreModules() {
  return (
    <AppLayout title="All Modules">
      <div className="grid grid-cols-1 gap-2">
        {modules.map((mod) => (
          <ModuleCard key={mod.path} {...mod} />
        ))}
      </div>
    </AppLayout>
  );
}
