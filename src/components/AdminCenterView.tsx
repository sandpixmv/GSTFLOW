import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Check, 
  X, 
  LogIn, 
  LogOut, 
  Fingerprint, 
  Settings, 
  UserPlus, 
  Users, 
  Trash2, 
  Edit3, 
  Sliders, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  FileText,
  CreditCard,
  RefreshCw,
  Search,
  KeyRound,
  Phone,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';
import { UserProfile, UserRole, SystemUserAccount, SystemSettings } from '../types';
import { ROLE_PRESETS } from '../data/mockData';

interface AdminCenterViewProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  onUpdateCompanyProfile: (profile: Partial<UserProfile>) => void;
  systemSettings: SystemSettings;
  onUpdateSystemSettings: (settings: SystemSettings) => void;
  usersList: SystemUserAccount[];
  onCreateUser: (user: Omit<SystemUserAccount, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, updates: Partial<SystemUserAccount>) => void;
  onDeleteUser: (id: string) => void;
  isFirebaseUser: boolean;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onOpenLoginModal: () => void;
}

export const AdminCenterView: React.FC<AdminCenterViewProps> = ({
  currentUser,
  onRoleChange,
  onUpdateCompanyProfile,
  systemSettings,
  onUpdateSystemSettings,
  usersList,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  isFirebaseUser,
  onGoogleSignIn,
  onSignOut,
  onOpenLoginModal,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'business' | 'security'>('users');

  // Business Profile Form States
  const [companyName, setCompanyName] = useState(currentUser.companyName);
  const [tradeName, setTradeName] = useState(currentUser.tradeName || 'Dhivehi Commercial');
  const [registrationNumber, setRegistrationNumber] = useState(currentUser.registrationNumber || 'C-0824/2019');
  const [tin, setTin] = useState(currentUser.tin);
  const [taxableActivityNumber, setTaxableActivityNumber] = useState(currentUser.taxableActivityNumber || 1);
  const [sector, setSector] = useState<'General' | 'Tourism'>(currentUser.sector || 'General');
  const [address, setAddress] = useState(currentUser.address);
  const [atollOrCity, setAtollOrCity] = useState(currentUser.atollOrCity);
  const [phone, setPhone] = useState(currentUser.phone || '+960 332-8899');
  const [website, setWebsite] = useState(currentUser.website || 'https://dhivehicommercial.mv');
  const [bankName, setBankName] = useState(currentUser.bankName || 'Bank of Maldives (BML)');
  const [bankAccountNumber, setBankAccountNumber] = useState(currentUser.bankAccountNumber || '7730000128472');
  const [bankAccountName, setBankAccountName] = useState(currentUser.bankAccountName || currentUser.companyName);
  const [invoiceFooterNote, setInvoiceFooterNote] = useState(
    currentUser.invoiceFooterNote ||
      'Payment due within 14 days. Thank you for your business. Registered with Maldives Inland Revenue Authority (MIRA).'
  );
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  // System Settings Form States
  const [settingsForm, setSettingsForm] = useState<SystemSettings>(systemSettings);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // User Management State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [userFeedbackToast, setUserFeedbackToast] = useState<string | null>(null);

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('pass123');
  const [newUserPhone, setNewUserPhone] = useState('+960 7');
  const [newUserRole, setNewUserRole] = useState<UserRole>('accountant');
  const [newUserDepartment, setNewUserDepartment] = useState('Accounts & Finance');
  const [newUserStatus, setNewUserStatus] = useState<'active' | 'suspended'>('active');
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit User Modal State
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('accountant');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Reset Password Modal State
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState<SystemUserAccount | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);

  const isAdmin = currentUser.role === 'admin';

  const showToast = (message: string) => {
    setUserFeedbackToast(message);
    setTimeout(() => setUserFeedbackToast(null), 3500);
  };

  const handleSaveBusinessProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile({
      companyName,
      tradeName,
      registrationNumber,
      tin: tin.toUpperCase(),
      taxableActivityNumber,
      sector,
      address,
      atollOrCity,
      phone,
      website,
      bankName,
      bankAccountNumber,
      bankAccountName,
      invoiceFooterNote,
    });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSystemSettings(settingsForm);
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  // Open Create User Modal with clean defaults
  const handleOpenCreateModal = () => {
    setNewUserName('');
    setNewUserUsername('');
    setNewUserEmail('');
    setNewUserPassword('pass123');
    setNewUserPhone('+960 7');
    setNewUserRole('accountant');
    setNewUserDepartment('Accounts & Finance');
    setNewUserStatus('active');
    setIsCreateUserModalOpen(true);
  };

  // Submit Create New User
  const handleCreateNewUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const sanitizedUsername = newUserUsername.trim()
      ? newUserUsername.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
      : newUserEmail.split('@')[0].toLowerCase();

    // Check username uniqueness
    const exists = usersList.some(
      (u) => u.username?.toLowerCase() === sanitizedUsername || u.email.toLowerCase() === newUserEmail.trim().toLowerCase()
    );
    if (exists) {
      showToast('A user with this username or email already exists.');
      return;
    }

    onCreateUser({
      name: newUserName.trim(),
      username: sanitizedUsername,
      email: newUserEmail.trim(),
      password: newUserPassword.trim() || 'pass123',
      phone: newUserPhone.trim(),
      role: newUserRole,
      department: newUserDepartment.trim(),
      status: newUserStatus,
      lastLogin: 'Never logged in',
    });

    setIsCreateUserModalOpen(false);
    showToast(`User account created successfully for ${newUserName.trim()} (@${sanitizedUsername})`);
  };

  // Open Edit User Modal
  const handleOpenEditModal = (user: SystemUserAccount) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username || user.email.split('@')[0]);
    setEditEmail(user.email);
    setEditPassword(user.password || 'admin123');
    setEditPhone(user.phone || '');
    setEditDepartment(user.department);
    setEditRole(user.role);
    setEditStatus(user.status);
    setShowEditPassword(false);
    setIsEditUserModalOpen(true);
  };

  // Submit Edit User
  const handleSaveEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const sanitizedUsername = editUsername.trim()
      ? editUsername.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
      : editingUser.username || editingUser.email.split('@')[0];

    // Check username uniqueness among others
    const exists = usersList.some(
      (u) =>
        u.id !== editingUser.id &&
        (u.username?.toLowerCase() === sanitizedUsername || u.email.toLowerCase() === editEmail.trim().toLowerCase())
    );
    if (exists) {
      showToast('Another user already has this username or email.');
      return;
    }

    onUpdateUser(editingUser.id, {
      name: editName.trim(),
      username: sanitizedUsername,
      email: editEmail.trim(),
      password: editPassword.trim() || editingUser.password,
      phone: editPhone.trim(),
      department: editDepartment.trim(),
      role: editRole,
      status: editStatus,
    });

    setIsEditUserModalOpen(false);
    setEditingUser(null);
    showToast(`Updated user profile for ${editName.trim()}`);
  };

  // Open Password Reset Modal
  const handleOpenResetPassword = (user: SystemUserAccount) => {
    setTargetPasswordUser(user);
    setResetPasswordValue(user.password || 'pass123');
    setShowResetPassword(false);
    setIsResetPasswordModalOpen(true);
  };

  // Submit Password Reset
  const handleSaveResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPasswordUser || !resetPasswordValue.trim()) return;

    onUpdateUser(targetPasswordUser.id, {
      password: resetPasswordValue.trim(),
    });

    setIsResetPasswordModalOpen(false);
    setTargetPasswordUser(null);
    showToast(`Password successfully reset for ${targetPasswordUser.name}`);
  };

  // Toggle user status
  const handleToggleUserStatus = (user: SystemUserAccount) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    onUpdateUser(user.id, { status: newStatus });
    showToast(`User ${user.name} is now ${newStatus}`);
  };

  const permissionList = [
    { key: 'canCreateInvoices', label: 'Create & Issue Sales Invoices (MVR)' },
    { key: 'canEditInvoices', label: 'Edit Existing Records & Line Items' },
    { key: 'canDeleteInvoices', label: 'Delete Records & Invoices' },
    { key: 'canManageGst', label: 'MIRA 205 Return Filing & Input Tax Sign-off' },
    { key: 'canExportReports', label: 'Export MIRA PDF Statements & CSV' },
    { key: 'canManageBackups', label: 'Automated Cloud Backup & Restore' },
    { key: 'canVerifySupplierDocs', label: 'Verify Supplier Vault PDF Invoices' },
    { key: 'canManageSettings', label: 'Configure System Settings & Tax Rules' },
    { key: 'canManageUsers', label: 'Create, Suspend & Delete Users' },
    { key: 'canEditBusinessProfile', label: 'Modify Business Legal Profile & MIRA TIN' },
  ];

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Management Hub</span>
            </span>
            <span className="text-xs text-slate-500">• System Settings & User Directory</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            System Administration & Corporate Settings
          </h1>
          <p className="text-xs text-slate-500">
            Control business profiles, user provisioning, Maldives tax parameters, and enterprise security policies.
          </p>
        </div>

        {/* Current Active User Status */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 flex items-center space-x-3 text-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              {currentUser.displayName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">{currentUser.displayName}</p>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</span>
                {isAdmin ? (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                    Admin Full Access
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                    Restricted
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onOpenLoginModal}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-600" />
            <span>Switch / Login</span>
          </button>
        </div>
      </div>

      {/* Non-Admin Warning Banner */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              <strong>Restricted Access Mode:</strong> You are currently logged in as{' '}
              <strong>{currentUser.role.replace('_', ' ').toUpperCase()}</strong>. System settings, business profile
              modifications, and user creation require Administrator privileges. Switch to the Admin role to edit these parameters.
            </span>
          </div>
          <button
            onClick={() => onRoleChange('admin')}
            className="ml-4 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs whitespace-nowrap transition-colors"
          >
            Switch to Admin Role
          </button>
        </div>
      )}

      {/* Sub Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'settings', label: 'System Settings', icon: Settings },
          { id: 'users', label: 'User Directory & Creation', icon: Users, badge: usersList.length },
          { id: 'business', label: 'Business Profile Changes', icon: Building2 },
          { id: 'security', label: 'Role Permissions & Auth', icon: ShieldCheck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Enterprise System & Tax Settings</h2>
                  <p className="text-[11px] text-slate-500">
                    Configure Maldives MIRA statutory calculation rules, sequencing, and security policies.
                  </p>
                </div>
              </div>
              {isSettingsSaved && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-1 animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Settings Saved Successfully!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <fieldset disabled={!isAdmin} className="space-y-5">
                {/* Tax Configuration Section */}
                <div>
                  <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Maldives MIRA Tax Parameters</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Default Standard GST Rate</label>
                      <select
                        value={settingsForm.defaultGstRate}
                        onChange={(e) => setSettingsForm({ ...settingsForm, defaultGstRate: Number(e.target.value) as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value={8}>8% (General Sector Standard Rate)</option>
                        <option value={16}>16% (Tourism Sector Rate)</option>
                        <option value={17}>17% (Tourism Sector Special)</option>
                        <option value={6}>6% (Historic Transition Rate)</option>
                        <option value={0}>0% (Zero-Rated / Exempt)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Primary Operating Sector</label>
                      <select
                        value={settingsForm.primarySector}
                        onChange={(e) => setSettingsForm({ ...settingsForm, primarySector: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value="General">General Goods & Services (8% GST)</option>
                        <option value="Tourism">Tourism Sector (16% / 17% TGST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Statutory Filing Frequency</label>
                      <select
                        value={settingsForm.filingFrequency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, filingFrequency: e.target.value as any })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value="Monthly">Monthly Returns (Turnover &gt; MVR 10M)</option>
                        <option value="Quarterly">Quarterly Returns (Standard)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Invoicing Sequences */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span>Invoice Sequencing & Currency</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Sales Invoice Prefix</label>
                      <input
                        type="text"
                        value={settingsForm.invoicePrefix}
                        onChange={(e) => setSettingsForm({ ...settingsForm, invoicePrefix: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                        placeholder="INV-2026-"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Operating Currency</label>
                      <input
                        type="text"
                        value={settingsForm.currency}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                        placeholder="MVR (Maldivian Rufiyaa)"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Active Tax Assessment Year</label>
                      <input
                        type="number"
                        value={settingsForm.taxYear}
                        onChange={(e) => setSettingsForm({ ...settingsForm, taxYear: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Security & Cloud Policies */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Security, Validation & Cloud Storage Policies</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.requireTinValidation}
                        onChange={(e) => setSettingsForm({ ...settingsForm, requireTinValidation: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800">Strict MIRA TIN Validation</span>
                        <p className="text-[11px] text-slate-500">
                          Enforce standard 7-digit + GST + 3-digit format (e.g. 1002345GST501) on all invoices.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.autoSyncCloud}
                        onChange={(e) => setSettingsForm({ ...settingsForm, autoSyncCloud: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800">Continuous Cloud Synchronization</span>
                        <p className="text-[11px] text-slate-500">
                          Automatically replicate local ledger changes to Firebase Firestore and Neon PostgreSQL.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.enableAuditLog}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enableAuditLog: e.target.checked })}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="font-bold text-slate-800">MIRA Audit Trail Logging</span>
                        <p className="text-[11px] text-slate-500">
                          Record immutable timestamps, user identifiers, and IP addresses for every invoice modification.
                        </p>
                      </div>
                    </label>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Session Inactivity Timeout</label>
                      <select
                        value={settingsForm.sessionTimeoutMinutes}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sessionTimeoutMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={60}>60 Minutes (Default)</option>
                        <option value={240}>4 Hours</option>
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>

              {isAdmin && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSettingsForm(systemSettings)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all shadow-emerald-500/20"
                  >
                    Save System Settings
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY & CREATION */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* Action Notification Toast */}
          {userFeedbackToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{userFeedbackToast}</span>
              </div>
              <button
                onClick={() => setUserFeedbackToast(null)}
                className="text-emerald-600 hover:text-emerald-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* User Metrics Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-1">{usersList.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Configured system accounts</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Active</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {usersList.filter((u) => u.status === 'active').length}
              </p>
              <p className="text-[10px] text-emerald-600/80 mt-0.5">Can authenticate & operate</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Suspended</span>
                <UserX className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-700 mt-1">
                {usersList.filter((u) => u.status === 'suspended').length}
              </p>
              <p className="text-[10px] text-rose-600/80 mt-0.5">Login access blocked</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Admins</span>
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-indigo-700 mt-1">
                {usersList.filter((u) => u.role === 'admin').length}
              </p>
              <p className="text-[10px] text-indigo-600/80 mt-0.5">Full root system access</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            {/* Header & Provision Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Enterprise User Directory & Access Management</h2>
                <p className="text-[11px] text-slate-500">
                  Provision new team members, edit credentials & usernames, reset passwords, and assign MIRA compliance roles.
                </p>
              </div>

              {isAdmin && (
                <button
                  onClick={handleOpenCreateModal}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all shadow-emerald-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision New User</span>
                </button>
              )}
            </div>

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, username (@user), email, or department..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Roles (Any)</option>
                  <option value="admin">Chief Administrator</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="accountant">Senior Accountant</option>
                  <option value="auditor">Statutory GST Auditor</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-center space-x-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>

                {(userSearchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setUserSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                    title="Clear filters"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <th className="py-3 px-4">User & Username</th>
                    <th className="py-3 px-4">System Role</th>
                    <th className="py-3 px-4">Department & Phone</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Password</th>
                    <th className="py-3 px-4">Last Activity</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Admin Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">No users found</p>
                        <p className="text-[11px]">Try adjusting your search criteria or role filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.email === currentUser.email;
                      const roleMeta = ROLE_PRESETS[u.role];
                      const roleBadgeColor = {
                        admin: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                        finance_manager: 'bg-teal-100 text-teal-800 border-teal-200',
                        accountant: 'bg-blue-100 text-blue-800 border-blue-200',
                        auditor: 'bg-purple-100 text-purple-800 border-purple-200',
                      }[u.role];

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* User Name & Username */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 shadow-xs">
                                {u.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-1.5 truncate">
                                  <p className="font-bold text-slate-900 truncate">{u.name}</p>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
                                  <span className="text-emerald-700 font-semibold font-sans">
                                    @{u.username || u.email.split('@')[0]}
                                  </span>
                                  <span>•</span>
                                  <span className="truncate text-slate-400">{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleBadgeColor}`}
                            >
                              {roleMeta?.label || u.role}
                            </span>
                          </td>

                          {/* Department & Phone */}
                          <td className="py-3 px-4">
                            <p className="text-slate-800 font-medium">{u.department}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.phone || 'No phone set'}</p>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            {isAdmin && !isSelf ? (
                              <button
                                onClick={() => handleToggleUserStatus(u)}
                                title={`Click to ${u.status === 'active' ? 'suspend' : 'activate'} user`}
                                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                  u.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                                <span>{u.status}</span>
                              </button>
                            ) : (
                              <span
                                className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                                  u.status === 'active'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'
                                  }`}
                                />
                                <span>{u.status}</span>
                              </span>
                            )}
                          </td>

                          {/* Password */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-slate-400 tracking-widest text-[10px]">••••••••</span>
                              {isAdmin && (
                                <button
                                  onClick={() => handleOpenResetPassword(u)}
                                  title="Change or reset user password"
                                  className="p-1 rounded text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Last Login */}
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {u.lastLogin || 'Recent'}
                          </td>

                          {/* Actions Column */}
                          {isAdmin && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleOpenEditModal(u)}
                                  title={`Edit ${u.name}'s profile & permissions`}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>

                                {!isSelf && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete user account for ${u.name} (@${u.username || u.email})?`)) {
                                        onDeleteUser(u.id);
                                        showToast(`Deleted user ${u.name}`);
                                      }
                                    }}
                                    title="Delete user"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUSINESS PROFILE CHANGES */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">Maldives Registered Business Profile</h2>
                  <p className="text-[11px] text-slate-500">
                    Official company name, MIRA Taxpayer Identification Number (TIN), banking details, and invoice headers.
                  </p>
                </div>
              </div>
              {isProfileSaved && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center space-x-1 animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Business Profile Updated!</span>
                </span>
              )}
            </div>

            <form onSubmit={handleSaveBusinessProfile} className="space-y-4 text-xs">
              <fieldset disabled={!isAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company Legal Registered Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Trading Name (Operating As)</label>
                    <input
                      type="text"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">MIRA TIN (Tax Identification) *</label>
                    <input
                      type="text"
                      required
                      value={tin}
                      onChange={(e) => setTin(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-emerald-700 uppercase"
                      placeholder="1000000GST501"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Taxable Activity # (MIRA)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      required
                      value={taxableActivityNumber}
                      onChange={(e) => setTaxableActivityNumber(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-center"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ministry Reg. Number</label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Registered Address (Maldives) *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Atoll / City</label>
                    <input
                      type="text"
                      required
                      value={atollOrCity}
                      onChange={(e) => setAtollOrCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Official Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Company Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Banking Section */}
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="font-bold text-slate-800 text-xs mb-3 flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Bank Account Details (Printed on Invoices)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Account Number (MVR)</label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Account Beneficiary Name</label>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Invoice Terms & Footer Note</label>
                  <textarea
                    rows={2}
                    value={invoiceFooterNote}
                    onChange={(e) => setInvoiceFooterNote(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </fieldset>

              {isAdmin && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition-all"
                  >
                    Save Business Profile Changes
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ROLE PERMISSIONS & AUTH */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Role Presets Cards */}
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
                    <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Active Role
                      </span>
                    )}
                  </div>
                  <h2 className="font-bold text-slate-900 text-sm mb-1">{roleData.label}</h2>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{roleData.description}</p>
                  <button
                    type="button"
                    className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? 'Active Selection' : 'Test this Role'}
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
                <h2 className="font-bold text-slate-900 text-sm">Granular Operational Permission Matrix</h2>
              </div>
              <span className="text-[11px] text-slate-500">Live role evaluation across all modules</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/40 text-slate-600">
                    <th className="py-3 px-4 font-semibold w-2/5">Capability / Operation</th>
                    <th className="py-3 px-3 font-semibold text-center">Admin (Full Control)</th>
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
                        {ROLE_PRESETS.finance_manager.permissions[
                          perm.key as keyof typeof ROLE_PRESETS.finance_manager.permissions
                        ] ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      {/* Accountant */}
                      <td className="py-3 px-3 text-center">
                        {ROLE_PRESETS.accountant.permissions[
                          perm.key as keyof typeof ROLE_PRESETS.accountant.permissions
                        ] ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>

                      {/* Auditor */}
                      <td className="py-3 px-3 text-center">
                        {ROLE_PRESETS.auditor.permissions[
                          perm.key as keyof typeof ROLE_PRESETS.auditor.permissions
                        ] ? (
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
        </div>
      )}

      {/* 1. CREATE USER MODAL */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Provision New System User</h3>
                  <p className="text-[11px] text-slate-300">Set up credentials & access for corporate accounts</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUserSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ibrahim Shujau"
                    value={newUserName}
                    onChange={(e) => {
                      setNewUserName(e.target.value);
                      if (!newUserUsername && e.target.value) {
                        setNewUserUsername(
                          e.target.value.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9._]/g, '')
                        );
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username (Login ID) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. shujau"
                      value={newUserUsername}
                      onChange={(e) => setNewUserUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="shujau@dhivehicommercial.mv"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+960 771-2345"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Initial Password *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'MvTax' + Math.floor(100 + Math.random() * 900) + '!';
                        setNewUserPassword(randomPass);
                      }}
                      className="text-[10px] text-emerald-700 hover:underline"
                    >
                      Generate
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Accounts Receivable"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign System Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="admin">Chief Administrator (Full Access)</option>
                    <option value="finance_manager">Finance Manager</option>
                    <option value="accountant">Senior Accountant</option>
                    <option value="auditor">Statutory GST Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Initial Status *</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="active">Active (Can log in immediately)</option>
                    <option value="suspended">Suspended (Access blocked)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Security Note:</span> Users can immediately log in using their username (<span className="font-mono font-bold text-slate-800">@{newUserUsername || 'username'}</span>) or corporate email address and this password.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Provision Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT USER MODAL */}
      {isEditUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Edit User Profile & Access</h3>
                  <p className="text-[11px] text-slate-300">Modifying account credentials for {editingUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditUserModalOpen(false);
                  setEditingUser(null);
                }}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUserSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username (Login ID) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Account Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'MvTax' + Math.floor(100 + Math.random() * 900) + '!';
                        setEditPassword(randomPass);
                      }}
                      className="text-[10px] text-indigo-700 hover:underline"
                    >
                      Generate New
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned System Role *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="admin">Chief Administrator (Full Access)</option>
                    <option value="finance_manager">Finance Manager</option>
                    <option value="accountant">Senior Accountant</option>
                    <option value="auditor">Statutory GST Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Account Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as 'active' | 'suspended')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-semibold"
                  >
                    <option value="active">Active (Access Allowed)</option>
                    <option value="suspended">Suspended (Access Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditUserModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save User Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && targetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Reset User Password</h3>
                  <p className="text-[11px] text-slate-300">Set new password for {targetPasswordUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsResetPasswordModalOpen(false);
                  setTargetPasswordUser(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPasswordSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Account</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{targetPasswordUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">@{targetPasswordUser.username || targetPasswordUser.email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                    {targetPasswordUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">New Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randomPass = 'MvTax' + Math.floor(100 + Math.random() * 900) + '!';
                      setResetPasswordValue(randomPass);
                    }}
                    className="text-[10px] text-emerald-700 hover:underline"
                  >
                    Generate Random
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={resetPasswordValue}
                    onChange={(e) => setResetPasswordValue(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetPasswordModalOpen(false);
                    setTargetPasswordUser(null);
                  }}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
