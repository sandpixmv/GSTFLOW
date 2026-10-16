import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileDown, 
  FileSpreadsheet, 
  Trash2, 
  Edit3, 
  FileText, 
  Paperclip,
  CheckCircle, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Invoice, InvoiceStatus, InvoiceType, UserProfile } from '../types';
import { formatMvr, generateMaldivesInvoicePdf } from '../utils/pdfGenerator';
import { exportInvoicesToCsv } from '../utils/csvExporter';

interface InvoicesViewProps {
  invoices: Invoice[];
  currentUser: UserProfile;
  onOpenCreateModal: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
  onViewSupplierDoc?: (docId: string) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  currentUser,
  onOpenCreateModal,
  onEditInvoice,
  onDeleteInvoice,
  onUpdateStatus,
  onViewSupplierDoc,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | InvoiceType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.counterpartyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.counterpartyTin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoiceIds(filteredInvoices.map((inv) => inv.id));
    } else {
      setSelectedInvoiceIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  const handleBatchExportPdf = () => {
    const selected = invoices.filter((inv) => selectedInvoiceIds.includes(inv.id));
    selected.forEach((inv) => generateMaldivesInvoicePdf(inv, currentUser));
  };

  const handleExportCsv = (mode: 'current' | 'all' = 'current') => {
    const targetInvoices = mode === 'all'
      ? invoices
      : selectedInvoiceIds.length > 0
      ? invoices.filter((inv) => selectedInvoiceIds.includes(inv.id))
      : filteredInvoices;

    const count = targetInvoices.length;
    exportInvoicesToCsv(targetInvoices, mode === 'all' ? 'Maldives_All_Invoices' : 'Maldives_Invoices_Ledger');
    setExportFeedback(`Exported ${count} invoice${count === 1 ? '' : 's'} to CSV`);
    setTimeout(() => setExportFeedback(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Maldives Business Invoices Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sales invoices and supplier vouchers in Maldivian Rufiyaa (MVR) with MIRA compliant tax rates.
          </p>
          {exportFeedback && (
            <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>{exportFeedback}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Export for external audits and bookkeeping */}
          {currentUser.permissions.canExportReports && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleExportCsv('current')}
                title="Export currently displayed invoice list to CSV for audit and bookkeeping"
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>
                  {selectedInvoiceIds.length > 0
                    ? `Export ${selectedInvoiceIds.length} Selected (CSV)`
                    : filteredInvoices.length !== invoices.length
                    ? `Export Filtered (${filteredInvoices.length} CSV)`
                    : `Export Invoices (${filteredInvoices.length} CSV)`}
                </span>
              </button>

              {filteredInvoices.length !== invoices.length && selectedInvoiceIds.length === 0 && (
                <button
                  onClick={() => handleExportCsv('all')}
                  title="Export all invoices in the database regardless of active filter"
                  className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
                >
                  All ({invoices.length})
                </button>
              )}
            </div>
          )}

          {/* PDF Batch Export */}
          {selectedInvoiceIds.length > 0 && currentUser.permissions.canExportReports && (
            <button
              onClick={handleBatchExportPdf}
              className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Export {selectedInvoiceIds.length} Selected (PDF)</span>
            </button>
          )}

          {currentUser.permissions.canCreateInvoices && (
            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number, supplier/client name, or MIRA TIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            aria-label="Filter by invoice type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Types</option>
            <option value="sales">Sales Invoices</option>
            <option value="purchase">Purchase Vouchers (ITC)</option>
          </select>

          <select
            aria-label="Filter by invoice status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500">
                <th className="py-3 px-3 w-8">
                  <input
                    aria-label="Select all invoices"
                    type="checkbox"
                    checked={
                      filteredInvoices.length > 0 &&
                      selectedInvoiceIds.length === filteredInvoices.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="py-3 px-3 font-semibold">Invoice #</th>
                <th className="py-3 px-3 font-semibold">Type</th>
                <th className="py-3 px-3 font-semibold">Counterparty</th>
                <th className="py-3 px-3 font-semibold">MIRA TIN</th>
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Total (Excl. GST)</th>
                <th className="py-3 px-3 font-semibold">GST Rate</th>
                <th className="py-3 px-3 font-semibold">GST Amount</th>
                <th className="py-3 px-3 font-semibold">Total (MVR)</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">No invoices found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoiceIds.includes(inv.id);
                  const gstRate = inv.items[0]?.gstRate || 8;

                  return (
                    <tr
                      key={inv.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}
                    >
                      <td className="py-3 px-3">
                        <input
                          aria-label={`Select invoice ${inv.invoiceNumber}`}
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(inv.id)}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span>{inv.invoiceNumber}</span>
                          {inv.attachedSupplierDocId && (
                            <span
                              title="Supplier PDF Attached in Vault"
                              className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                              onClick={() => onViewSupplierDoc && onViewSupplierDoc(inv.attachedSupplierDocId!)}
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            inv.type === 'sales'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {inv.type === 'sales' ? 'Sales Outflow' : 'Purchase (ITC)'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-medium text-slate-800">
                        {inv.counterpartyName}
                      </td>

                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {inv.counterpartyTin || <span className="text-slate-400 italic">Unregistered</span>}
                      </td>

                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {inv.invoiceDate}
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-700">
                        {formatMvr(inv.taxableSubtotal)}
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                          {gstRate}%
                        </span>
                      </td>

                      <td className="py-3 px-3 font-mono text-emerald-700 font-medium">
                        {formatMvr(inv.totalGst)}
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {formatMvr(inv.grandTotal)}
                      </td>

                      <td className="py-3 px-3">
                        <select
                          aria-label={`Status for invoice ${inv.invoiceNumber}`}
                          value={inv.status}
                          disabled={!currentUser.permissions.canEditInvoices}
                          onChange={(e) => onUpdateStatus(inv.id, e.target.value as InvoiceStatus)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border-0 cursor-pointer focus:ring-1 focus:ring-emerald-500 ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : inv.status === 'overdue'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <option value="paid">PAID</option>
                          <option value="pending">PENDING</option>
                          <option value="overdue">OVERDUE</option>
                          <option value="draft">DRAFT</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1">
                          {currentUser.permissions.canExportReports && (
                            <button
                              onClick={() => generateMaldivesInvoicePdf(inv, currentUser)}
                              title="Download Maldives Tax Invoice PDF"
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-emerald-600 rounded-lg transition-colors"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                          )}

                          {currentUser.permissions.canEditInvoices && (
                            <button
                              onClick={() => onEditInvoice(inv)}
                              title="Edit Invoice"
                              className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {currentUser.permissions.canDeleteInvoices && (
                            <button
                              onClick={() => onDeleteInvoice(inv.id)}
                              title="Delete Invoice"
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
