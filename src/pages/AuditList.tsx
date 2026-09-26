import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AuditLog } from '@/lib/types';

export default function AuditList() {
  const navigate = useNavigate();
  const { data: audits = [], isLoading } = useQuery<AuditLog[]>({ queryKey: ['audits'], queryFn: () => apiGet<AuditLog[]>('/api/audits') });
  const passCount = audits.filter((audit) => audit.result === 'PASS').length;
  const score = audits.length ? Math.round((passCount / audits.length) * 100) : 0;
  return <AppLayout title="Internal Audit" showBack><div className="flex justify-between items-center mb-4"><div><p className="text-sm text-muted-foreground">{isLoading ? 'Loading…' : `${audits.length} items checked`}</p><p className="text-xs text-muted-foreground">Score: <span className="font-mono font-bold">{score}%</span></p></div><Button size="sm" onClick={() => navigate('/audit/new')}><Plus className="w-4 h-4 mr-1" /> New Audit</Button></div><div className="space-y-2">{audits.map((audit) => <Card key={audit.id} className={audit.result === 'FAIL' ? 'border-destructive/50' : ''}><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs text-muted-foreground">{audit.id}</span><Badge variant={audit.result === 'PASS' ? 'secondary' : 'destructive'}>{audit.result}</Badge></div><p className="font-semibold text-sm">{audit.checklistItem}</p><p className="text-xs text-muted-foreground">{audit.area}</p><div className="flex justify-between text-xs mt-2"><span className="text-muted-foreground">{audit.date} · {audit.auditor}</span>{audit.remark !== '-' && <span>{audit.remark}</span>}</div></CardContent></Card>)}{!isLoading && audits.length === 0 && <p className="text-sm text-muted-foreground">ไม่พบข้อมูลจาก D1</p>}</div></AppLayout>;
}
