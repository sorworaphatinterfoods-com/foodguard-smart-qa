import { AppLayout } from '@/components/layout/AppLayout';
import { ModuleCard } from '@/components/ModuleCard';
import {
  Leaf, Wrench, CheckSquare, MessageSquare, GitBranch,
  Droplets, ShieldAlert, Magnet, BarChart3, Database, FileText, ScanLine, Thermometer
} from 'lucide-react';

const modules = [
  { title: 'Inspection Log', description: 'บันทึกการตรวจสอบทุกกระบวนการ', icon: FileText, path: '/inspection' },
  { title: 'Environmental / GMP', description: 'อุณหภูมิ ความชื้น สุขาภิบาล', icon: Leaf, path: '/environment' },
  { title: 'Water Quality', description: 'คุณภาพน้ำ WHO standard', icon: Droplets, path: '/water' },
  { title: 'Allergen Control', description: 'ควบคุมสารก่อภูมิแพ้ FDA', icon: ShieldAlert, path: '/allergen' },
  { title: 'CCP Metal Detector (HACCP)', description: 'ตรวจโลหะก่อนบรรจุ · Deviation/Hold/QA', icon: ScanLine, path: '/ccp/dashboard' },
  { title: 'CCP อุณหภูมิ (Cooking/Freezing)', description: 'ทำสุก ≥75°C · แช่แข็ง ≤-18°C', icon: Thermometer, path: '/ccp/thermal' },
  { title: 'Metal Detector', description: 'ทดสอบ Fe/NonFe/SUS', icon: Magnet, path: '/metal-detector' },
  { title: 'Deviations & CAPA', description: 'ความผิดปกติ & แก้ไข', icon: ShieldAlert, path: '/deviations' },
  { title: 'Calibration', description: 'สอบเทียบเครื่องมือวัด', icon: Wrench, path: '/calibration' },
  { title: 'Internal Audit', description: 'ตรวจประเมิน GMP/HACCP', icon: CheckSquare, path: '/audit' },
  { title: 'Complaints', description: 'เรื่องร้องเรียนลูกค้า', icon: MessageSquare, path: '/complaints' },
  { title: 'Traceability', description: 'ตรวจสอบย้อนกลับ', icon: GitBranch, path: '/traceability' },
  { title: 'Sampling Plan', description: 'AQL ISO 2859-1', icon: BarChart3, path: '/sampling' },
  { title: 'Master Data', description: 'พนักงาน ซัพพลายเออร์ อุปกรณ์', icon: Database, path: '/master-data' },
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
