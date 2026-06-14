import { ReactNode } from 'react';

export interface PrintColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface PrintReportProps<T> {
  title: string;
  formCode?: string;
  columns: PrintColumn<T>[];
  rows: T[];
}

// A4 report block: hidden on screen, shown only when printing (window.print()).
// Renders a company header, a bordered table, and signature lines.
export function PrintReport<T>({ title, formCode, columns, rows }: PrintReportProps<T>) {
  const printedAt = new Date().toLocaleString('th-TH');

  return (
    <div className="hidden print:block text-black">
      <div className="flex items-start justify-between border-b-2 border-black pb-2 mb-3">
        <div>
          <h1 className="text-base font-bold">Sorworaphat Interfoods — Smart QA Factory</h1>
          <p className="text-sm font-semibold">{title}</p>
        </div>
        <div className="text-right text-[10px] leading-tight">
          {formCode && <p>Form: {formCode}</p>}
          <p>Printed: {printedAt}</p>
          <p>Records: {rows.length}</p>
        </div>
      </div>

      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} className="border border-black px-2 py-1 text-left bg-gray-200 font-semibold">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="border border-black px-2 py-3 text-center" colSpan={columns.length}>
                No records
              </td>
            </tr>
          ) : (
            rows.map((row, ri) => (
              <tr key={ri}>
                {columns.map((c, ci) => (
                  <td key={ci} className={`border border-black px-2 py-1 align-top ${c.className ?? ''}`}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-12 text-[10px]">
        <div className="text-center">
          <div className="border-t border-black w-44 pt-1">ผู้จัดทำ / Prepared by</div>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-44 pt-1">ผู้ทบทวน / Reviewed by</div>
        </div>
        <div className="text-center">
          <div className="border-t border-black w-44 pt-1">ผู้อนุมัติ / Approved by</div>
        </div>
      </div>
    </div>
  );
}
