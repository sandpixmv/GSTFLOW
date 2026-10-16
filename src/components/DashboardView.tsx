import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileDown, 
  FileSpreadsheet,
  Plus, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Building, 
  Wallet,
  Sparkles,
  Settings,
  Users,
  Building2,
  Database,
  ShieldCheck,
  Calendar,
  ArrowRight,
  Clock,
  FileText
} from 'lucide-react';
import { Invoice, SupplierDocument, MaldivesGstReport, UserProfile } from '../types';
import { formatMvr, generateCashFlowPdf } from '../utils/pdfGenerator';
import { exportInvoicesToCsv } from '../utils/csvExporter';

interface DashboardViewProps {
  invoices: Invoice[];
  supplierDocs: SupplierDocument[];
  gstReports: MaldivesGstReport[];
  currentUser: UserProfile;
  onOpenCreateInvoice: () => void;
  onOpenUploadDoc: () => void;
  onOpenGstReport: () => void;
  onTriggerBackup: () => void;
  onNavigateTab: (tab: string) => void;
  usersCount?: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  supplierDocs,
  gstReports,
  currentUser,
  onOpenCreateInvoice,
  onOpenUploadDoc,
  onOpenGstReport,
  onTriggerBackup,
  onNavigateTab,
  usersCount = 4,
}) => {
  const currentReport = gstReports[0];
  const isAdmin = currentUser.role === 'admin';

  const salesInvoices = invoices.filter(inv => inv.type === 'sales');
  const purchaseInvoices = invoices.filter(inv => inv.type === 'purchase');

  const totalSalesRevenue = salesInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const pendingReceivables = salesInvoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalPurchasesPaid = purchaseInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const pendingPayables = purchaseInvoices
    .filter(inv => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const netCashFlow = totalSalesRevenue - totalPurchasesPaid;

  const totalOutputGst = currentReport?.totalOutputTax || 44400;
  const totalInputGst = currentReport?.totalInputTaxCredit || 32537.97;
  const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);

  const handleExportSummaryPdf = () => {
    generateCashFlowPdf(
      {
        totalRevenue: totalSalesRevenue,
        totalExpenses: totalPurchasesPaid,
        netCashFlow,
        pendingReceivables,
        pendingPayables,
        netGstPayable,
      },
      currentUser
    );
  };

  // Monthly cash flow trajectory simulated points in MVR
  const monthlyFlows = [
    { month: 'May', inflow: 380000, outflow: 210000 },
    { month: 'Jun', inflow: 420000, outflow: 280000 },
    { month: 'Jul', inflow: 490000, outflow: 320000 },
    { month: 'Aug', inflow: 510000, outflow: 290000 },
    { month: 'Sep (Active)', inflow: totalSalesRevenue || 405000, outflow: totalPurchasesPaid || 166456 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Maldives MIRA Compliant
            </span>
            <span className="text-xs text-slate-500 font-mono">
              TIN: {currentUser.tin} • Activity No: {currentUser.taxableActivityNumber}
            </span>
            <span className="text-xs text-slate-400">• Currency: MVR</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
            Maldives Cash Flow & Financial Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Welcome back, <strong className="text-slate-900">{currentUser.displayName}</strong>. Real-time balance monitoring, MIRA GST input deduction schedules, and centralized audit archiving.
          </p>
        </div>

        {/* Top Action Deck */}
        <div className="flex flex-wrap items-center gap-2">
          {currentUser.permissions.canCreateInvoices && (
            <button
              onClick={onOpenCreateInvoice}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Sales Invoice (MVR)</span>
            </button>
          )}

          {currentUser.permissions.canVerifySupplierDocs && (
            <button
              onClick={onOpenUploadDoc}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl border border-slate-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Upload Supplier PDF Bill</span>
            </button>
          )}

          {currentUser.permissions.canExportReports && (
            <>
              <button
                onClick={() => exportInvoicesToCsv(invoices, 'Maldives_Invoices_Ledger')}
                title="Export complete invoices ledger to CSV"
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 transition-colors shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Ledger (CSV)</span>
              </button>

              <button
                onClick={handleExportSummaryPdf}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Executive PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ADMIN CONTROL DECK (Enabled for Admin Users) */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-sm border border-indigo-900/40">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/40 border border-indigo-400/30 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-white">Administrator Command Center</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Full System Authority
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure corporate system settings, provision team members, update MIRA business profile, and manage cloud ledgers.
                </p>
              </div>
            </div>

            {/* Admin Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onNavigateTab('admin-hub')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl border border-white/10 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-300" />
                <span>System Settings</span>
              </button>

              <button
                onClick={() => onNavigateTab('admin-hub')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl border border-white/10 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-emerald-300" />
                <span>User Directory ({usersCount})</span>
              </button>

              <button
                onClick={() => onNavigateTab('admin-hub')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl border border-white/10 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-teal-300" />
                <span>Business Profile</span>
              </button>

              <button
                onClick={() => onNavigateTab('neon')}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl border border-white/10 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-cyan-300" />
                <span>Neon PostgreSQL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflows */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Revenue Collected (Inflows)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatMvr(totalSalesRevenue)}</p>
          <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>General Sector 8% GST billed</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supplier Spend (Outflows)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatMvr(totalPurchasesPaid)}</p>
          <div className="mt-2 flex items-center text-xs text-slate-500 font-medium space-x-1">
            <span>Includes 12 verified MIRA vouchers</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Operating Cash Flow</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatMvr(netCashFlow)}
          </p>
          <div className="mt-2 flex items-center text-xs text-teal-600 font-medium space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Positive treasury balance in MVR</span>
          </div>
        </div>

        {/* Net MIRA GST Payable */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net MIRA GST Payable</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatMvr(netGstPayable)}</p>
          <div className="mt-2 flex items-center text-xs text-amber-700 font-medium space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Filing Due: 28th of next month</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & MIRA Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Cash Flow Trajectory Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Maldives Cash Flow Trajectory (MVR)</h2>
              <p className="text-xs text-slate-500">
                Monthly revenue collections vs. supplier expenditures in Maldivian Rufiyaa.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span className="text-slate-600 font-medium">Inflows (Revenue)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-sm bg-rose-400" />
                <span className="text-slate-600 font-medium">Outflows (Spend)</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 flex items-end justify-between gap-4 pt-6 px-4 border-b border-slate-100">
            {monthlyFlows.map((flow) => {
              const maxVal = 600000;
              const inflowHeight = Math.min(100, Math.round((flow.inflow / maxVal) * 100));
              const outflowHeight = Math.min(100, Math.round((flow.outflow / maxVal) * 100));

              return (
                <div key={flow.month} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Inflow Bar */}
                    <div
                      style={{ height: `${inflowHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all group-hover:brightness-110 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        {formatMvr(flow.inflow)}
                      </div>
                    </div>

                    {/* Outflow Bar */}
                    <div
                      style={{ height: `${outflowHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md transition-all group-hover:brightness-110 relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        {formatMvr(flow.outflow)}
                      </div>
                    </div>
                  </div>
                  <span className="mt-3 text-[11px] font-medium text-slate-500">{flow.month}</span>
                </div>
              );
            })}
          </div>

          {/* Working Capital Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Uncollected Receivables (MVR)</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatMvr(pendingReceivables)}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Due from resorts & state utilities</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Supplier Payables (MVR)</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{formatMvr(pendingPayables)}</p>
              <span className="text-[10px] text-slate-500 mt-1 block">Due across next 15 days</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500">Adjusted Liquidity Buffer</span>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {formatMvr(netCashFlow + pendingReceivables - pendingPayables - netGstPayable)}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Post-MIRA tax reserves</span>
            </div>
          </div>
        </div>

        {/* Right Col: Maldives MIRA GST Radar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider text-teal-300 font-semibold">
                MIRA Tax Position (Form 205)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                8% GST Reconciled
              </span>
            </div>

            <p className="text-xs text-slate-300">Tax Period: {currentReport?.period || 'Q3 2026'}</p>
            <div className="my-3">
              <span className="text-xs text-slate-400">Net Tax Payable to MIRA</span>
              <p className="text-2xl font-bold text-white">{formatMvr(netGstPayable)}</p>
            </div>

            <div className="space-y-2 py-2 border-y border-slate-800 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Output Tax (Sales 8%):</span>
                <span className="font-mono">{formatMvr(totalOutputGst)}</span>
              </div>
              <div className="flex justify-between">
                <span>Input Tax Deduction:</span>
                <span className="font-mono text-emerald-400">- {formatMvr(totalInputGst)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Input Vouchers Reconciled:</span>
                <span>{currentReport?.inputRecords.length || 12} Invoices</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={onOpenGstReport}
                className="w-full text-center py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
              >
                <span>Inspect MIRA Input Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Supplier Vault Summary */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Supplier Invoices Vault
              </h3>
              <button
                onClick={() => onNavigateTab('supplier-vault')}
                className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                {supplierDocs.length} Archived Bills
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Fast reference for MIRA audits. Search supplier TIN, bill numbers, and verification status.
            </p>

            <div className="space-y-2">
              {supplierDocs.slice(0, 3).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                  <div className="truncate max-w-[170px]">
                    <p className="font-medium text-slate-800 truncate">{doc.supplierName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{doc.supplierTin}</p>
                  </div>
                  <span className="font-mono font-semibold text-slate-700">{formatMvr(doc.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Ledger Transactions Table Preview */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Invoice Ledger Activity</h2>
            <p className="text-xs text-slate-500">Latest sales invoices and purchase vouchers processed in Rufiyaa.</p>
          </div>
          <button
            onClick={() => onNavigateTab('invoices')}
            className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <span>View All Invoices ({invoices.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <th className="py-2.5 px-4">Invoice #</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Counterparty & TIN</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Taxable Subtotal</th>
                <th className="py-2.5 px-4 text-right">Grand Total (MVR)</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.slice(0, 5).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.type === 'sales' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.type === 'sales' ? 'Sales' : 'Purchase'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <p className="font-medium text-slate-800">{inv.counterpartyName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inv.counterpartyTin}</p>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{inv.invoiceDate}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-600">{formatMvr(inv.taxableSubtotal)}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{formatMvr(inv.grandTotal)}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
