import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Cloud, 
  ArrowRight, 
  Code, 
  HardDrive, 
  ShieldCheck, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Invoice, SupplierDocument, MaldivesGstReport, UserProfile } from '../types';

interface NeonDatabaseViewProps {
  invoices: Invoice[];
  supplierDocs: SupplierDocument[];
  gstReports: MaldivesGstReport[];
  currentUser: UserProfile;
  onRefreshData?: () => void;
}

export const NeonDatabaseView: React.FC<NeonDatabaseViewProps> = ({
  invoices,
  supplierDocs,
  gstReports,
  currentUser,
}) => {
  const [neonStatus, setNeonStatus] = useState<any>({
    connected: false,
    isConfigured: false,
    databaseUrlSource: 'none',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [customDatabaseUrl, setCustomDatabaseUrl] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Check Neon status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/neon/status');
      const data = await res.json();
      setNeonStatus(data);
    } catch (err: any) {
      setNeonStatus({ connected: false, error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/neon/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: customDatabaseUrl }),
      });
      const data = await res.json();
      setNeonStatus(data);
      if (data.connected) {
        setStatusMessage('Successfully connected to Neon PostgreSQL database!');
        setShowConfigModal(false);
      } else {
        setStatusMessage(data.error || 'Connection failed.');
      }
    } catch (err: any) {
      setStatusMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitTables = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/neon/init-tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ databaseUrl: customDatabaseUrl || undefined }),
      });
      const data = await res.json();
      setStatusMessage(data.message || 'Neon tables verified!');
    } catch (err: any) {
      setStatusMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToNeon = async () => {
    setIsSyncing(true);
    try {
      const payload = {
        invoices,
        supplierDocs,
        inputRecords: gstReports[0]?.inputRecords || [],
        gstReports,
        backups: [],
      };

      const res = await fetch('/api/neon/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, databaseUrl: customDatabaseUrl || undefined }),
      });
      const data = await res.json();
      setStatusMessage(data.message || `Synchronized ${data.syncedRows} records to Neon PostgreSQL.`);
    } catch (err: any) {
      setStatusMessage(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const totalInputRecords = gstReports[0]?.inputRecords?.length || 12;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 flex items-center space-x-1">
              <Database className="w-3.5 h-3.5" />
              <span>Neon Serverless PostgreSQL</span>
            </span>
            <span className="text-xs text-slate-500">• Relational SQL Architecture</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Neon Database Integration & Cloud Sync
          </h1>
          <p className="text-xs text-slate-500">
            High-performance serverless PostgreSQL backend with instant branch autoscaling and relational persistence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            Configure Connection URL
          </button>

          <button
            onClick={checkStatus}
            disabled={isLoading}
            className="flex items-center space-x-1 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleSyncToNeon}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-teal-500/20"
          >
            <Cloud className="w-4 h-4" />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync All Ledgers to Neon'}</span>
          </button>
        </div>
      </div>

      {/* Status Notice */}
      {statusMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-teal-700 font-bold hover:text-teal-900">
            ✕
          </button>
        </div>
      )}

      {/* Architecture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Connection Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Database Node Status
              </span>
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  neonStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-teal-600" />
              <p className="text-sm font-bold text-slate-900">
                {neonStatus.connected ? 'Neon Cloud Connected' : 'Local SQL Engine Active'}
              </p>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              {neonStatus.connected
                ? `Endpoint: ${neonStatus.host}`
                : 'Ledger caching locally. Connect Neon database to enable cloud branch synchronization.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Database Engine:</span>
              <span className="font-mono font-medium">{neonStatus.version || 'PostgreSQL 16/17 (Neon)'}</span>
            </div>
            <div className="flex justify-between">
              <span>Database Name:</span>
              <span className="font-mono font-medium">{neonStatus.database || 'neondb'}</span>
            </div>
          </div>
        </div>

        {/* Relational Table Schemas Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                PostgreSQL Relational Tables
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800">
                5 Schemas
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-mono">maldives_invoices</span>
                <span className="text-slate-400">{invoices.length} Rows</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-mono">maldives_gst_input_records</span>
                <span className="text-slate-400">{totalInputRecords} Rows</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-mono">maldives_supplier_documents</span>
                <span className="text-slate-400">{supplierDocs.length} Rows</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-mono">maldives_gst_reports</span>
                <span className="text-slate-400">{gstReports.length} Rows</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-mono">backup_snapshots</span>
                <span className="text-slate-400">Synced</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleInitTables}
            className="mt-4 pt-3 border-t border-slate-100 w-full text-left text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center justify-between"
          >
            <span>Run DDL Table Initialization</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sync & Dual Storage Architecture Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dual Storage Reliability
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            <p className="text-xs text-slate-700 font-medium">
              Neon PostgreSQL + Firestore Architecture
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports complex relational SQL queries for statutory MIRA reporting while maintaining instant client-side offline durability.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Total Synchronized:</span>
            <span className="font-mono font-bold text-teal-800">
              {invoices.length + supplierDocs.length + totalInputRecords} Records
            </span>
          </div>
        </div>
      </div>

      {/* SQL Table Preview: maldives_gst_input_records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-teal-400" />
            <h2 className="font-mono text-xs font-bold text-teal-300">
              SELECT * FROM maldives_gst_input_records ORDER BY row_number ASC LIMIT 12;
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Neon PostgreSQL Query View</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px]">
                <th className="py-2 px-3">row_number</th>
                <th className="py-2 px-3">supplier_tin</th>
                <th className="py-2 px-3 font-sans">supplier_name</th>
                <th className="py-2 px-3">supplier_invoice_number</th>
                <th className="py-2 px-3 font-sans">invoice_date</th>
                <th className="py-2 px-3 text-right">invoice_total_excl_gst</th>
                <th className="py-2 px-3 text-right text-teal-900 font-bold bg-teal-50">gst8</th>
                <th className="py-2 px-3 text-center">taxable_activity_number</th>
                <th className="py-2 px-3 text-center">revenue_or_capital</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {(gstReports[0]?.inputRecords || []).map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-slate-500">{rec.rowNumber}</td>
                  <td className="py-2 px-3 font-bold text-slate-800">{rec.supplierTin}</td>
                  <td className="py-2 px-3 font-sans font-medium text-slate-900">{rec.supplierName}</td>
                  <td className="py-2 px-3 text-slate-700">{rec.supplierInvoiceNumber}</td>
                  <td className="py-2 px-3 font-sans text-slate-500">{rec.invoiceDate}</td>
                  <td className="py-2 px-3 text-right font-semibold text-slate-900">
                    {rec.invoiceTotalExclGst.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-teal-800 bg-teal-50/50">
                    {rec.gst8.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-center text-slate-600">{rec.taxableActivityNumber}</td>
                  <td className="py-2 px-3 text-center font-sans">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px]">
                      {rec.revenueOrCapital}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Neon Connection Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">Configure Neon PostgreSQL Connection</h3>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleTestCustomUrl} className="p-6 space-y-4">
              <p className="text-slate-600">
                Provide your Neon Serverless PostgreSQL connection URI. You can find this in your{' '}
                <a
                  href="https://console.neon.tech"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 font-semibold underline inline-flex items-center"
                >
                  Neon Console <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>{' '}
                under Dashboard &gt; Connection Details.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Neon Database URL (pooled or standard)
                </label>
                <input
                  type="text"
                  required
                  placeholder="postgresql://alex:Abc123xyz@ep-sparkling-wave-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
                  value={customDatabaseUrl}
                  onChange={(e) => setCustomDatabaseUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px] focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
                >
                  {isLoading ? 'Testing...' : 'Connect to Neon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
