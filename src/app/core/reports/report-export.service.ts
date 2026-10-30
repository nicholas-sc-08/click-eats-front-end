import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ReportExportService {
  downloadCsv(filename: string, headers: string[], rows: string[][]): void {
    const escapeCell = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const content = [headers, ...rows].map(row => row.map(escapeCell).join(';')).join('\r\n');
    const file = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
