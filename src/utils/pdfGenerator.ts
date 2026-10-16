import jsPDF from 'jspdf';
import { Invoice, MaldivesGstReport, MaldivesGstInputRecord, UserProfile } from '../types';

export function formatMvr(amount: number): string {
  return `MVR ${(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMvrPlain(amount: number): string {
  if (amount === 0) return '-';
  return (amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// 1. Export exact Maldives GST Input Template (Matches User's Attached Template)
export function generateMaldivesInputTemplatePdf(
  report: MaldivesGstReport,
  company: UserProfile
) {
  // A4 Landscape to comfortably fit all 13 columns from user template
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Title Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MALDIVES INLAND REVENUE AUTHORITY (MIRA) - GST INPUT TAX DEDUCTION STATEMENT', 12, 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(
    `Taxpayer: ${company.companyName} | TIN: ${company.tin} | Tax Period: ${report.period} | Taxable Activity No: ${company.taxableActivityNumber}`,
    12,
    17
  );

  y = 28;

  // Table Headers matching user image columns exactly:
  // # | Supplier TIN | Supplier Name | Supplier Invoice Number | Invoice Date | Invoice Total (excluding GST) | 6% | 8% | 12% | 16% | 17% | Your Taxable Activity Number | Revenue / Capital
  doc.setFillColor(203, 213, 225); // slate-300 header
  doc.rect(10, y, pageWidth - 20, 11, 'F');
  doc.setDrawColor(148, 163, 184);
  doc.rect(10, y, pageWidth - 20, 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(15, 23, 42);

  const colX = {
    num: 12,
    tin: 20,
    name: 48,
    invNum: 95,
    date: 128,
    excl: 168,
    gst6: 188,
    gst8: 202,
    gst12: 216,
    gst16: 230,
    gst17: 244,
    act: 258,
    revCap: 272,
  };

  doc.text('#', colX.num, y + 6);
  doc.text('Supplier TIN', colX.tin, y + 6);
  doc.text('Supplier Name', colX.name, y + 6);
  doc.text('Supplier Invoice\nNumber', colX.invNum, y + 4.5);
  doc.text('Invoice Date', colX.date, y + 6);
  doc.text('Invoice Total\n(excl. GST)', colX.excl, y + 4.5);
  doc.text('GST\n6%', colX.gst6, y + 4.5);
  doc.text('GST\n8%', colX.gst8, y + 4.5);
  doc.text('GST\n12%', colX.gst12, y + 4.5);
  doc.text('GST\n16%', colX.gst16, y + 4.5);
  doc.text('GST\n17%', colX.gst17, y + 4.5);
  doc.text('Taxable\nActivity #', colX.act, y + 4.5);
  doc.text('Revenue /\nCapital', colX.revCap, y + 4.5);

  y += 12;

  // Render Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(30, 41, 59);

  let totalExcl = 0;
  let total6 = 0;
  let total8 = 0;
  let total12 = 0;
  let total16 = 0;
  let total17 = 0;

  report.inputRecords.forEach((row, idx) => {
    totalExcl += row.invoiceTotalExclGst;
    total6 += row.gst6;
    total8 += row.gst8;
    total12 += row.gst12;
    total16 += row.gst16;
    total17 += row.gst17;

    // Zebra striping
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, y - 3.5, pageWidth - 20, 6, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(10, y + 2.5, pageWidth - 10, y + 2.5);

    doc.text(`${row.rowNumber || idx + 1}`, colX.num, y);
    doc.text(row.supplierTin, colX.tin, y);
    doc.text(row.supplierName.length > 25 ? row.supplierName.substring(0, 24) + '...' : row.supplierName, colX.name, y);
    doc.text(row.supplierInvoiceNumber, colX.invNum, y);
    doc.text(row.invoiceDate, colX.date, y);
    doc.text(formatMvrPlain(row.invoiceTotalExclGst), colX.excl, y);
    doc.text(formatMvrPlain(row.gst6), colX.gst6, y);
    doc.text(formatMvrPlain(row.gst8), colX.gst8, y);
    doc.text(formatMvrPlain(row.gst12), colX.gst12, y);
    doc.text(formatMvrPlain(row.gst16), colX.gst16, y);
    doc.text(formatMvrPlain(row.gst17), colX.gst17, y);
    doc.text(`${row.taxableActivityNumber}`, colX.act + 2, y);
    doc.text(row.revenueOrCapital, colX.revCap, y);

    y += 6;
  });

  // Totals Row
  y += 2;
  doc.setFillColor(241, 245, 249);
  doc.rect(10, y - 3, pageWidth - 20, 8, 'F');
  doc.setDrawColor(100, 116, 139);
  doc.rect(10, y - 3, pageWidth - 20, 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);

  doc.text('TOTALS (MVR):', colX.invNum, y + 2);
  doc.text(formatMvrPlain(totalExcl), colX.excl, y + 2);
  doc.text(formatMvrPlain(total6), colX.gst6, y + 2);
  doc.text(formatMvrPlain(total8), colX.gst8, y + 2);
  doc.text(formatMvrPlain(total12), colX.gst12, y + 2);
  doc.text(formatMvrPlain(total16), colX.gst16, y + 2);
  doc.text(formatMvrPlain(total17), colX.gst17, y + 2);

  // Bottom attestation
  y += 18;
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Total Eligible Input Tax Credit: ${formatMvr(total6 + total8 + total12 + total16 + total17)} • Computed strictly per MIRA Goods & Services Tax Guidelines`,
    12,
    y
  );
  doc.text(
    `Prepared by TaxFlow Pro Maldives Enterprise Edition on ${new Date().toLocaleDateString('en-GB')}`,
    12,
    y + 5
  );

  doc.save(`MIRA_GST_Input_Tax_Schedule_${report.period.replace(/\s+/g, '_')}.pdf`);
}

