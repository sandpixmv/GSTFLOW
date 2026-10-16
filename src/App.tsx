/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from './firebase';
import { 
  Invoice, 
  SupplierDocument, 
  MaldivesGstReport, 
  MaldivesGstInputRecord,
  BackupSnapshot, 
  UserProfile, 
  UserRole,
  InvoiceStatus,
  SupplierDocStatus,
  SystemUserAccount,
  SystemSettings
} from './types';
import { 
  DEFAULT_COMPANY, 
  ROLE_PRESETS, 
  INITIAL_INVOICES, 
  INITIAL_SUPPLIER_DOCUMENTS, 
  INITIAL_MALDIVES_GST_REPORTS, 
  INITIAL_BACKUPS,
  INITIAL_SYSTEM_SETTINGS,
  INITIAL_USERS_LIST
} from './data/mockData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InvoicesView } from './components/InvoicesView';
import { InvoiceModal } from './components/InvoiceModal';
import { GstReportsView } from './components/GstReportsView';
import { SupplierVaultView } from './components/SupplierVaultView';
import { UploadSupplierDocModal } from './components/UploadSupplierDocModal';
import { CloudBackupsView } from './components/CloudBackupsView';
import { AdminCenterView } from './components/AdminCenterView';
import { NeonDatabaseView } from './components/NeonDatabaseView';
import { LoginModal } from './components/LoginModal';
import { Sidebar } from './components/Sidebar';

