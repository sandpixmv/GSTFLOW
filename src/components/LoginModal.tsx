import React, { useState } from 'react';
import { 
  Building2, 
  LogIn, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  Sparkles, 
  X,
  KeyRound,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { ROLE_PRESETS } from '../data/mockData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
  onQuickRoleLogin: (role: UserRole, customName?: string, customEmail?: string) => void;
  currentRole: UserRole;
  isFirebaseUser: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleSignIn,
  onQuickRoleLogin,
  currentRole,
  isFirebaseUser,
}) => {
  const [tab, setTab] = useState<'quick' | 'email'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onQuickRoleLogin(
        selectedRole,
        displayName || (selectedRole === 'admin' ? 'Chief Administrator' : 'Staff Member'),
        email || 'user@dhivehicommercial.mv'
      );
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scale-up">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 text-white text-center">
          <button
            onClick={onClose}
            aria-label="Close Login Modal"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/30 mb-3">
            <Building2 className="w-6 h-6 text-white" />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>Maldives MIRA Secure Gateway</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight">TaxFlow Pro Authentication</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Sign in to access corporate invoice ledgers, statutory MIRA GST filings, and system administration.
          </p>

          {/* Mode Tabs */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl mt-5 max-w-xs mx-auto border border-white/10 text-xs">
            <button
              onClick={() => setTab('quick')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                tab === 'quick' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1-Click Role Login
            </button>
            <button
              onClick={() => setTab('email')}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                tab === 'email' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email & Credentials
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Google Sign In Banner */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                onGoogleSignIn();
                onClose();
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 hover:border-slate-400 shadow-sm transition-all flex items-center justify-center space-x-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google Account</span>
            </button>
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[11px] text-slate-400 uppercase font-medium">Or Select Test Profile</span>
            </div>
          </div>

          {tab === 'quick' ? (
            /* Fast 1-Click Role Logins */
            <div className="space-y-2.5">
              {/* Admin Button */}
              <button
                type="button"
                onClick={() => {
                  onQuickRoleLogin('admin', 'Lead Financial Controller', 'sandpix.mv@gmail.com');
                  onClose();
                }}
                className={`w-full p-3 text-left rounded-2xl border transition-all flex items-center justify-between group ${
                  currentRole === 'admin'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ADM
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="font-bold text-slate-900 text-xs">Chief Administrator</p>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">Full Access</span>
                    </div>
                    <p className="text-[11px] text-slate-500">System settings, user creation, business profile & ledgers</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>

              {/* Finance Manager */}
              <button
                type="button"
                onClick={() => {
                  onQuickRoleLogin('finance_manager', 'Ahmed Naseem', 'naseem.finance@dhivehicommercial.mv');
                  onClose();
                }}
                className={`w-full p-3 text-left rounded-2xl border transition-all flex items-center justify-between group ${
                  currentRole === 'finance_manager'
                    ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    MGR
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Finance Manager</p>
                    <p className="text-[11px] text-slate-500">MIRA 205 filing, cash flow approval, and supplier audit</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>

              {/* Senior Accountant */}
              <button
                type="button"
                onClick={() => {
                  onQuickRoleLogin('accountant', 'Mariyam Shiuna', 'shiuna.accounts@dhivehicommercial.mv');
                  onClose();
                }}
                className={`w-full p-3 text-left rounded-2xl border transition-all flex items-center justify-between group ${
                  currentRole === 'accountant'
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    ACC
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Senior Accountant</p>
                    <p className="text-[11px] text-slate-500">Daily invoicing, purchase vouchers, and supplier bills entry</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              {/* Statutory Auditor */}
              <button
                type="button"
                onClick={() => {
                  onQuickRoleLogin('auditor', 'Hussain Latheef (MIRA Auditor)', 'hussain.audit@mira.gov.mv');
                  onClose();
                }}
                className={`w-full p-3 text-left rounded-2xl border transition-all flex items-center justify-between group ${
                  currentRole === 'auditor'
                    ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20'
                    : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                    AUD
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">Statutory GST Auditor</p>
                    <p className="text-[11px] text-slate-500">Strict read-only tax audit and statutory PDF/CSV export</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            </div>
          ) : (
            /* Custom Email & Password Sign In Form */
            <form onSubmit={handleEmailLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Rasheed"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.mv"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">System Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="admin">Chief Administrator (Full Access)</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="accountant">Senior Accountant</option>
                  <option value="auditor">Statutory GST Auditor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Session'}</span>
              </button>
            </form>
          )}

          {/* Security Notice Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>TLS 1.3 / AES-256 Cloud Sync</span>
            </span>
            <span>MIRA GST Law No. 10/2011</span>
          </div>
        </div>
      </div>
    </div>
  );
};