// 2. Export Maldives Tax Invoice in MVR
export function generateMaldivesInvoicePdf(invoice: Invoice, company: UserProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(company.companyName.toUpperCase(), 14, 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`TIN: ${company.tin} | Activity No: ${company.taxableActivityNumber} | ${company.atollOrCity}`, 14, 20);

  // Badge
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(pageWidth - 62, 8, 48, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  const typeLabel = invoice.type === 'sales' ? 'TAX INVOICE' : 'PURCHASE VOUCHER';
  doc.text(typeLabel, pageWidth - 57, 16);

  y = 38;

  // Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Particulars:', 14, y);
  doc.text('Billed To (Customer / Entity):', pageWidth / 2, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text(`Invoice No: ${invoice.invoiceNumber}`, 14, y);
  doc.text(`Date: ${invoice.invoiceDate}`, 14, y + 5);
  doc.text(`Payment Due: ${invoice.dueDate}`, 14, y + 10);
  doc.text(`Sector: ${invoice.sector} Sector (GST Rate: ${invoice.items[0]?.gstRate || 8}%)`, 14, y + 15);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, y + 20);

  // Right col
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.counterpartyName, pageWidth / 2, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Customer TIN: ${invoice.counterpartyTin || 'Unregistered / B2C'}`, pageWidth / 2, y + 5);
  if (invoice.counterpartyAddress) {
    doc.text(invoice.counterpartyAddress, pageWidth / 2, y + 10);
  }

  y += 30;

  // Items Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text('#', 16, y + 5.5);
  doc.text('Description of Goods / Services', 26, y + 5.5);
  doc.text('Qty', 115, y + 5.5);
  doc.text('Rate (Excl. GST)', 130, y + 5.5);
  doc.text('GST %', 158, y + 5.5);
  doc.text('Amount (MVR)', pageWidth - 16, y + 5.5, { align: 'right' });

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  invoice.items.forEach((item, index) => {
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
    }

    doc.text(`${index + 1}`, 16, y + 1);
    doc.text(item.description.length > 42 ? item.description.substring(0, 42) + '...' : item.description, 26, y + 1);
    doc.text(`${item.quantity}`, 115, y + 1);
    doc.text(item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 }), 130, y + 1);
    doc.text(`${item.gstRate}%`, 158, y + 1);
    doc.text(item.total.toLocaleString('en-US', { minimumFractionDigits: 2 }), pageWidth - 16, y + 1, { align: 'right' });

    y += 8;
  });

  // Totals Box
  y += 4;
  const subtotalX = pageWidth - 80;
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);

  doc.text('Total (Excluding GST):', subtotalX, y);
  doc.text(formatMvr(invoice.taxableSubtotal), pageWidth - 16, y, { align: 'right' });
  y += 6;

  doc.text(`GST Charged (${invoice.items[0]?.gstRate || 8}%):`, subtotalX, y);
  doc.text(formatMvr(invoice.totalGst), pageWidth - 16, y, { align: 'right' });
  y += 6;

  // Grand Total highlight box
  doc.setFillColor(238, 242, 255);
  doc.rect(subtotalX - 4, y - 2, 70, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 27, 75);
  doc.text('Total Invoice Value:', subtotalX, y + 5);
  doc.text(formatMvr(invoice.grandTotal), pageWidth - 16, y + 5, { align: 'right' });

  y += 24;

  // Bank & Settlement
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Bank & Settlement Instructions (Maldives):', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Bank of Maldives (BML) Corporate Banking | MVR A/C: 7730000188921 | Swift: MALBMVMV', 14, y + 5);
  doc.text('Statutory note: Issued under Section 42 of Maldives Goods and Services Tax Act.', 14, y + 10);

  // Signature Block
  const sigX = pageWidth - 65;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${company.companyName}`, sigX, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory & Stamp', sigX, y + 14);

  doc.save(`${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
}

// 3. Export MIRA Form 205 (Maldives GST Return)
export function generateMira205Pdf(report: MaldivesGstReport, company: UserProfile) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FORM MIRA 205: GOODS AND SERVICES TAX (GST) RETURN', 14, 12);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Taxpayer: ${company.companyName} | TIN: ${company.tin} | Tax Period: ${report.period}`, 14, 20);

  y = 38;

  // Box 1: Output Tax (Sales)
  doc.setFillColor(239, 246, 255);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 58, 138);
  doc.text('Part A: Output Tax on Taxable Supplies', 16, y + 5);

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text('1. General Sector Taxable Supplies (Subject to 8% GST):', 16, y);
  doc.text(formatMvr(report.generalSuppliesTaxable), 130, y);
  doc.text(formatMvr(report.generalOutputGst), pageWidth - 16, y, { align: 'right' });
  y += 7;

  doc.text('2. Tourism Sector Taxable Supplies (Subject to 16% / 17% TGST):', 16, y);
  doc.text(formatMvr(report.tourismSuppliesTaxable), 130, y);
  doc.text(formatMvr(report.tourismOutputGst), pageWidth - 16, y, { align: 'right' });
  y += 7;

  doc.text('3. Zero-Rated Supplies (Essential goods & export of services):', 16, y);
  doc.text(formatMvr(report.zeroRatedSupplies), 130, y);
  doc.text('MVR 0.00', pageWidth - 16, y, { align: 'right' });
  y += 7;

  doc.text('4. Exempt Supplies:', 16, y);
  doc.text(formatMvr(report.exemptSupplies), 130, y);
  doc.text('MVR 0.00', pageWidth - 16, y, { align: 'right' });
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.text('Total Output Tax (Box 1):', 16, y);
  doc.text(formatMvr(report.totalOutputTax), pageWidth - 16, y, { align: 'right' });

  y += 14;

  // Box 2: Input Tax Deduction
  doc.setFillColor(240, 253, 244);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 83, 45);
  doc.text('Part B: Input Tax Deduction (From MIRA Input Tax Schedule)', 16, y + 5);

  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  doc.text('5. Input Tax on General Sector Purchases (8% GST):', 16, y);
  doc.text(formatMvr(report.totalInputGst8), pageWidth - 16, y, { align: 'right' });
  y += 7;

  doc.text('6. Input Tax on Tourism Sector / Prior Slabs (6%, 12%, 16%, 17%):', 16, y);
  doc.text(formatMvr(report.totalInputGst6 + report.totalInputGst12 + report.totalInputGst16 + report.totalInputGst17), pageWidth - 16, y, { align: 'right' });
  y += 7;

  doc.text(`   • Total Operational Revenue Expenses (Excl. GST): ${formatMvr(report.totalRevenueExpenses)}`, 20, y);
  y += 5;
  doc.text(`   • Total Capital Asset Purchases (Excl. GST): ${formatMvr(report.totalCapitalExpenses)}`, 20, y);
  y += 9;

  doc.setFont('helvetica', 'bold');
  doc.text('Total Input Tax Deductible (Box 2):', 16, y);
  doc.text(`- ${formatMvr(report.totalInputTaxCredit)}`, pageWidth - 16, y, { align: 'right' });

  y += 16;

  // Box 3: Net GST Calculation
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, pageWidth - 28, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const payableLabel = report.netGstPayable >= 0 ? 'NET GST PAYABLE TO MIRA (Box 3):' : 'NET GST REFUNDABLE / CREDIT (Box 3):';
  doc.text(payableLabel, 18, y + 8);
  doc.text(formatMvr(Math.abs(report.netGstPayable)), pageWidth - 18, y + 8, { align: 'right' });

  y += 24;

  // Verification Block
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Statutory Declaration:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('I declare that the information given in this return is true and complete.', 14, y + 5);
  doc.text(`Status: ${report.status.toUpperCase()} ${report.miraAckNumber ? `| MIRA Acknowledgment: ${report.miraAckNumber}` : ''}`, 14, y + 10);

  doc.save(`Form_MIRA_205_${report.period.replace(/\s+/g, '_')}.pdf`);
}

