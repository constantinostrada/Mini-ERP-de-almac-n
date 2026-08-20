/**
 * Helpers for serializing tabular data as CSV (RFC 4180).
 *
 * Fields containing commas, double quotes or line breaks are wrapped in
 * double quotes, with embedded quotes doubled.
 */

export type CsvField = string | number;

function escapeCsvField(field: CsvField): string {
  const text = String(field);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(header: string[], rows: CsvField[][]): string {
  return [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\r\n') + '\r\n';
}