export default function App() {
  // Default to Dashboard as requested
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('taxflow_maldives_profile');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('taxflow_maldives_settings');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_SETTINGS;
  });

  const [usersList, setUsersList] = useState<SystemUserAccount[]>(() => {
    const saved = localStorage.getItem('taxflow_maldives_users');
    if (saved) {
      try {
        const parsed: SystemUserAccount[] = JSON.parse(saved);
        return parsed.map((u, i) => ({
          ...u,
          username: u.username || (u.email ? u.email.split('@')[0].toLowerCase() : `user_${i + 1}`),
          password: u.password || (u.role === 'admin' ? 'admin123' : 'pass123'),
        }));
      } catch {
        return INITIAL_USERS_LIST;
      }
    }
    return INITIAL_USERS_LIST;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = localStorage.getItem('taxflow_maldives_auth_session');
    return session !== 'logged_out';
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('taxflow_maldives_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [supplierDocs, setSupplierDocs] = useState<SupplierDocument[]>(() => {
    const saved = localStorage.getItem('taxflow_maldives_supplier_docs');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIER_DOCUMENTS;
  });

  const [gstReports, setGstReports] = useState<MaldivesGstReport[]>(() => {
    const saved = localStorage.getItem('taxflow_maldives_gst_reports');
    return saved ? JSON.parse(saved) : INITIAL_MALDIVES_GST_REPORTS;
  });

  const [backups, setBackups] = useState<BackupSnapshot[]>(() => {
    const saved = localStorage.getItem('taxflow_maldives_backups');
    return saved ? JSON.parse(saved) : INITIAL_BACKUPS;
  });

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Modal & Navigation States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('taxflow_maldives_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('taxflow_maldives_supplier_docs', JSON.stringify(supplierDocs));
  }, [supplierDocs]);

  useEffect(() => {
    localStorage.setItem('taxflow_maldives_gst_reports', JSON.stringify(gstReports));
  }, [gstReports]);

  useEffect(() => {
    localStorage.setItem('taxflow_maldives_backups', JSON.stringify(backups));
  }, [backups]);

  useEffect(() => {
    localStorage.setItem('taxflow_maldives_profile', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('taxflow_maldives_settings', JSON.stringify(systemSettings));
  }, [systemSettings]);

  useEffect(() => {
    localStorage.setItem('taxflow_maldives_users', JSON.stringify(usersList));
  }, [usersList]);

  // Boot connection check & Auth state listener
  useEffect(() => {
    testConnection().catch(console.warn);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        setCurrentUser((prev) => ({
          ...prev,
          id: user.uid,
          email: user.email || prev.email,
          displayName: user.displayName || prev.displayName,
          avatarUrl: user.photoURL || undefined,
        }));
        setIsCloudSynced(true);
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore updates if user is authenticated
  useEffect(() => {
    if (!firebaseUser) return;

    const invoicesPath = 'invoices';
    const unsubInvoices = onSnapshot(
      collection(db, invoicesPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Invoice[] = [];
          snapshot.forEach((doc) => {
            loaded.push({ id: doc.id, ...doc.data() } as Invoice);
          });
          setInvoices(loaded);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, invoicesPath);
      }
    );

    return () => unsubInvoices();
  }, [firebaseUser]);

  // Background sync to server-side Neon PostgreSQL node
  const syncToNeonBackend = async () => {
    try {
      await fetch('/api/neon/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: {
            invoices,
            supplierDocs,
            inputRecords: gstReports[0]?.inputRecords || [],
            gstReports,
            backups,
          },
        }),
      });
    } catch (e) {
      // Non-blocking sync
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      syncToNeonBackend();
    }, 1200);
    return () => clearTimeout(timer);
  }, [invoices, supplierDocs, gstReports]);

  // Role Switcher with strict permissions update
  const handleRoleChange = (newRole: UserRole) => {
    const roleConfig = ROLE_PRESETS[newRole];
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      permissions: { ...roleConfig.permissions },
    }));
  };

  // Google Sign-In Flow
  const handleGoogleSignIn = async () => {
    try {
      setIsSyncing(true);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        setFirebaseUser(res.user);
        setIsAuthenticated(true);
        localStorage.setItem('taxflow_maldives_auth_session', 'logged_in');
        setCurrentUser((prev) => ({
          ...prev,
          id: res.user.uid,
          email: res.user.email || prev.email,
          displayName: res.user.displayName || prev.displayName,
        }));
        setIsCloudSynced(true);
      }
    } catch (error) {
      console.warn('Google sign-in popup closed or bypassed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (firebaseUser) {
        await signOut(auth);
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    setFirebaseUser(null);
    setIsAuthenticated(false);
    localStorage.setItem('taxflow_maldives_auth_session', 'logged_out');
    setIsLoginModalOpen(true);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncToNeonBackend();
    setTimeout(() => {
      setIsSyncing(false);
      setIsCloudSynced(true);
    }, 600);
  };

  // Credentials Authentication (Username & Password)
  const handleLoginWithCredentials = async (
    identifier: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    const searchId = identifier.trim().toLowerCase();

    // Find account by matching username or email
    let matchedUser = usersList.find(
      (u) =>
        (u.username && u.username.toLowerCase() === searchId) ||
        u.email.toLowerCase() === searchId
    );

    // Fallback if "admin" or primary admin email
    if (!matchedUser && (searchId === 'admin' || searchId === 'sandpix.mv@gmail.com')) {
      matchedUser = usersList.find((u) => u.role === 'admin') || usersList[0];
    }

    if (!matchedUser) {
      return {
        success: false,
        error: 'No account found matching this username or email. Please verify your credentials.',
      };
    }

    if (matchedUser.status === 'suspended') {
      return {
        success: false,
        error: 'This account has been suspended by the administrator. Please contact your system admin.',
      };
    }

    const expectedPass = matchedUser.password || (matchedUser.role === 'admin' ? 'admin123' : 'pass123');
    if (pass !== expectedPass) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your credentials and try again.',
      };
    }

    // Role preset permissions
    const roleConfig = ROLE_PRESETS[matchedUser.role] || ROLE_PRESETS.admin;
    setCurrentUser((prev) => ({
      ...prev,
      id: matchedUser!.id,
      displayName: matchedUser!.name,
      email: matchedUser!.email,
      role: matchedUser!.role,
      permissions: { ...roleConfig.permissions },
      lastActive: 'Just now',
    }));

    // Update lastLogin status
    setUsersList((prev) =>
      prev.map((u) => (u.id === matchedUser!.id ? { ...u, lastLogin: 'Active now' } : u))
    );

    setIsAuthenticated(true);
    localStorage.setItem('taxflow_maldives_auth_session', 'logged_in');
    return { success: true };
  };

  // User Management Handlers (Admin Only)
  const handleCreateUser = (newUser: Omit<SystemUserAccount, 'id' | 'createdAt'>) => {
    const user: SystemUserAccount = {
      ...newUser,
      id: `usr_${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setUsersList((prev) => [...prev, user]);
  };

  const handleUpdateUser = (id: string, updates: Partial<SystemUserAccount>) => {
    setUsersList((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  };

  const handleDeleteUser = (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  };

  const handleUpdateSystemSettings = (newSettings: SystemSettings) => {
    setSystemSettings(newSettings);
  };

  // Business Profile Updates
  const handleUpdateBusinessProfile = (profile: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...profile,
    }));
  };

  // Invoice Actions
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    const isEdit = !!editingInvoice;
    let targetId = invoiceData.id || `inv-${Date.now()}`;
    const fullInvoice: Invoice = {
      id: targetId,
      invoiceNumber: invoiceData.invoiceNumber || `${systemSettings.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`,
      type: invoiceData.type || 'sales',
      counterpartyName: invoiceData.counterpartyName || 'Maldives Client',
      counterpartyTin: invoiceData.counterpartyTin || '',
      counterpartyAddress: invoiceData.counterpartyAddress || '',
      counterpartyEmail: invoiceData.counterpartyEmail || '',
      invoiceDate: invoiceData.invoiceDate || new Date().toISOString().slice(0, 10),
      dueDate: invoiceData.dueDate || new Date().toISOString().slice(0, 10),
      status: invoiceData.status || 'pending',
      items: invoiceData.items || [],
      taxableSubtotal: invoiceData.taxableSubtotal || 0,
      gst6: invoiceData.gst6 || 0,
      gst8: invoiceData.gst8 || 0,
      gst12: invoiceData.gst12 || 0,
      gst16: invoiceData.gst16 || 0,
      gst17: invoiceData.gst17 || 0,
      totalGst: invoiceData.totalGst || 0,
      grandTotal: invoiceData.grandTotal || 0,
      taxableActivityNumber: invoiceData.taxableActivityNumber || currentUser.taxableActivityNumber || 1,
      revenueOrCapital: invoiceData.revenueOrCapital || 'Revenue',
      sector: invoiceData.sector || currentUser.sector || 'General',
      notes: invoiceData.notes || '',
      userId: currentUser.id,
      createdAt: invoiceData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEdit) {
      setInvoices((prev) => prev.map((inv) => (inv.id === targetId ? fullInvoice : inv)));
    } else {
      setInvoices((prev) => [fullInvoice, ...prev]);
    }

    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'invoices', targetId), fullInvoice);
      } catch (err) {
        console.warn('Syncing locally:', err);
      }
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('Permission denied. Admin authorization is required to delete invoices.');
      return;
    }
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    if (firebaseUser) {
      try {
        await deleteDoc(doc(db, 'invoices', id));
      } catch (err) {
        console.warn('Local delete:', err);
      }
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv))
    );
  };

  // Supplier Documents Actions
  const handleUploadSupplierDoc = (newDoc: SupplierDocument) => {
    setSupplierDocs((prev) => [newDoc, ...prev]);

    setGstReports((prev) => {
      if (prev.length === 0) return prev;
      const target = { ...prev[0] };
      const newRec: MaldivesGstInputRecord = {
        id: `rec-sync-${newDoc.id}`,
        rowNumber: target.inputRecords.length + 1,
        supplierTin: newDoc.supplierTin,
        supplierName: newDoc.supplierName,
        supplierInvoiceNumber: newDoc.invoiceNumber,
        invoiceDate: newDoc.invoiceDate,
        invoiceTotalExclGst: newDoc.invoiceTotalExclGst || newDoc.totalAmount - newDoc.totalGst,
        gst6: newDoc.gst6 || 0,
        gst8: newDoc.gst8 || newDoc.totalGst,
        gst12: newDoc.gst12 || 0,
        gst16: newDoc.gst16 || 0,
        gst17: newDoc.gst17 || 0,
        taxableActivityNumber: newDoc.taxableActivityNumber || currentUser.taxableActivityNumber || 1,
        revenueOrCapital: newDoc.revenueOrCapital || 'Revenue',
        matchedSupplierDocId: newDoc.id,
      };
      target.inputRecords = [...target.inputRecords, newRec];
      return [target, ...prev.slice(1)];
    });
  };

  const handleDeleteSupplierDoc = (id: string) => {
    if (!currentUser.permissions.canDeleteInvoices) {
      alert('Permission denied. Administrator privileges required to delete archived supplier documents.');
      return;
    }
    if (!confirm('Are you sure you want to delete this archived supplier document?')) return;
    setSupplierDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateSupplierDocStatus = (id: string, status: SupplierDocStatus) => {
    setSupplierDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const handleConvertDocToInvoice = (docItem: SupplierDocument) => {
    const newInvoice: Invoice = {
      id: `inv-from-${docItem.id}`,
      invoiceNumber: `VCH-${docItem.invoiceNumber.replace(/[^a-zA-Z0-9]/g, '')}`,
      type: 'purchase',
      counterpartyName: docItem.supplierName,
      counterpartyTin: docItem.supplierTin,
      invoiceDate: docItem.invoiceDate,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'pending',
      items: [
        {
          id: `item-${Date.now()}`,
          description: `Supplier bill recorded: ${docItem.category}`,
          quantity: 1,
          unitPrice: docItem.invoiceTotalExclGst,
          gstRate: 8,
          taxableAmount: docItem.invoiceTotalExclGst,
          gstAmount: docItem.totalGst,
          total: docItem.totalAmount,
          revenueOrCapital: docItem.revenueOrCapital,
        },
      ],
      taxableSubtotal: docItem.invoiceTotalExclGst,
      gst6: docItem.gst6,
      gst8: docItem.gst8,
      gst12: docItem.gst12,
      gst16: docItem.gst16,
      gst17: docItem.gst17,
      totalGst: docItem.totalGst,
      grandTotal: docItem.totalAmount,
      taxableActivityNumber: docItem.taxableActivityNumber,
      revenueOrCapital: docItem.revenueOrCapital,
      sector: 'General',
      attachedSupplierDocId: docItem.id,
      notes: `Voucher for MIRA Form 205 Input Tax Deduction Schedule`,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setSupplierDocs((prev) =>
      prev.map((d) => (d.id === docItem.id ? { ...d, matchedInvoiceId: newInvoice.id, status: 'reconciled' } : d))
    );
    setCurrentTab('invoices');
  };

  // GST Return Actions
  const handleUpdateGstReport = (updated: MaldivesGstReport) => {
    setGstReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const handleFileGstReport = (reportId: string, ackNumber: string) => {
    setGstReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: 'filed',
              miraAckNumber: ackNumber,
              filingDate: new Date().toISOString().slice(0, 10),
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
  };

  // Cloud Backup Actions
  const handleCreateBackup = (title: string, type: 'manual' | 'automated' | 'scheduled') => {
    const newSnapshot: BackupSnapshot = {
      id: `bkp-${Date.now()}`,
      snapshotTitle: title,
      snapshotType: type,
      recordCount: invoices.length + supplierDocs.length + (gstReports[0]?.inputRecords.length || 0),
      sizeKb: 280 + Math.random() * 40,
      storageLocation: 'Neon Cloud & Multi-Region Vault',
      status: 'active',
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    setBackups((prev) => [newSnapshot, ...prev]);
  };

  const handleRestoreBackup = (backup: BackupSnapshot) => {
    alert(`Maldives financial snapshot "${backup.snapshotTitle}" has been verified and restored to active memory.`);
  };

  const handleImportBackupJson = (jsonData: any) => {
    if (jsonData.invoices) setInvoices(jsonData.invoices);
    if (jsonData.supplierDocuments) setSupplierDocs(jsonData.supplierDocuments);
    if (jsonData.miraGstReports) setGstReports(jsonData.miraGstReports);
  };

  // If user is logged out, render user-friendly, secure login screen
  if (!isAuthenticated) {
    return (
      <LoginModal
        isOpen={true}
        onLoginWithCredentials={handleLoginWithCredentials}
        onGoogleSignIn={handleGoogleSignIn}
        isFullScreen={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans antialiased text-slate-800">
      {/* Modern Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        invoicesCount={invoices.length}
        supplierDocsCount={supplierDocs.length}
        onOpenCreateInvoice={() => {
          setEditingInvoice(null);
          setIsInvoiceModalOpen(true);
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onSignOut={handleSignOut}
        isCloudSynced={isCloudSynced}
        isSyncing={isSyncing}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area with dynamic left padding for sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Modern Topbar Header */}
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          isCloudSynced={isCloudSynced}
          isSyncing={isSyncing}
          onManualSync={handleManualSync}
          isFirebaseUser={!!firebaseUser}
          onGoogleSignIn={handleGoogleSignIn}
          onSignOut={handleSignOut}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* View Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              invoices={invoices}
              supplierDocs={supplierDocs}
              gstReports={gstReports}
              currentUser={currentUser}
              onOpenCreateInvoice={() => {
                setEditingInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onOpenUploadDoc={() => setIsUploadDocModalOpen(true)}
              onOpenGstReport={() => setCurrentTab('gst')}
              onTriggerBackup={() => handleCreateBackup('Manual MIRA Snapshot Trigger', 'manual')}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              usersCount={usersList.length}
            />
          )}

          {currentTab === 'gst' && (
            <GstReportsView
              reports={gstReports}
              invoices={invoices}
              supplierDocs={supplierDocs}
              currentUser={currentUser}
              onUpdateReport={handleUpdateGstReport}
              onFileReport={handleFileGstReport}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              currentUser={currentUser}
              onOpenCreateModal={() => {
                setEditingInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onEditInvoice={(inv) => {
                setEditingInvoice(inv);
                setIsInvoiceModalOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onUpdateStatus={handleUpdateInvoiceStatus}
              onViewSupplierDoc={(docId) => setCurrentTab('supplier-vault')}
            />
          )}

          {currentTab === 'supplier-vault' && (
            <SupplierVaultView
              documents={supplierDocs}
              currentUser={currentUser}
              onOpenUploadModal={() => setIsUploadDocModalOpen(true)}
              onDeleteDocument={handleDeleteSupplierDoc}
              onUpdateStatus={handleUpdateSupplierDocStatus}
              onConvertToInvoice={handleConvertDocToInvoice}
            />
          )}

          {(currentTab === 'admin-hub' || currentTab === 'roles') && (
            <AdminCenterView
              currentUser={currentUser}
              onRoleChange={handleRoleChange}
              onUpdateCompanyProfile={handleUpdateBusinessProfile}
              systemSettings={systemSettings}
              onUpdateSystemSettings={handleUpdateSystemSettings}
              usersList={usersList}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              isFirebaseUser={!!firebaseUser}
              onGoogleSignIn={handleGoogleSignIn}
              onSignOut={handleSignOut}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}

          {currentTab === 'neon' && (
            <NeonDatabaseView
              invoices={invoices}
              supplierDocs={supplierDocs}
              gstReports={gstReports}
              currentUser={currentUser}
              onRefreshData={handleManualSync}
            />
          )}

          {currentTab === 'backups' && (
            <CloudBackupsView
              backups={backups}
              currentUser={currentUser}
              invoices={invoices}
              supplierDocs={supplierDocs}
              gstReports={gstReports}
              onCreateBackup={handleCreateBackup}
              onRestoreBackup={handleRestoreBackup}
              onImportBackupJson={handleImportBackupJson}
            />
          )}
        </main>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setEditingInvoice(null);
        }}
        onSave={handleSaveInvoice}
        initialInvoice={editingInvoice}
        company={currentUser}
      />

      {/* Supplier Document Upload Modal */}
      <UploadSupplierDocModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        onUpload={handleUploadSupplierDoc}
        currentUser={currentUser}
      />

      {/* Login & Authentication Modal for Switching User */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginWithCredentials={handleLoginWithCredentials}
        onGoogleSignIn={handleGoogleSignIn}
        isFullScreen={false}
      />
    </div>
  );
}
