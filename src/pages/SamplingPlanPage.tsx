import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockSamplingPlans } from '@/lib/mock-data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SamplingPlanPage() {
  return (
    <AppLayout title="Sampling Plan" showBack>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📊 ISO 2859-1 Sampling Plan (AQL)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            ตารางสุ่มตัวอย่างตามมาตรฐาน ISO 2859-1 สำหรับกำหนดจำนวนตัวอย่างที่ต้องตรวจตามขนาดล็อต
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Lot Size</TableHead>
                  <TableHead className="text-xs text-center">Sample</TableHead>
                  <TableHead className="text-xs text-center">Accept</TableHead>
                  <TableHead className="text-xs text-center">Reject</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSamplingPlans.map((plan, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs">{plan.lotMin}–{plan.lotMax}</TableCell>
                    <TableCell className="font-mono text-xs text-center font-bold">{plan.sampleSize}</TableCell>
                    <TableCell className="font-mono text-xs text-center text-[hsl(var(--status-pass))]">{plan.accept}</TableCell>
                    <TableCell className="font-mono text-xs text-center text-[hsl(var(--status-fail))]">{plan.reject}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📖 How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>1. ดูขนาดล็อต (Lot Size) ของชุดผลิตภัณฑ์ที่จะตรวจ</p>
          <p>2. หาจำนวนตัวอย่าง (Sample) ที่ต้องสุ่มตรวจ</p>
          <p>3. ถ้าจำนวนชิ้นที่ไม่ผ่าน ≤ Accept → ล็อตผ่าน</p>
          <p>4. ถ้าจำนวนชิ้นที่ไม่ผ่าน ≥ Reject → ล็อตไม่ผ่าน ต้องดำเนินการ</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
