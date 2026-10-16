import { Invoice, MaldivesGstInputRecord } from '../types';

function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportInvoicesToCsv(invoices: Invoice[], filenamePrefix: string = 'Maldives_Invoices_Ledger') {
  const headers = [
    'Invoice Number',
    'Type',
    'Counterparty Name',
    'MIRA TIN',
    'Counterparty Address',
    'Invoice Date',
    'Due Date',
    'Status',
    'Tax Sector',
    'Taxable Subtotal (Excl. GST MVR)',
    'GST Rate (%)',
    'GST 6% (MVR)',
    'GST 8% (MVR)',
    'GST 12% (MVR)',
    'GST 16% (MVR)',
    'GST 17% (MVR)',
    'Total GST (MVR)',
    'Grand Total (MVR)',
    'Taxable Activity #',
    'Classification (Revenue/Capital)',
    'Notes',
  ];

  const rows = invoices.map((inv) => {
    const primaryGstRate = inv.items[0]?.gstRate || 8;
    return [
      escapeCsvCell(inv.invoiceNumber),
      escapeCsvCell(inv.type === 'sales' ? 'Sales Invoice' : 'Purchase Voucher'),
      escapeCsvCell(inv.counterpartyName),
      escapeCsvCell(inv.counterpartyTin || 'Unregistered'),
      escapeCsvCell(inv.counterpartyAddress || ''),
      escapeCsvCell(inv.invoiceDate),
      escapeCsvCell(inv.dueDate || ''),
      escapeCsvCell(inv.status.toUpperCase()),
      escapeCsvCell(inv.sector || 'General'),
      inv.taxableSubtotal.toFixed(2),
      primaryGstRate,
      (inv.gst6 || 0).toFixed(2),
      (inv.gst8 || 0).toFixed(2),
      (inv.gst12 || 0).toFixed(2),
      (inv.gst16 || 0).toFixed(2),
      (inv.gst17 || 0).toFixed(2),
      inv.totalGst.toFixed(2),
      inv.grandTotal.toFixed(2),
      inv.taxableActivityNumber || 1,
      escapeCsvCell(inv.revenueOrCapital || 'Revenue'),
      escapeCsvCell(inv.notes || ''),
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportInputScheduleToCsv(records: MaldivesGstInputRecord[], period: string) {
  const headers = [
    '#',
    'Supplier TIN',
    'Supplier Name',
    'Supplier Invoice Number',
    'Invoice Date',
    'Invoice Total (excluding GST)',
    'GST Charged at 6%',
    'GST Charged at 8%',
    'GST Charged at 12%',
    'GST Charged at 16%',
    'GST Charged at 17%',
    'Your Taxable Activity Number',
    'Revenue / Capital',
  ];

  const rows = records.map((rec) => [
    rec.rowNumber,
    escapeCsvCell(rec.supplierTin),
    escapeCsvCell(rec.supplierName),
    escapeCsvCell(rec.supplierInvoiceNumber),
    escapeCsvCell(rec.invoiceDate),
    rec.invoiceTotalExclGst.toFixed(2),
    (rec.gst6 || 0).toFixed(2),
    (rec.gst8 || 0).toFixed(2),
    (rec.gst12 || 0).toFixed(2),
    (rec.gst16 || 0).toFixed(2),
    (rec.gst17 || 0).toFixed(2),
    rec.taxableActivityNumber || 1,
    escapeCsvCell(rec.revenueOrCapital),
  ].join(','));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MIRA_GST_Input_Schedule_${period.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
