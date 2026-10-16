import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Check, 
  X, 
  LogIn, 
  LogOut, 
  Fingerprint 
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { ROLE_PRESETS } from '../data/mockData';

interface RolesSecurityViewProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  onUpdateCompanyProfile: (profile: Partial<UserProfile>) => void;
  isFirebaseUser: boolean;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const RolesSecurityView: React.FC<RolesSecurityViewProps> = ({
  currentUser,
  onRoleChange,
  onUpdateCompanyProfile,
  isFirebaseUser,
  onGoogleSignIn,
  onSignOut,
}) => {
  const [companyName, setCompanyName] = useState(currentUser.companyName);
  const [tin, setTin] = useState(currentUser.tin);
  const [address, setAddress] = useState(currentUser.address);
  const [atollOrCity, setAtollOrCity] = useState(currentUser.atollOrCity);
  const [taxableActivityNumber, setTaxableActivityNumber] = useState(currentUser.taxableActivityNumber || 1);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile({
      companyName,
      tin: tin.toUpperCase(),
      address,
      atollOrCity,
      taxableActivityNumber,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const permissionList = [
    { key: 'canCreateInvoices', label: 'Create & Issue Sales Invoices (MVR)' },
    { key: 'canEditInvoices', label: 'Edit Existing Records & Line Items' },
    { key: 'canDeleteInvoices', label: 'Delete Records & Invoices' },
    { key: 'canManageGst', label: 'MIRA 205 Return Filing & Input Tax Sign-off' },
    { key: 'canExportReports', label: 'Export MIRA PDF Statements & Returns' },
    { key: 'canManageBackups', label: 'Automated Cloud Backup & Restore' },
    { key: 'canVerifySupplierDocs', label: 'Verify Supplier Vault PDF Invoices' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Maldives Enterprise RBAC
            </span>
            <span className="text-xs text-slate-500">• Granular Role-Based Security</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            User Roles & Granular Permission Security
          </h1>
          <p className="text-xs text-slate-500">
            Control access across accounting personnel, financial managers, and external MIRA tax auditors.
          </p>
        </div>

        {/* Current Active User Card */}
        <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
            {currentUser.displayName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-800">{currentUser.displayName}</p>
            <p className="text-slate-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Role Selection & Active Profile Switcher */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(Object.keys(ROLE_PRESETS) as UserRole[]).map((r) => {
          const roleData = ROLE_PRESETS[r];
          const isSelected = currentUser.role === r;

          return (
            <div
              key={r}
              onClick={() => onRoleChange(r)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isSelected ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                />
                {isSelected && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active Session
                  </span>
                )}
              </div>
              <h2 className="font-bold text-slate-900 text-sm mb-1">{roleData.label}</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                {roleData.description}
              </p>
              <button
                type="button"
                className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSelected ? 'Current Role' : 'Switch to this Role'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Granular Permission Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Granular Operational Permission Matrix
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            Permissions reflect instantly across all screens
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-600">
                <th className="py-3 px-4 font-semibold w-2/5">Capability / Operation</th>
                <th className="py-3 px-3 font-semibold text-center">Admin</th>
                <th className="py-3 px-3 font-semibold text-center">Finance Manager</th>
                <th className="py-3 px-3 font-semibold text-center">Senior Accountant</th>
                <th className="py-3 px-3 font-semibold text-center">Statutory Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissionList.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-800">{perm.label}</td>

                  {/* Admin */}
                  <td className="py-3 px-3 text-center">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>

                  {/* Finance Manager */}
                  <td className="py-3 px-3 text-center">
                    {ROLE_PRESETS.finance_manager.permissions[perm.key as keyof typeof ROLE_PRESETS.finance_manager.permissions] ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  {/* Accountant */}
                  <td className="py-3 px-3 text-center">
                    {ROLE_PRESETS.accountant.permissions[perm.key as keyof typeof ROLE_PRESETS.accountant.permissions] ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>

                  {/* Auditor */}
                  <td className="py-3 px-3 text-center">
                    {ROLE_PRESETS.auditor.permissions[perm.key as keyof typeof ROLE_PRESETS.auditor.permissions] ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organization Tax Profile & Authentication State */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Registered Maldives Tax Entity Profile
            </h2>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">MIRA TIN</label>
                <input
                  type="text"
                  required
                  value={tin}
                  onChange={(e) => setTin(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Taxable Activity #</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={taxableActivityNumber}
                  onChange={(e) => setTaxableActivityNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-center"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registered Address (Maldives)</label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {isSaved && (
                <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                  <Check className="w-4 h-4" /> <span>Profile updated!</span>
                </span>
              )}
              <button
                type="submit"
                disabled={!currentUser.permissions.canManageBackups}
                className="ml-auto px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-40 text-white font-semibold rounded-xl transition-all shadow-sm"
              >
                Save Entity Profile
              </button>
            </div>
          </form>
        </div>

        {/* Authentication Security */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Fingerprint className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                Authentication & Session Security
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Identity Provider:</span>
                <span className="font-semibold text-slate-800">Firebase Authentication</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-700">
                  {isFirebaseUser ? 'Google OAuth Active' : 'Simulated Authenticated Session'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Security Token:</span>
                <span className="font-mono text-[10px] text-slate-600">JWT 256-SHA • Auto Refresh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sign-in Email:</span>
                <span className="font-mono text-slate-800">{currentUser.email}</span>
              </div>
            </div>
          </div>

          <div>
            {isFirebaseUser ? (
              <button
                onClick={onSignOut}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 transition-colors flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect Google Session</span>
              </button>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-emerald-500/20 flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Authenticate with Google Account</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
