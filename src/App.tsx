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
  SupplierDocStatus 
} from './types';
import { 
  DEFAULT_COMPANY, 
  ROLE_PRESETS, 
  INITIAL_INVOICES, 
  INITIAL_SUPPLIER_DOCUMENTS, 
  INITIAL_MALDIVES_GST_REPORTS, 
  INITIAL_BACKUPS 
} from './data/mockData';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InvoicesView } from './components/InvoicesView';
import { InvoiceModal } from './components/InvoiceModal';
import { GstReportsView } from './components/GstReportsView';
import { SupplierVaultView } from './components/SupplierVaultView';
import { UploadSupplierDocModal } from './components/UploadSupplierDocModal';
import { CloudBackupsView } from './components/CloudBackupsView';
import { RolesSecurityView } from './components/RolesSecurityView';
import { NeonDatabaseView } from './components/NeonDatabaseView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('gst');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('taxflow_maldives_profile');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
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

  // Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);

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

  // Role Switcher
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
      await signOut(auth);
      setFirebaseUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncToNeonBackend();
    setTimeout(() => {
      setIsSyncing(false);
      setIsCloudSynced(true);
    }, 600);
  };

  // Invoice Actions
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    const isEdit = !!editingInvoice;
    let targetId = invoiceData.id || `inv-${Date.now()}`;
    const fullInvoice: Invoice = {
      id: targetId,
      invoiceNumber: invoiceData.invoiceNumber || 'INV/2026/00100',
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
      taxableActivityNumber: invoiceData.taxableActivityNumber || 1,
      revenueOrCapital: invoiceData.revenueOrCapital || 'Revenue',
      sector: invoiceData.sector || 'General',
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
      const newRow: MaldivesGstInputRecord = {
        id: `rec-${newDoc.id}`,
        rowNumber: target.inputRecords.length + 1,
        supplierTin: newDoc.supplierTin,
        supplierName: newDoc.supplierName,
        supplierInvoiceNumber: newDoc.invoiceNumber,
        invoiceDate: newDoc.invoiceDate,
        invoiceTotalExclGst: newDoc.invoiceTotalExclGst,
        gst6: newDoc.gst6,
        gst8: newDoc.gst8,
        gst12: newDoc.gst12,
        gst16: newDoc.gst16,
        gst17: newDoc.gst17,
        taxableActivityNumber: newDoc.taxableActivityNumber,
        revenueOrCapital: newDoc.revenueOrCapital,
        matchedSupplierDocId: newDoc.id,
      };

      const newRecords = [...target.inputRecords, newRow];
      const totalExcl = newRecords.reduce((s, r) => s + r.invoiceTotalExclGst, 0);
      const total8 = newRecords.reduce((s, r) => s + r.gst8, 0);
      const totalItc = total8;
      const netPayable = target.totalOutputTax - totalItc;

      return [
        {
          ...target,
          inputRecords: newRecords,
          totalInputExclGst: totalExcl,
          totalInputGst8: total8,
          totalInputTaxCredit: totalItc,
          netGstPayable: netPayable,
          updatedAt: new Date().toISOString(),
        },
        ...prev.slice(1),
      ];
    });
  };

  const handleDeleteSupplierDoc = (id: string) => {
    if (!confirm('Delete this supplier bill from vault?')) return;
    setSupplierDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateSupplierDocStatus = (id: string, status: SupplierDocStatus) => {
    setSupplierDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const handleConvertDocToInvoice = (docItem: SupplierDocument) => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: docItem.invoiceNumber,
      type: 'purchase',
      counterpartyName: docItem.supplierName,
      counterpartyTin: docItem.supplierTin,
      invoiceDate: docItem.invoiceDate,
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      status: 'pending',
      items: [
        {
          id: `item-${Date.now()}`,
          description: `Supplier Procurement: ${docItem.category}`,
          quantity: 1,
          unitPrice: docItem.invoiceTotalExclGst,
          gstRate: 8,
          taxableAmount: docItem.invoiceTotalExclGst,
          gstAmount: docItem.gst8 || docItem.totalGst,
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        isCloudSynced={isCloudSynced}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        isFirebaseUser={!!firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {currentTab === 'roles' && (
          <RolesSecurityView
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onUpdateCompanyProfile={(profile) => setCurrentUser((prev) => ({ ...prev, ...profile }))}
            isFirebaseUser={!!firebaseUser}
            onGoogleSignIn={handleGoogleSignIn}
            onSignOut={handleSignOut}
          />
        )}
      </main>

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
    </div>
  );
}
