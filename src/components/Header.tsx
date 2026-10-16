import React from 'react';
import { 
  Building2, 
  Cloud, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  RefreshCw, 
  FileText, 
  BarChart3, 
  FolderArchive, 
  DatabaseBackup, 
  Users,
  Table,
  Database
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  isCloudSynced: boolean;
  isSyncing: boolean;
  onManualSync: () => void;
  isFirebaseUser: boolean;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onRoleChange,
  isCloudSynced,
  isSyncing,
  onManualSync,
  isFirebaseUser,
  onGoogleSignIn,
  onSignOut,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  TaxFlow Maldives
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full uppercase tracking-wider">
                  Neon + MIRA
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                TIN: {currentUser.tin} • Activity No: {currentUser.taxableActivityNumber}
              </p>
            </div>
          </div>

          {/* Center Cloud Sync Status */}
          <div className="hidden md:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <Cloud className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300 font-medium">
                {isSyncing ? 'Syncing Neon & Cloud...' : isCloudSynced ? 'Neon SQL & Cloud Active' : 'Local Storage'}
              </span>
            </div>
            <button
              onClick={onManualSync}
              title="Force Sync with Cloud Vault"
              className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Right Role & Auth Actions */}
          <div className="flex items-center space-x-3">
            {/* Role Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 hidden lg:inline">Role:</span>
              <select
                aria-label="Select user role"
                value={currentUser.role}
                onChange={(e) => onRoleChange(e.target.value as UserRole)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="admin" className="bg-slate-900 text-white">Admin (Full Access)</option>
                <option value="finance_manager" className="bg-slate-900 text-white">Finance Manager</option>
                <option value="accountant" className="bg-slate-900 text-white">Accountant</option>
                <option value="auditor" className="bg-slate-900 text-white">Auditor (MIRA Read-Only)</option>
              </select>
            </div>

            {/* Google / Account Button */}
            {isFirebaseUser ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-slate-200">{currentUser.displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{currentUser.email}</p>
                </div>
                <button
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-300 rounded-lg border border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow-sm transition-all shadow-emerald-500/25"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Auth</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <nav aria-label="Main Navigation" className="border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
            {[
              { id: 'dashboard', label: 'Cash Flow Dashboard (MVR)', icon: BarChart3 },
              { id: 'gst', label: 'Maldives GST Input Statement & Form 205', icon: Table },
              { id: 'invoices', label: 'Business Invoices (MVR)', icon: FileText },
              { id: 'supplier-vault', label: 'Supplier PDF Invoices Vault', icon: FolderArchive },
              { id: 'neon', label: 'Neon Database (PostgreSQL)', icon: Database },
              { id: 'backups', label: 'Automated Cloud Backups', icon: DatabaseBackup },
              { id: 'roles', label: 'Roles & Security', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};
