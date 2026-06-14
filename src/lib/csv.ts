// Small CSV helpers for exporting list data and importing records.
// No external deps — handles quoting/escaping and quoted-field parsing.

import type { ReactNode } from 'react';

export interface CsvColumn<T> {
  header: string;
  // Reuses the same shape as PrintColumn so list pages can share definitions.
  cell: (row: T) => ReactNode;
}

// Coerce a cell value (string | number | etc.) into a CSV-safe string.
function toCell(value: ReactNode): string {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'number' || typeof value === 'string') return String(value);
  // Non-primitive React nodes can't be serialized meaningfully; skip them.
  return '';
}

function escapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Build a CSV string from columns + rows.
export function toCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const head = columns.map((c) => escapeField(c.header)).join(',');
  const body = rows.map((row) =>
    columns.map((c) => escapeField(toCell(c.cell(row)))).join(','),
  );
  return [head, ...body].join('\r\n');
}

// Trigger a client-side download of the given rows as a .csv file.
export function downloadCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  // BOM so Excel opens UTF-8 (Thai text) correctly.
  const blob = new Blob(['﻿', toCsv(columns, rows)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse CSV text into an array of header-keyed objects. Supports quoted
// fields, escaped quotes ("") and both \n and \r\n line endings.
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  // Strip a leading UTF-8 BOM if present.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      field = '';
      row = [];
    } else {
      field += ch;
    }
  }
  // Flush the last field/row if the file doesn't end with a newline.
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ''));
  if (nonEmpty.length === 0) return [];

  const headers = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? '').trim();
    });
    return obj;
  });
}