// 4. Export Maldives Cash Flow & Financial Report in MVR
export function generateCashFlowPdf(
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netCashFlow: number;
    pendingReceivables: number;
    pendingPayables: number;
    netGstPayable: number;
  },
  company: UserProfile
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 16;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('MALDIVES EXECUTIVE FINANCIAL & CASH FLOW REPORT', 14, 13);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${company.companyName} | Currency: Maldivian Rufiyaa (MVR) | ${new Date().toLocaleDateString('en-GB')}`, 14, 20);

  y = 40;
  const cardW = (pageWidth - 36) / 2;
  const cardH = 22;

  // Inflows
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'F');
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL REVENUE INFLOWS (MVR)', 18, y + 6);
  doc.setFontSize(11);
  doc.text(formatMvr(summary.totalRevenue), 18, y + 15);

  // Outflows
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14 + cardW + 8, y, cardW, cardH, 2, 2, 'F');
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(8);
  doc.text('SUPPLIER OPERATIONAL OUTFLOWS (MVR)', 14 + cardW + 12, y + 6);
  doc.setFontSize(11);
  doc.text(formatMvr(summary.totalExpenses), 14 + cardW + 12, y + 15);

  y += cardH + 8;

  // Net Cash Flow
  doc.setFillColor(238, 242, 255);
  doc.roundedRect(14, y, cardW, cardH, 2, 2, 'F');
  doc.setTextColor(30, 27, 75);
  doc.setFontSize(8);
  doc.text('NET OPERATING CASH FLOW', 18, y + 6);
  doc.setFontSize(11);
  doc.text(formatMvr(summary.netCashFlow), 18, y + 15);

  // Net MIRA GST Liability
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(14 + cardW + 8, y, cardW, cardH, 2, 2, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(8);
  doc.text('MIRA GST PAYABLE (ESTIMATED)', 14 + cardW + 12, y + 6);
  doc.setFontSize(11);
  doc.text(formatMvr(summary.netGstPayable), 14 + cardW + 12, y + 15);

  y += cardH + 16;

  // Working Capital Section
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Working Capital Runway & MIRA Tax Reserves (Maldives)', 18, y + 5.5);

  y += 14;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Uncollected Customer Accounts Receivable (MVR):', 16, y);
  doc.text(formatMvr(summary.pendingReceivables), pageWidth - 16, y, { align: 'right' });
  y += 8;

  doc.text('Outstanding Supplier Accounts Payable Due (MVR):', 16, y);
  doc.text(formatMvr(summary.pendingPayables), pageWidth - 16, y, { align: 'right' });
  y += 8;

  const netLiquidity = summary.netCashFlow + summary.pendingReceivables - summary.pendingPayables - summary.netGstPayable;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Adjusted Liquidity Buffer Post All Commitments:', 16, y);
  doc.text(formatMvr(netLiquidity), pageWidth - 16, y, { align: 'right' });

  doc.save(`Maldives_Financial_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
}
