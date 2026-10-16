import React, { useState } from 'react';
import { X, Upload, Check, Sparkles } from 'lucide-react';
import { SupplierDocument, UserProfile, RevenueOrCapital } from '../types';

interface UploadSupplierDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (doc: SupplierDocument) => void;
  currentUser: UserProfile;
}

const MALDIVES_EXPENSE_CATEGORIES = [
  'Building Materials & Civil Hardware',
  'Marine Electrical & Boat Supplies',
  'Commercial Wholesale Distribution',
  'Hardware & Fasteners',
  'Vessel Transport & Sea Logistics',
  'IT & Telecommunications Equipment',
  'Office Rent & Facilities (Male)',
  'Resort Engineering Consumables',
  'General Operational Supplies',
];

export const UploadSupplierDocModal: React.FC<UploadSupplierDocModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  currentUser,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [supplierTin, setSupplierTin] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  );
  const [invoiceTotalExclGst, setInvoiceTotalExclGst] = useState<number>(10000);
  const [gst8, setGst8] = useState<number>(800);
  const [gst6, setGst6] = useState<number>(0);
  const [gst16, setGst16] = useState<number>(0);
  const [taxableActivityNumber, setTaxableActivityNumber] = useState<number>(1);
  const [revenueOrCapital, setRevenueOrCapital] = useState<RevenueOrCapital>('Revenue');
  const [category, setCategory] = useState(MALDIVES_EXPENSE_CATEGORIES[0]);
  const [notes, setNotes] = useState('');
  const [isSimulatingOcr, setIsSimulatingOcr] = useState(false);

  if (!isOpen) return null;

  const handleExclAmountChange = (val: number) => {
    setInvoiceTotalExclGst(val);
    setGst8(Math.round(val * 0.08 * 100) / 100);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);

      // Smart OCR simulated parser for Maldives suppliers
      setIsSimulatingOcr(true);
      setTimeout(() => {
        setIsSimulatingOcr(false);
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes('uthuru') || nameLower.includes('buildware')) {
          setSupplierName('UTHURU BUILDWARE PVT LTD');
          setSupplierTin('1183672GST501');
          setInvoiceNumber('INV/2026/00099');
          handleExclAmountChange(74074.07);
          setCategory('Building Materials & Civil Hardware');
        } else if (nameLower.includes('silver') || nameLower.includes('blue')) {
          setSupplierName('Sllver Blue Maldives Pvt Ltd');
          setSupplierTin('1106735GST501');
          setInvoiceNumber('SBM/INV/2026/0210');
          handleExclAmountChange(43287.03);
          setCategory('Marine Electrical & Boat Supplies');
        } else if (nameLower.includes('inaaz')) {
          setSupplierName('Inaaz Group Pvt Ltd');
          setSupplierTin('1183348GST501');
          setInvoiceNumber('INV/2026/00055');
          handleExclAmountChange(22083.33);
          setCategory('Commercial Wholesale Distribution');
        } else if (nameLower.includes('mithuru') || nameLower.includes('hardware')) {
          setSupplierName('Mithuru Hardware');
          setSupplierTin('1010039GST501');
          setInvoiceNumber('18210/26');
          handleExclAmountChange(36805.56);
          setCategory('Hardware & Fasteners');
        } else {
          const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setSupplierName(clean.substring(0, 32));
          setSupplierTin('1000000GST501');
          setInvoiceNumber(`INV/2026/${Math.floor(10000 + Math.random() * 90000)}`);
          handleExclAmountChange(15000);
        }
      }, 700);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('Please enter supplier name');
      return;
    }

    const totalGst = (Number(gst8) || 0) + (Number(gst6) || 0) + (Number(gst16) || 0);
    const grand = (Number(invoiceTotalExclGst) || 0) + totalGst;

    const newDoc: SupplierDocument = {
      id: `sup-doc-${Date.now()}`,
      fileName: fileName || `${supplierName.replace(/\s+/g, '_')}_Tax_Invoice.pdf`,
      supplierName,
      supplierTin: supplierTin.toUpperCase(),
      invoiceNumber: invoiceNumber || `INV/2026/${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceDate,
      invoiceTotalExclGst: Number(invoiceTotalExclGst) || 0,
      gst6: Number(gst6) || 0,
      gst8: Number(gst8) || 0,
      gst12: 0,
      gst16: Number(gst16) || 0,
      gst17: 0,
      totalGst,
      totalAmount: grand,
      taxableActivityNumber: Number(taxableActivityNumber) || 1,
      revenueOrCapital,
      fileSize: selectedFile ? selectedFile.size : 165000,
      fileType: selectedFile?.type || 'application/pdf',
      status: 'verified',
      category,
      notes,
      uploadDate: new Date().toISOString(),
      userId: currentUser.id,
    };

    onUpload(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              MIRA
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Archive Maldives Supplier Invoice</h2>
              <p className="text-xs text-slate-500">
                Pushes directly into MIRA Input Tax Deduction Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* File Picker */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-emerald-500 bg-slate-50/50 transition-colors relative cursor-pointer">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="font-semibold text-slate-800 text-sm">
                {selectedFile ? selectedFile.name : 'Upload Maldives Supplier PDF Invoice'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Auto-indexes supplier TIN, invoice number, and 8% GST into MIRA template
              </p>
              {selectedFile && (
                <span className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Ready to Archive ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>

          {isSimulatingOcr && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-900 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Scanning PDF document and auto-extracting Maldives Supplier TIN & GST...</span>
            </div>
          )}

          {/* Supplier Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier Business Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. UTHURU BUILDWARE PVT LTD"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Supplier TIN */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supplier MIRA TIN *</label>
              <input
                type="text"
                required
                placeholder="1183672GST501"
                value={supplierTin}
                onChange={(e) => setSupplierTin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
              />
            </div>

            {/* Supplier Invoice Number */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Supplier Invoice Number *</label>
              <input
                type="text"
                required
                placeholder="INV/2026/00037"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Invoice Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Date *</label>
              <input
                type="text"
                required
                placeholder="Thursday 2 July 2026"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            {/* Total Excl GST */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Total (Excl. GST) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={invoiceTotalExclGst}
                onChange={(e) => handleExclAmountChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>

            {/* GST 8% */}
            <div>
              <label className="block font-semibold text-emerald-900 mb-1">GST Charged at 8% (MVR) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={gst8}
                onChange={(e) => setGst8(Number(e.target.value))}
                className="w-full px-3 py-2 border border-emerald-300 rounded-lg font-mono font-bold text-emerald-800 bg-emerald-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Taxable Activity # */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Taxable Activity #</label>
              <input
                type="number"
                min={1}
                value={taxableActivityNumber}
                onChange={(e) => setTaxableActivityNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-center"
              />
            </div>

            {/* Revenue / Capital */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Revenue / Capital</label>
              <select
                aria-label="Revenue or Capital"
                value={revenueOrCapital}
                onChange={(e) => setRevenueOrCapital(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium"
              >
                <option value="Revenue">Revenue (Expense / Consumables)</option>
                <option value="Capital">Capital (Fixed Assets / Equipment)</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Procurement Category</label>
            <select
              aria-label="Procurement Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
            >
              {MALDIVES_EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Add to MIRA Input Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
