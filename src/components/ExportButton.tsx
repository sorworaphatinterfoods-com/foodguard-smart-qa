import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadCsv, type CsvColumn } from '@/lib/csv';

interface ExportButtonProps<T> {
  filename: string;
  columns: CsvColumn<T>[];
  rows: T[];
  disabled?: boolean;
}

// Exports the currently displayed rows to a UTF-8 CSV file.
// Reuses the same column definitions as the A4 print report.
export function ExportButton<T>({ filename, columns, rows, disabled }: ExportButtonProps<T>) {
  const stamp = new Date().toISOString().slice(0, 10);

  const handleExport = () => {
    downloadCsv(`${filename}-${stamp}.csv`, columns, rows);
    toast.success(`ส่งออก ${rows.length} รายการเป็น CSV แล้ว`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || rows.length === 0}
    >
      <Download className="w-4 h-4 mr-1" /> Export CSV
    </Button>
  );
}
