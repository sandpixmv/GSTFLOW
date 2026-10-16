import React, { useState } from 'react';
import { 
  FolderArchive, 
  Search, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Tag, 
  ExternalLink, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { SupplierDocument, SupplierDocStatus, UserProfile } from '../types';
import { formatMvr } from '../utils/pdfGenerator';

interface SupplierVaultViewProps {
  documents: SupplierDocument[];
  currentUser: UserProfile;
  onOpenUploadModal: () => void;
  onDeleteDocument: (id: string) => void;
  onUpdateStatus: (id: string, status: SupplierDocStatus) => void;
  onConvertToInvoice: (doc: SupplierDocument) => void;
}

export const SupplierVaultView: React.FC<SupplierVaultViewProps> = ({
  documents,
  currentUser,
  onOpenUploadModal,
  onDeleteDocument,
  onUpdateStatus,
  onConvertToInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupplierDocStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<SupplierDocument | null>(null);

  const categories = Array.from(new Set(documents.map((d) => d.category)));

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.supplierTin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              MIRA Supplier Archive
            </span>
            <span className="text-xs text-slate-500">• Centralized Searchable Repository</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Maldives Supplier PDF Invoices Vault
          </h1>
          <p className="text-xs text-slate-500">
            Easily archive, index, and search supplier bills for MIRA tax audits and automatic Input Tax Schedule synchronization.
          </p>
        </div>

        {currentUser.permissions.canVerifySupplierDocs && (
          <button
            onClick={onOpenUploadModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-emerald-500/20"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Supplier Invoice</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by supplier name, MIRA TIN (e.g. 1183672GST501), or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            aria-label="Category filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Expense Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            aria-label="Audit status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">All Audit Statuses</option>
            <option value="verified">Verified</option>
            <option value="reconciled">Reconciled to ITC</option>
            <option value="pending_review">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Grid of Archived Supplier Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
            <FolderArchive className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-sm font-medium text-slate-700">No supplier bills found in vault</p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        PDF
                      </div>
                      <div className="truncate">
                        <h2 className="font-bold text-slate-900 text-xs truncate" title={doc.supplierName}>
                          {doc.supplierName}
                        </h2>
                        <span className="text-[10px] font-mono text-slate-500">{doc.invoiceNumber}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                        doc.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'reconciled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {doc.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Document Meta */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-[11px] mb-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Supplier TIN:</span>
                      <span className="font-mono font-bold text-slate-900">{doc.supplierTin}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Invoice Date:</span>
                      <span className="font-medium text-slate-800">{doc.invoiceDate}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Excl. GST Amount:</span>
                      <span className="font-mono text-slate-800">{formatMvr(doc.invoiceTotalExclGst)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>GST Charged at 8%:</span>
                      <span className="font-mono font-bold text-emerald-700">{formatMvr(doc.gst8 || doc.totalGst)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                      <span>Total Invoice:</span>
                      <span className="font-mono text-xs">{formatMvr(doc.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Classification */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{doc.category}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-semibold">
                      {doc.revenueOrCapital}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingDoc(doc)}
                    className="flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Voucher</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {currentUser.permissions.canCreateInvoices && !doc.matchedInvoiceId && (
                      <button
                        onClick={() => onConvertToInvoice(doc)}
                        title="Record as Purchase Voucher in Ledger"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <ArrowRight className="w-3 h-3" />
                        <span>Link Ledger</span>
                      </button>
                    )}

                    {currentUser.permissions.canDeleteInvoices && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Delete from Vault"
                        className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Document Preview & Audit Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  MIRA
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Supplier Tax Invoice: {viewingDoc.invoiceNumber}
                  </h2>
                  <p className="text-xs text-slate-500">
                    File: {viewingDoc.fileName} ({(viewingDoc.fileSize / 1024).toFixed(1)} KB)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 font-sans space-y-4">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{viewingDoc.supplierName}</h3>
                    <p className="font-mono text-emerald-800 text-[11px] font-bold">
                      Supplier TIN: {viewingDoc.supplierTin}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">Category: {viewingDoc.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      MALDIVES TAX INVOICE
                    </span>
                    <p className="font-mono font-bold text-slate-800 mt-1">{viewingDoc.invoiceNumber}</p>
                    <p className="text-slate-500 text-[11px]">{viewingDoc.invoiceDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">MIRA Input Values</span>
                    <div className="mt-1 flex justify-between font-mono">
                      <span>Excl. GST Total:</span>
                      <span>{formatMvr(viewingDoc.invoiceTotalExclGst)}</span>
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-emerald-700 font-bold">
                      <span>GST at 8%:</span>
                      <span>{formatMvr(viewingDoc.gst8 || viewingDoc.totalGst)}</span>
                    </div>
                    <div className="mt-1 border-t border-slate-100 pt-1 flex justify-between font-mono font-bold text-slate-900">
                      <span>Grand Total:</span>
                      <span>{formatMvr(viewingDoc.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Activity & Type</span>
                    <div className="mt-1 flex justify-between">
                      <span className="text-slate-500">Taxable Activity #:</span>
                      <span className="font-mono font-bold text-slate-800">{viewingDoc.taxableActivityNumber}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-slate-500">Expense Type:</span>
                      <span className="font-bold text-slate-800">{viewingDoc.revenueOrCapital}</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-1.5 pt-2 border-t border-slate-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700 capitalize">
                        Status: {viewingDoc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {currentUser.permissions.canVerifySupplierDocs && (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-medium text-emerald-900">Update Audit Verification Status:</span>
                  <select
                    aria-label="Update audit status"
                    value={viewingDoc.status}
                    onChange={(e) => {
                      const newStatus = e.target.value as SupplierDocStatus;
                      onUpdateStatus(viewingDoc.id, newStatus);
                      setViewingDoc({ ...viewingDoc, status: newStatus });
                    }}
                    className="px-3 py-1 bg-white border border-emerald-300 rounded-lg font-bold text-emerald-800"
                  >
                    <option value="verified">Verified (Approved for ITC)</option>
                    <option value="reconciled">Reconciled to MIRA 205</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-[11px] text-slate-500 font-medium">
                Archived in MIRA Digital Audit Vault
              </span>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
