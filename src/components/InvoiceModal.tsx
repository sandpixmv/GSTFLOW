import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType, InvoiceStatus, UserProfile, MaldivesGstRate, RevenueOrCapital } from '../types';
import { formatMvr } from '../utils/pdfGenerator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Partial<Invoice>) => void;
  initialInvoice?: Invoice | null;
  company: UserProfile;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialInvoice,
  company,
}) => {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('sales');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [counterpartyName, setCounterpartyName] = useState('');
  const [counterpartyTin, setCounterpartyTin] = useState('');
  const [counterpartyAddress, setCounterpartyAddress] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<InvoiceStatus>('pending');
  const [sector, setSector] = useState<'General' | 'Tourism'>('General');
  const [revenueOrCapital, setRevenueOrCapital] = useState<RevenueOrCapital>('Revenue');
  const [taxableActivityNumber, setTaxableActivityNumber] = useState<number>(1);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Commercial Goods & Services (General Sector)',
      quantity: 1,
      unitPrice: 25000,
      gstRate: 8,
      taxableAmount: 25000,
      gstAmount: 2000,
      total: 27000,
      revenueOrCapital: 'Revenue',
    },
  ]);

  useEffect(() => {
    if (initialInvoice) {
      setInvoiceType(initialInvoice.type);
      setInvoiceNumber(initialInvoice.invoiceNumber);
      setCounterpartyName(initialInvoice.counterpartyName);
      setCounterpartyTin(initialInvoice.counterpartyTin);
      setCounterpartyAddress(initialInvoice.counterpartyAddress || '');
      setInvoiceDate(initialInvoice.invoiceDate);
      setDueDate(initialInvoice.dueDate);
      setStatus(initialInvoice.status);
      setSector(initialInvoice.sector);
      setRevenueOrCapital(initialInvoice.revenueOrCapital || 'Revenue');
      setTaxableActivityNumber(initialInvoice.taxableActivityNumber || 1);
      setNotes(initialInvoice.notes || '');
      setItems(initialInvoice.items);
    } else {
      const prefix = invoiceType === 'sales' ? 'INV' : 'SBM';
      const year = new Date().getFullYear();
      const rand = Math.floor(10000 + Math.random() * 90000);
      setInvoiceNumber(`${prefix}/${year}/${rand}`);
      setCounterpartyName('');
      setCounterpartyTin('');
      setCounterpartyAddress('');
      setNotes('');
    }
  }, [initialInvoice, isOpen, invoiceType]);

  if (!isOpen) return null;

  const calculateItem = (qty: number, price: number, rate: MaldivesGstRate) => {
    const taxable = qty * price;
    const gst = Math.round((taxable * rate) / 100 * 100) / 100;
    return {
      taxableAmount: taxable,
      gstAmount: gst,
      total: taxable + gst,
    };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const cur = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice' || field === 'gstRate') {
        const calcs = calculateItem(
          Number(cur.quantity) || 0,
          Number(cur.unitPrice) || 0,
          Number(cur.gstRate) as MaldivesGstRate
        );
        updated[index] = { ...cur, ...calcs };
      } else {
        updated[index] = cur;
      }
      return updated;
    });
  };

  const handleAddItem = () => {
    const defaultRate = sector === 'General' ? 8 : 16;
    const newItem: InvoiceItem = {
      id: `it-${Date.now()}`,
      description: 'Commercial Goods Supply',
      quantity: 1,
      unitPrice: 10000,
      gstRate: defaultRate as MaldivesGstRate,
      taxableAmount: 10000,
      gstAmount: (10000 * defaultRate) / 100,
      total: 10000 + (10000 * defaultRate) / 100,
      revenueOrCapital: 'Revenue',
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals
  const taxableSubtotal = items.reduce((s, it) => s + (it.taxableAmount || 0), 0);
  const gst6 = items.filter(it => it.gstRate === 6).reduce((s, it) => s + it.gstAmount, 0);
  const gst8 = items.filter(it => it.gstRate === 8).reduce((s, it) => s + it.gstAmount, 0);
  const gst12 = items.filter(it => it.gstRate === 12).reduce((s, it) => s + it.gstAmount, 0);
  const gst16 = items.filter(it => it.gstRate === 16).reduce((s, it) => s + it.gstAmount, 0);
  const gst17 = items.filter(it => it.gstRate === 17).reduce((s, it) => s + it.gstAmount, 0);
  const totalGst = gst6 + gst8 + gst12 + gst16 + gst17;
  const grandTotal = taxableSubtotal + totalGst;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterpartyName.trim()) {
      alert('Please enter supplier or customer name');
      return;
    }

    onSave({
      id: initialInvoice ? initialInvoice.id : `inv-${Date.now()}`,
      invoiceNumber,
      type: invoiceType,
      counterpartyName,
      counterpartyTin: counterpartyTin.toUpperCase(),
      counterpartyAddress,
      invoiceDate,
      dueDate,
      status,
      items,
      taxableSubtotal,
      gst6,
      gst8,
      gst12,
      gst16,
      gst17,
      totalGst,
      grandTotal,
      taxableActivityNumber,
      revenueOrCapital,
      sector,
      notes,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              MIRA
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialInvoice ? `Edit Invoice: ${initialInvoice.invoiceNumber}` : 'Record Maldives Invoice (MVR)'}
              </h2>
              <p className="text-xs text-slate-500">
                General Sector (8% GST) & Tourism Sector (16% / 17% TGST)
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Type</label>
              <select
                aria-label="Invoice Type"
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium"
              >
                <option value="sales">Sales Invoice (Customer)</option>
                <option value="purchase">Purchase Voucher (Supplier)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Counterparty & MIRA TIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                {invoiceType === 'sales' ? 'Customer / Client Name *' : 'Supplier / Vendor Name *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UTHURU BUILDWARE PVT LTD or Resort Name"
                value={counterpartyName}
                onChange={(e) => setCounterpartyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Supplier / Customer MIRA TIN
              </label>
              <input
                type="text"
                placeholder="e.g. 1183672GST501"
                value={counterpartyTin}
                onChange={(e) => setCounterpartyTin(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Taxable Activity #</label>
              <input
                type="number"
                min={1}
                value={taxableActivityNumber}
                onChange={(e) => setTaxableActivityNumber(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-center"
              />
            </div>
          </div>

          {/* Sector & Revenue/Capital Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Maldives Tax Sector</label>
              <select
                aria-label="Maldives Tax Sector"
                value={sector}
                onChange={(e) => setSector(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg font-medium text-emerald-900"
              >
                <option value="General">General Sector (Standard 8% GST)</option>
                <option value="Tourism">Tourism Sector (16% / 17% TGST)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-emerald-950 mb-1">Expense Classification</label>
              <select
                aria-label="Expense Classification"
                value={revenueOrCapital}
                onChange={(e) => setRevenueOrCapital(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg font-medium text-emerald-900"
              >
                <option value="Revenue">Revenue (Operational / Consumables)</option>
                <option value="Capital">Capital (Fixed Asset / Equipment)</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Goods & Services Line Items (MVR)</span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg border border-emerald-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-32">Unit Price (Excl. GST)</th>
                    <th className="py-2.5 px-3 w-24">GST %</th>
                    <th className="py-2.5 px-3 w-28 text-right">GST Amount</th>
                    <th className="py-2.5 px-3 w-32 text-right">Total (MVR)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="bg-white">
                      <td className="p-2">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min={1}
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-center"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          aria-label={`GST rate for line item ${index + 1}`}
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(index, 'gstRate', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded font-bold text-slate-800"
                        >
                          <option value={8}>8% (General Standard)</option>
                          <option value={16}>16% (Tourism TGST)</option>
                          <option value={17}>17% (Tourism 2026)</option>
                          <option value={0}>0% (Zero-Rated)</option>
                          <option value={6}>6% (Prior General)</option>
                          <option value={12}>12% (Prior TGST)</option>
                        </select>
                      </td>

                      <td className="p-2 font-mono text-emerald-700 text-right font-medium">
                        {formatMvr(item.gstAmount)}
                      </td>

                      <td className="p-2 font-mono font-bold text-slate-900 text-right">
                        {formatMvr(item.total)}
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Invoice Notes / MIRA Remarks</label>
              <textarea
                rows={3}
                placeholder="Bank of Maldives account, quotation ref, statutory tax note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-medium">
              <div className="flex justify-between text-slate-600">
                <span>Invoice Total (Excl. GST):</span>
                <span className="font-mono">{formatMvr(taxableSubtotal)}</span>
              </div>

              {gst8 > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>GST Charged at 8%:</span>
                  <span className="font-mono">{formatMvr(gst8)}</span>
                </div>
              )}

              {(gst16 > 0 || gst17 > 0) && (
                <div className="flex justify-between text-slate-600">
                  <span>TGST Charged at 16%/17%:</span>
                  <span className="font-mono">{formatMvr(gst16 + gst17)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Payable (MVR):</span>
                <span className="font-mono text-emerald-700 text-base">{formatMvr(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialInvoice ? 'Save Changes' : 'Generate & Save Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
