import React from 'react';
import { 
  Menu, 
  Cloud, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  KeyRound, 
  ChevronRight,
  Shield,
  Building,
  Bell
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  isCloudSynced: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
  isFirebaseUser: boolean;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onOpenLoginModal: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onRoleChange,
  isCloudSynced,
  isSyncing,
  onManualSync,
  isFirebaseUser,
  onGoogleSignIn,
  onSignOut,
  onOpenLoginModal,
  onToggleMobileSidebar,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const tabLabels: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive Financial Dashboard',
      subtitle: 'Real-time cash flow, MIRA GST position, and working capital in MVR',
    },
    gst: {
      title: 'MIRA GST Return & Input Statement',
      subtitle: 'Form 205 statutory filing and 12-voucher deduction schedule',
    },
    invoices: {
      title: 'Business Invoices Ledger',
      subtitle: 'Sales invoices and purchase vouchers in Maldivian Rufiyaa',
    },
    'supplier-vault': {
      title: 'Supplier PDF Invoices Vault',
      subtitle: 'Centralized searchable archive of supplier bills with OCR tagging',
    },
    'admin-hub': {
      title: 'System Administration & Settings',
      subtitle: 'Enterprise settings, user creation, business profile, and permissions',
    },
    neon: {
      title: 'Neon Serverless PostgreSQL',
      subtitle: 'High-performance relational cloud database engine with branch autoscaling',
    },
    backups: {
      title: 'Automated Cloud Backups',
      subtitle: 'Encrypted snapshots, disaster recovery, and offline exports',
    },
  };

  const currentInfo = tabLabels[currentTab] || {
    title: 'TaxFlow Maldives',
    subtitle: 'MIRA compliant financial suite',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/90 shadow-xs flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile Toggle & Breadcrumb Title */}
      <div className="flex items-center space-x-3 truncate">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* View Breadcrumb */}
        <div className="truncate">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <span>TaxFlow Maldives</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold truncate">{currentInfo.title}</span>
          </div>
          <p className="text-[11px] text-slate-400 truncate hidden sm:block">
            {currentUser.companyName} • MIRA TIN: {currentUser.tin}
          </p>
        </div>
      </div>

      {/* Right Controls Deck */}
      <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
        {/* Cloud Sync Status Indicator */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-600 font-medium text-[11px] hidden md:inline">
            {isSyncing ? 'Syncing...' : isCloudSynced ? 'Neon Cloud' : 'Local'}
          </span>
          <button
            onClick={onManualSync}
            title="Force synchronization with cloud vault"
            className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Role Switcher Pill */}
        <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-500 hidden md:inline text-[11px]">Role:</span>
          <select
            aria-label="Switch active role"
            value={currentUser.role}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            className="bg-transparent text-slate-800 font-semibold text-xs focus:outline-none cursor-pointer pr-1"
          >
            <option value="admin">Chief Admin (Full Access)</option>
            <option value="finance_manager">Finance Manager</option>
            <option value="accountant">Senior Accountant</option>
            <option value="auditor">Statutory Auditor</option>
          </select>
        </div>

        {/* Auth / Switch Profile Modal Trigger */}
        <button
          onClick={onOpenLoginModal}
          title="Sign in with credentials or switch account"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Auth</span>
        </button>

        {/* Google / Account Button */}
        {isFirebaseUser ? (
          <div className="flex items-center space-x-1.5">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {currentUser.displayName.charAt(0)}
            </div>
            <button
              onClick={onSignOut}
              title="Sign Out of Google Session"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onGoogleSignIn}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all shadow-emerald-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
