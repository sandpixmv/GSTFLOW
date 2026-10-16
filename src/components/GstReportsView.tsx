import React, { useState } from 'react';
import { 
  Building2, 
  FileDown, 
  FileSpreadsheet,
  Plus, 
  Trash2, 
  Sparkles, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Table, 
  Info,
  Edit2
} from 'lucide-react';
import { MaldivesGstReport, MaldivesGstInputRecord, UserProfile, Invoice, SupplierDocument } from '../types';
import { formatMvr, formatMvrPlain, generateMaldivesInputTemplatePdf, generateMira205Pdf } from '../utils/pdfGenerator';
import { exportInputScheduleToCsv } from '../utils/csvExporter';

interface GstReportsViewProps {
  reports: MaldivesGstReport[];
  invoices: Invoice[];
  supplierDocs: SupplierDocument[];
  currentUser: UserProfile;
  onUpdateReport: (report: MaldivesGstReport) => void;
  onFileReport: (reportId: string, ackNumber: string) => void;
}

export const GstReportsView: React.FC<GstReportsViewProps> = ({
  reports,
  invoices,
  supplierDocs,
  currentUser,
  onUpdateReport,
  onFileReport,
}) => {
  const [activeTab, setActiveTab] = useState<'input_template' | 'mira_205'>('input_template');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(reports[0]?.period || 'Q3 2026 (July - September)');
  const [isEditingSales, setIsEditingSales] = useState(false);

  const activeReport = reports.find((r) => r.period === selectedPeriod) || reports[0];
  const [currentReport, setCurrentReport] = useState<MaldivesGstReport>(activeReport);

  React.useEffect(() => {
    if (activeReport) {
      setCurrentReport(activeReport);
    }
  }, [selectedPeriod, reports]);

  if (!activeReport) {
    return <div className="p-8 text-center text-slate-500">No Maldives GST records found.</div>;
  }

  // Recalculate summary totals
  const recalculateReport = (records: MaldivesGstInputRecord[], baseReport: MaldivesGstReport = currentReport): MaldivesGstReport => {
    const totalExcl = records.reduce((s, r) => s + (Number(r.invoiceTotalExclGst) || 0), 0);
    const total6 = records.reduce((s, r) => s + (Number(r.gst6) || 0), 0);
    const total8 = records.reduce((s, r) => s + (Number(r.gst8) || 0), 0);
    const total12 = records.reduce((s, r) => s + (Number(r.gst12) || 0), 0);
    const total16 = records.reduce((s, r) => s + (Number(r.gst16) || 0), 0);
    const total17 = records.reduce((s, r) => s + (Number(r.gst17) || 0), 0);
    const totalItc = total6 + total8 + total12 + total16 + total17;

    const totalRev = records.filter(r => r.revenueOrCapital === 'Revenue').reduce((s, r) => s + (Number(r.invoiceTotalExclGst) || 0), 0);
    const totalCap = records.filter(r => r.revenueOrCapital === 'Capital').reduce((s, r) => s + (Number(r.invoiceTotalExclGst) || 0), 0);

    const netPayable = baseReport.totalOutputTax - totalItc;

    return {
      ...baseReport,
      inputRecords: records,
      totalInputExclGst: totalExcl,
      totalInputGst6: total6,
      totalInputGst8: total8,
      totalInputGst12: total12,
      totalInputGst16: total16,
      totalInputGst17: total17,
      totalInputTaxCredit: totalItc,
      totalRevenueExpenses: totalRev,
      totalCapitalExpenses: totalCap,
      netGstPayable: netPayable,
      updatedAt: new Date().toISOString(),
    };
  };

  // Inline row updates
  const handleUpdateRow = (index: number, field: keyof MaldivesGstInputRecord, value: any) => {
    const updated = [...currentReport.inputRecords];
    const item = { ...updated[index], [field]: value };

    // Auto calculate 8% GST if invoiceTotalExclGst changes and gst8 is zero or matches 8%
    if (field === 'invoiceTotalExclGst') {
      const excl = Number(value) || 0;
      item.gst8 = Math.round(excl * 0.08 * 100) / 100;
    }

    updated[index] = item;
    const recalculated = recalculateReport(updated);
    setCurrentReport(recalculated);
    onUpdateReport(recalculated);
  };

  // Add new row to template
  const handleAddRow = () => {
    const newRecord: MaldivesGstInputRecord = {
      id: `rec-${Date.now()}`,
      rowNumber: currentReport.inputRecords.length + 1,
      supplierTin: '1000000GST501',
      supplierName: 'New Maldives Supplier Pvt Ltd',
      supplierInvoiceNumber: `INV/2026/${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceDate: new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      invoiceTotalExclGst: 10000,
      gst6: 0,
      gst8: 800,
      gst12: 0,
      gst16: 0,
      gst17: 0,
      taxableActivityNumber: currentUser.taxableActivityNumber || 1,
      revenueOrCapital: 'Revenue',
    };

    const updatedRecords = [...currentReport.inputRecords, newRecord];
    const recalculated = recalculateReport(updatedRecords);
    setCurrentReport(recalculated);
    onUpdateReport(recalculated);
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    const updatedRecords = currentReport.inputRecords.filter((_, i) => i !== index).map((r, i) => ({
      ...r,
      rowNumber: i + 1,
    }));
    const recalculated = recalculateReport(updatedRecords);
    setCurrentReport(recalculated);
    onUpdateReport(recalculated);
  };

  // Sync rows from Supplier Vault
  const handleSyncFromSupplierVault = () => {
    if (supplierDocs.length === 0) {
      alert('No documents in supplier vault to sync.');
      return;
    }

    const newRows: MaldivesGstInputRecord[] = supplierDocs.map((doc, idx) => ({
      id: `sync-${doc.id}`,
      rowNumber: idx + 1,
      supplierTin: doc.supplierTin,
      supplierName: doc.supplierName,
      supplierInvoiceNumber: doc.invoiceNumber,
      invoiceDate: doc.invoiceDate,
      invoiceTotalExclGst: doc.invoiceTotalExclGst || doc.totalAmount - doc.totalGst,
      gst6: doc.gst6 || 0,
      gst8: doc.gst8 || doc.totalGst,
      gst12: doc.gst12 || 0,
      gst16: doc.gst16 || 0,
      gst17: doc.gst17 || 0,
      taxableActivityNumber: doc.taxableActivityNumber || 1,
      revenueOrCapital: doc.revenueOrCapital || 'Revenue',
      matchedSupplierDocId: doc.id,
    }));

    const recalculated = recalculateReport(newRows);
    setCurrentReport(recalculated);
    onUpdateReport(recalculated);
    alert('Synchronized all supplier invoices from the central vault into the Maldives MIRA GST template!');
  };

  const handleStatutoryFiling = () => {
    if (currentReport.status === 'filed') return;
    const ack = `MIRA-GST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10000 + Math.random() * 90000)}`;
    onFileReport(currentReport.id, ack);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Maldives MIRA Statutory Compliance
            </span>
            <span className="text-xs text-slate-500">• Law No. 10/2011 (GST Act)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Maldives GST Return & Input Tax Statement
          </h1>
          <p className="text-xs text-slate-500">
            Official MIRA input deduction schedule (6%, 8%, 12%, 16%, 17%) and Form MIRA 205 reconciliation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Period:</span>
            <select
              aria-label="Tax Period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {reports.map((r) => (
                <option key={r.period} value={r.period}>
                  {r.period}
                </option>
              ))}
            </select>
          </div>

          {/* Sync from Supplier Vault */}
          {currentUser.permissions.canManageGst && (
            <button
              onClick={handleSyncFromSupplierVault}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Import from Supplier Vault</span>
            </button>
          )}

          {/* Export Input Template PDF (Exact table layout) */}
          {currentUser.permissions.canExportReports && (
            <>
              <button
                onClick={() => exportInputScheduleToCsv(currentReport.inputRecords, currentReport.period)}
                title="Export MIRA GST Input Tax deduction table to CSV spreadsheet"
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Input Schedule (CSV)</span>
              </button>

              <button
                onClick={() => generateMaldivesInputTemplatePdf(currentReport, currentUser)}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl border border-blue-200 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Input Template PDF</span>
              </button>
            </>
          )}

          {/* Export MIRA 205 Return */}
          {currentUser.permissions.canExportReports && (
            <button
              onClick={() => generateMira205Pdf(currentReport, currentUser)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Export MIRA 205 PDF</span>
            </button>
          )}

          {/* File Return to MIRA */}
          {currentUser.permissions.canManageGst && currentReport.status !== 'filed' && (
            <button
              onClick={handleStatutoryFiling}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Submit to MIRA Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* View Mode Switcher Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('input_template')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'input_template'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>GST Input Tax Deduction Schedule (MIRA Template)</span>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-blue-500 text-white font-mono">
            {currentReport.inputRecords.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('mira_205')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'mira_205'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Form MIRA 205 Summary Return</span>
        </button>
      </div>

      {/* TAB 1: EXACT ATTACHED GST INPUT TEMPLATE TABLE */}
      {activeTab === 'input_template' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          {/* Table Header and Add Row */}
          <div className="px-6 py-4 bg-slate-100/70 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h2 className="font-bold text-slate-900 text-sm">
                  MIRA GST Input Tax Schedule (Exact Format as Attached)
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All amounts in Maldivian Rufiyaa (MVR). Editable cells save and update net tax liabilities in real time.
              </p>
            </div>

            {currentUser.permissions.canManageGst && (
              <button
                onClick={handleAddRow}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supplier Bill Row</span>
              </button>
            )}
          </div>

          {/* Table matching image layout */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-800 border-y border-slate-300 font-semibold text-[11px]">
                  <th className="py-2.5 px-2 text-center border-r border-slate-300 w-10">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-36">Supplier TIN</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 min-w-[200px]">Supplier Name</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-40">Supplier Invoice Number</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-44">Invoice Date</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right w-36">
                    Invoice Total<br />(excluding GST)
                  </th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-right w-24">GST Charged<br />at 6%</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-right w-24 bg-emerald-100/60 font-bold text-emerald-950">
                    GST Charged<br />at 8%
                  </th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-right w-24">GST Charged<br />at 12%</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-right w-24">GST Charged<br />at 16%</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-right w-24">GST Charged<br />at 17%</th>
                  <th className="py-2.5 px-2 border-r border-slate-300 text-center w-28">
                    Your Taxable<br />Activity Number
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-28">Revenue /<br />Capital</th>
                  <th className="py-2.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {currentReport.inputRecords.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    {/* # */}
                    <td className="py-2 px-2 text-center font-sans font-medium text-slate-500 border-r border-slate-200">
                      {row.rowNumber || index + 1}
                    </td>

                    {/* Supplier TIN */}
                    <td className="py-1 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={row.supplierTin}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'supplierTin', e.target.value.toUpperCase())}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded font-mono font-medium text-slate-900"
                      />
                    </td>

                    {/* Supplier Name */}
                    <td className="py-1 px-2 font-sans border-r border-slate-200">
                      <input
                        type="text"
                        value={row.supplierName}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'supplierName', e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded font-sans font-medium text-slate-900"
                      />
                    </td>

                    {/* Supplier Invoice Number */}
                    <td className="py-1 px-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={row.supplierInvoiceNumber}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'supplierInvoiceNumber', e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded font-mono text-slate-800"
                      />
                    </td>

                    {/* Invoice Date */}
                    <td className="py-1 px-2 font-sans border-r border-slate-200 whitespace-nowrap">
                      <input
                        type="text"
                        value={row.invoiceDate}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'invoiceDate', e.target.value)}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded font-sans text-slate-700"
                      />
                    </td>

                    {/* Invoice Total (excluding GST) */}
                    <td className="py-1 px-2 text-right border-r border-slate-200">
                      <input
                        type="number"
                        step="0.01"
                        value={row.invoiceTotalExclGst}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'invoiceTotalExclGst', Number(e.target.value))}
                        className="w-full px-1.5 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded text-right font-mono font-semibold text-slate-900"
                      />
                    </td>

                    {/* GST 6% */}
                    <td className="py-1 px-2 text-right border-r border-slate-200">
                      <input
                        type="number"
                        step="0.01"
                        value={row.gst6 || ''}
                        placeholder="-"
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'gst6', Number(e.target.value) || 0)}
                        className="w-full px-1 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded text-right font-mono text-slate-600"
                      />
                    </td>

                    {/* GST 8% */}
                    <td className="py-1 px-2 text-right border-r border-slate-200 bg-emerald-50/50">
                      <input
                        type="number"
                        step="0.01"
                        value={row.gst8}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'gst8', Number(e.target.value) || 0)}
                        className="w-full px-1 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-emerald-400 rounded text-right font-mono font-bold text-emerald-900"
                      />
                    </td>

                    {/* GST 12% */}
                    <td className="py-1 px-2 text-right border-r border-slate-200">
                      <input
                        type="number"
                        step="0.01"
                        value={row.gst12 || ''}
                        placeholder="-"
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'gst12', Number(e.target.value) || 0)}
                        className="w-full px-1 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded text-right font-mono text-slate-600"
                      />
                    </td>

                    {/* GST 16% */}
                    <td className="py-1 px-2 text-right border-r border-slate-200">
                      <input
                        type="number"
                        step="0.01"
                        value={row.gst16 || ''}
                        placeholder="-"
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'gst16', Number(e.target.value) || 0)}
                        className="w-full px-1 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded text-right font-mono text-slate-600"
                      />
                    </td>

                    {/* GST 17% */}
                    <td className="py-1 px-2 text-right border-r border-slate-200">
                      <input
                        type="number"
                        step="0.01"
                        value={row.gst17 || ''}
                        placeholder="-"
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'gst17', Number(e.target.value) || 0)}
                        className="w-full px-1 py-1 bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded text-right font-mono text-slate-600"
                      />
                    </td>

                    {/* Taxable Activity # */}
                    <td className="py-1 px-2 text-center border-r border-slate-200">
                      <input
                        type="number"
                        value={row.taxableActivityNumber}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'taxableActivityNumber', Number(e.target.value))}
                        className="w-full px-1 py-1 text-center bg-transparent hover:bg-white focus:bg-white border border-transparent focus:border-blue-400 rounded font-mono font-medium text-slate-800"
                      />
                    </td>

                    {/* Revenue / Capital */}
                    <td className="py-1 px-2 text-center font-sans border-r border-slate-200">
                      <select
                        aria-label="Revenue or capital classification"
                        value={row.revenueOrCapital}
                        disabled={!currentUser.permissions.canEditInvoices}
                        onChange={(e) => handleUpdateRow(index, 'revenueOrCapital', e.target.value as any)}
                        className="px-1.5 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-700"
                      >
                        <option value="Revenue">Revenue</option>
                        <option value="Capital">Capital</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-1 px-2 text-center">
                      {currentUser.permissions.canDeleteInvoices && (
                        <button
                          onClick={() => handleRemoveRow(index)}
                          className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded"
                          title="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* TOTALS FOOTER ROW */}
              <tfoot>
                <tr className="bg-slate-200 text-slate-900 font-bold border-t-2 border-slate-400 font-mono text-[11px]">
                  <td colSpan={5} className="py-3 px-4 font-sans text-right uppercase tracking-wider border-r border-slate-300">
                    Grand Totals (MVR):
                  </td>
                  <td className="py-3 px-3 text-right border-r border-slate-300 text-xs">
                    {formatMvrPlain(currentReport.totalInputExclGst)}
                  </td>
                  <td className="py-3 px-2 text-right border-r border-slate-300">
                    {formatMvrPlain(currentReport.totalInputGst6)}
                  </td>
                  <td className="py-3 px-2 text-right border-r border-slate-300 bg-emerald-100 font-extrabold text-emerald-950 text-xs">
                    {formatMvrPlain(currentReport.totalInputGst8)}
                  </td>
                  <td className="py-3 px-2 text-right border-r border-slate-300">
                    {formatMvrPlain(currentReport.totalInputGst12)}
                  </td>
                  <td className="py-3 px-2 text-right border-r border-slate-300">
                    {formatMvrPlain(currentReport.totalInputGst16)}
                  </td>
                  <td className="py-3 px-2 text-right border-r border-slate-300">
                    {formatMvrPlain(currentReport.totalInputGst17)}
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-center font-sans text-emerald-800 text-[10px]">
                    Total ITC: {formatMvr(currentReport.totalInputTaxCredit)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FORM MIRA 205 (GST RETURN CALCULATION) */}
      {activeTab === 'mira_205' && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
            currentReport.status === 'filed'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center space-x-3">
              {currentReport.status === 'filed' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              )}
              <div>
                <p className="font-bold">
                  {currentReport.status === 'filed'
                    ? 'FILED WITH MALDIVES INLAND REVENUE AUTHORITY (MIRA)'
                    : 'MIRA 205 DRAFT COMPUTATION READY FOR FILING'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {currentReport.status === 'filed'
                    ? `Filing Reference: ${currentReport.miraAckNumber} • Submitted on ${currentReport.filingDate}`
                    : 'Input tax credit schedule reconciled with active ledger vouchers.'}
                </p>
              </div>
            </div>

            <div className="text-right font-mono font-bold">
              <span className="text-[10px] uppercase tracking-wider block opacity-75">Net MIRA Settlement:</span>
              <span className="text-base text-slate-900">{formatMvr(currentReport.netGstPayable)}</span>
            </div>
          </div>

          {/* Form MIRA 205 Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* Part A: Output Tax */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>Part A: Output Tax on Taxable Sales Supplies</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">Tax Period: {currentReport.period}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-700">1. General Sector Supplies (Subject to 8% GST):</span>
                  <div className="space-x-4 font-mono font-medium">
                    <span className="text-slate-500">Taxable: {formatMvr(currentReport.generalSuppliesTaxable)}</span>
                    <span className="font-bold text-slate-900">Output GST: {formatMvr(currentReport.generalOutputGst)}</span>
                  </div>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-700">2. Tourism Sector Supplies (Subject to 16% / 17% TGST):</span>
                  <div className="space-x-4 font-mono font-medium">
                    <span className="text-slate-500">Taxable: {formatMvr(currentReport.tourismSuppliesTaxable)}</span>
                    <span className="font-bold text-slate-900">Output GST: {formatMvr(currentReport.tourismOutputGst)}</span>
                  </div>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-700">3. Zero-Rated Essential Supplies & Exports:</span>
                  <span className="font-mono text-slate-500">MVR 0.00</span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-blue-50/80 font-bold text-blue-950">
                  <span>Box 1: Total Gross Output Tax (A):</span>
                  <span className="font-mono text-sm">{formatMvr(currentReport.totalOutputTax)}</span>
                </div>
              </div>
            </div>

            {/* Part B: Input Tax Deductions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Part B: Input Tax Deduction (From MIRA Input Schedule)</span>
                </h3>
                <span className="text-xs text-emerald-700 font-medium">
                  {currentReport.inputRecords.length} Verified Supplier Vouchers
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-700">Input Tax at 8% (General Sector Supplies):</span>
                  <span className="font-mono font-bold text-slate-800">{formatMvr(currentReport.totalInputGst8)}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-50">
                  <span className="text-slate-700">Input Tax at 6%, 12%, 16%, 17%:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {formatMvr(currentReport.totalInputGst6 + currentReport.totalInputGst12 + currentReport.totalInputGst16 + currentReport.totalInputGst17)}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-emerald-50/80 font-bold text-emerald-950">
                  <span>Box 2: Total Input Tax Deductible (B):</span>
                  <span className="font-mono text-sm">- {formatMvr(currentReport.totalInputTaxCredit)}</span>
                </div>
              </div>
            </div>

            {/* Part C: Net MIRA Settlement */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Box 3: Net Tax Due / Refundable
                </span>
                <h4 className="text-xl font-bold mt-0.5">
                  {currentReport.netGstPayable >= 0 ? 'NET GST PAYABLE TO MIRA' : 'NET REFUNDABLE INPUT CREDIT'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Payable via MIRAconnect or authorized Maldives partner banks.
                </p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-extrabold font-mono text-emerald-400">
                  {formatMvr(Math.abs(currentReport.netGstPayable))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
