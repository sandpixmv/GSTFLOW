import React, { useState } from 'react';
import { 
  Building2, 
  BarChart3, 
  Table, 
  FileText, 
  FolderArchive, 
  Database, 
  DatabaseBackup, 
  Settings, 
  Plus, 
  ShieldCheck, 
  KeyRound, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Cloud, 
  Sparkles,
  ExternalLink,
  Shield,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserProfile;
  invoicesCount: number;
  supplierDocsCount: number;
  onOpenCreateInvoice: () => void;
  onOpenLoginModal: () => void;
  onSignOut?: () => void;
  isCloudSynced: boolean;
  isSyncing: boolean;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  invoicesCount,
  supplierDocsCount,
  onOpenCreateInvoice,
  onOpenLoginModal,
  onSignOut,
  isCloudSynced,
  isSyncing,
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const navSections = [
    {
      title: 'Overview',
      items: [
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          shortLabel: 'Dashboard',
          icon: BarChart3,
          description: 'Cash flow & treasury',
        },
      ],
    },
    {
      title: 'Maldives Statutory Tax',
      items: [
        {
          id: 'gst',
          label: 'MIRA GST Statement',
          shortLabel: 'MIRA GST',
          icon: Table,
          badge: 'Form 205',
          description: 'Input deduction schedule',
        },
      ],
    },
    {
      title: 'Ledgers & Records',
      items: [
        {
          id: 'invoices',
          label: 'Business Invoices',
          shortLabel: 'Invoices',
          icon: FileText,
          badge: invoicesCount > 0 ? String(invoicesCount) : undefined,
          description: 'Sales & purchase vouchers',
        },
        {
          id: 'supplier-vault',
          label: 'Supplier PDF Vault',
          shortLabel: 'Vault',
          icon: FolderArchive,
          badge: supplierDocsCount > 0 ? String(supplierDocsCount) : undefined,
          description: 'Archived bills & receipts',
        },
      ],
    },
    {
      title: 'Platform & Database',
      items: [
        {
          id: 'admin-hub',
          label: 'Admin & System Settings',
          shortLabel: 'Settings',
          icon: Settings,
          badge: isAdmin ? 'Admin' : undefined,
          description: 'Users, profile & tax rules',
        },
        {
          id: 'neon',
          label: 'Neon PostgreSQL',
          shortLabel: 'Neon DB',
          icon: Database,
          description: 'Serverless cloud engine',
        },
        {
          id: 'backups',
          label: 'Automated Backups',
          shortLabel: 'Backups',
          icon: DatabaseBackup,
          description: 'Snapshots & recovery',
        },
      ],
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 text-slate-300 border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand & Workspace Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950">
          <button
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center space-x-3 text-left overflow-hidden group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    TaxFlow Pro
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 uppercase">
                    MIRA
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate font-mono">
                  TIN: {currentUser.tin}
                </p>
              </div>
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        {currentUser.permissions.canCreateInvoices && (!isCollapsed || isMobileOpen) && (
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={() => {
                onOpenCreateInvoice();
                if (isMobileOpen) setIsMobileOpen(false);
              }}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>New Sales Invoice (MVR)</span>
            </button>
          </div>
        )}

        {currentUser.permissions.canCreateInvoices && isCollapsed && !isMobileOpen && (
          <div className="px-3 pt-3 pb-1 flex justify-center">
            <button
              onClick={onOpenCreateInvoice}
              title="New Sales Invoice (MVR)"
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm flex items-center justify-center transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  {section.title}
                </p>
              )}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      title={isCollapsed && !isMobileOpen ? item.label : undefined}
                      className={`w-full flex items-center rounded-xl text-xs font-medium transition-all group ${
                        isCollapsed && !isMobileOpen
                          ? 'justify-center p-2.5'
                          : 'justify-between px-3 py-2'
                      } ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {(!isCollapsed || isMobileOpen) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {(!isCollapsed || isMobileOpen) && item.badge && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-700/60 text-white border border-white/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="space-y-2.5">
              {/* Sync Status Banner */}
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-slate-300 truncate">
                    {isSyncing ? 'Syncing Cloud...' : isCloudSynced ? 'Neon & Cloud Active' : 'Offline'}
                  </span>
                </div>
                <Cloud className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* User Account Capsule */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/90">
                <div className="flex items-center space-x-2.5 truncate">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {currentUser.displayName.charAt(0)}
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-bold text-white truncate">{currentUser.displayName}</p>
                    <p className="text-[10px] text-slate-400 truncate capitalize">
                      {currentUser.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={onOpenLoginModal}
                    title="Switch user account or authenticate"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>

                  {onSignOut && (
                    <button
                      onClick={onSignOut}
                      title="Log Out of system session"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Collapsed Footer Profile Icon */
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={onOpenLoginModal}
                title={`${currentUser.displayName} (${currentUser.role}) - Click to Switch`}
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 hover:border-emerald-500 transition-colors relative"
              >
                <span className="font-bold text-xs">{currentUser.displayName.charAt(0)}</span>
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                    isCloudSynced ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
