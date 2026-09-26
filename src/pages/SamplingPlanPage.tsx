import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { SamplingPlan } from '@/lib/types';

export default function SamplingPlanPage() {
  const { data: plans = [], isLoading } = useQuery<SamplingPlan[]>({ queryKey: ['sampling-plans'], queryFn: () => apiGet<SamplingPlan[]>('/api/sampling-plans') });
  return <AppLayout title="Sampling Plan" showBack><Card><CardHeader className="pb-3"><CardTitle className="text-base">📊 ISO 2859-1 Sampling Plan (AQL)</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground mb-3">ตารางสุ่มตัวอย่างจากข้อมูล D1</p><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Lot Size</TableHead><TableHead className="text-center">Sample</TableHead><TableHead className="text-center">Accept</TableHead><TableHead className="text-center">Reject</TableHead></TableRow></TableHeader><TableBody>{plans.map((plan, idx) => <TableRow key={`${plan.lotMin}-${plan.lotMax}-${idx}`}><TableCell>{plan.lotMin}–{plan.lotMax}</TableCell><TableCell className="text-center">{plan.sampleSize}</TableCell><TableCell className="text-center">{plan.accept}</TableCell><TableCell className="text-center">{plan.reject}</TableCell></TableRow>)}</TableBody></Table>{!isLoading && plans.length === 0 && <p className="text-sm text-muted-foreground mt-3">ไม่พบข้อมูลจาก D1</p>}</div></CardContent></Card></AppLayout>;
}
