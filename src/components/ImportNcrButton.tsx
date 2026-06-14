import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { apiPost } from '@/lib/api';
import { parseCsv } from '@/lib/csv';

// Case-insensitive lookup so column order / casing in the CSV doesn't matter.
function pick(row: Record<string, string>, ...keys: string[]): string {
  const lower: Record<string, string> = {};
  for (const k of Object.keys(row)) lower[k.toLowerCase()] = row[k];
  for (const key of keys) {
    const v = lower[key.toLowerCase()];
    if (v) return v;
  }
  return '';
}

// Imports NCR records from a CSV file and creates them via POST /api/ncrs.
// Expected headers: Title, Description, Category, Severity, Assigned, Due.
export function ImportNcrButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so selecting the same file again re-triggers onChange.
    e.target.value = '';
    if (!file) return;

    const text = await file.text();
    const rows = parseCsv(text)
      .map((r) => ({
        title: pick(r, 'Title', 'title'),
        description: pick(r, 'Description', 'description'),
        category: pick(r, 'Category', 'category'),
        severity: pick(r, 'Severity', 'severity').toLowerCase(),
        assignedTo: pick(r, 'Assigned', 'AssignedTo', 'assignedTo'),
        dueDate: pick(r, 'Due', 'DueDate', 'dueDate'),
      }))
      .filter((r) => r.title && r.description);

    if (rows.length === 0) {
      toast.error('ไม่พบรายการที่นำเข้าได้ — ต้องมีคอลัมน์ Title และ Description');
      return;
    }

    if (!window.confirm(`นำเข้า ${rows.length} รายการ NCR เข้าสู่ฐานข้อมูล?`)) return;

    setBusy(true);
    let ok = 0;
    let failed = 0;
    for (const row of rows) {
      try {
        await apiPost('/api/ncrs', row);
        ok++;
      } catch {
        failed++;
      }
    }
    setBusy(false);

    await queryClient.invalidateQueries({ queryKey: ['ncrs'] });

    if (failed === 0) {
      toast.success(`นำเข้าสำเร็จ ${ok} รายการ`);
    } else if (ok === 0) {
      toast.error(`นำเข้าไม่สำเร็จทั้ง ${failed} รายการ — เชื่อมต่อ Cloudflare/D1 หรือยัง?`);
    } else {
      toast.warning(`นำเข้าสำเร็จ ${ok} รายการ, ล้มเหลว ${failed} รายการ`);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        <Upload className="w-4 h-4 mr-1" /> {busy ? 'กำลังนำเข้า…' : 'Import CSV'}
      </Button>
    </>
  );
}
