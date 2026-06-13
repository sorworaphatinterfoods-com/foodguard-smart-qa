import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import { KPICard } from '@/components/KPICard';
import { mockDeviations } from '@/lib/mock-data';
import { useDashboard } from '@/hooks/useDashboard';
import {
  ClipboardList, Thermometer, AlertTriangle, Leaf,
  Wrench, CheckSquare, MessageSquare, GitBranch,
  Droplets, ShieldAlert, Search as SearchIcon, FileText,
  Database, BarChart3, Magnet,
} from 'lucide-react';

const modules = [
  { title: 'Inspection Log', description: 'บันทึกการตรวจสอบทุกกระบวนการ', icon: FileText, path: '/inspection', badge: 4, badgeStatus: 'warning' as const },
  { title: 'Raw Material Receiving', description: 'ตรวจรับวัตถุดิบ & COA', icon: ClipboardList, path: '/receiving', badge: 3, badgeStatus: 'warning' as const },
  { title: 'CCP Monitoring', description: 'จุดควบคุมวิกฤต HACCP', icon: Thermometer, path: '/ccp', badge: 1, badgeStatus: 'fail' as const },
  { title: 'Metal Detector', description: 'ทดสอบเครื่องตรวจโลหะ Fe/NonFe/SUS', icon: Magnet, path: '/metal-detector' },
  { title: 'NCR / CAPA', description: 'รายงานความไม่สอดคล้อง & แก้ไข', icon: AlertTriangle, path: '/ncr', badge: 2, badgeStatus: 'warning' as const },
  { title: 'Deviations & CAPA', description: 'ความผิดปกติ & การแก้ไข', icon: ShieldAlert, path: '/deviations', badge: mockDeviations.filter(d => d.status === 'OPEN').length, badgeStatus: 'fail' as const },
  { title: 'Environmental / GMP', description: 'อุณหภูมิ ความชื้น สุขาภิบาล', icon: Leaf, path: '/environment' },
  { title: 'Water Quality', description: 'คุณภาพน้ำ pH, Chlorine, E.Coli', icon: Droplets, path: '/water' },
  { title: 'Allergen Control', description: 'ควบคุมสารก่อภูมิแพ้', icon: ShieldAlert, path: '/allergen' },
  { title: 'Calibration', description: 'สอบเทียบเครื่องมือวัด', icon: Wrench, path: '/calibration', badge: 1, badgeStatus: 'fail' as const },
  { title: 'Internal Audit', description: 'ตรวจประเมิน GMP/HACCP', icon: CheckSquare, path: '/audit' },
  { title: 'Complaints', description: 'เรื่องร้องเรียนลูกค้า', icon: MessageSquare, path: '/complaints' },
  { title: 'Traceability', description: 'ตรวจสอบย้อนกลับ ผู้ส่ง→ลูกค้า', icon: GitBranch, path: '/traceability' },
  { title: 'Sampling Plan', description: 'ตาราง AQL ตาม ISO 2859-1', icon: BarChart3, path: '/sampling' },
  { title: 'Master Data', description: 'พนักงาน ซัพพลายเออร์ อุปกรณ์ HACCP', icon: Database, path: '/master-data' },
];

export default function Dashboard() {
  const { data: kpis = [] } = useDashboard();

  return (
    <AppLayout>
      {/* KPI Grid */}
      <section className="mb-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">Key Performance Indicators</h2>
        <div className="grid grid-cols-2 gap-2">
          {kpis.map((kpi) => (
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
