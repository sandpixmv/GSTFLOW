export type InvoiceType = 'sales' | 'purchase';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
export type RevenueOrCapital = 'Revenue' | 'Capital';

export type MaldivesGstRate = 0 | 6 | 8 | 12 | 16 | 17;

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number; // in MVR (excluding GST)
  gstRate: MaldivesGstRate; // 0%, 6%, 8%, 12%, 16%, 17%
  taxableAmount: number;
  gstAmount: number;
  total: number;
  revenueOrCapital?: RevenueOrCapital;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  counterpartyName: string;
  counterpartyTin: string; // e.g. 1183672GST501
  counterpartyAddress?: string;
  counterpartyEmail?: string;
  invoiceDate: string; // e.g. "Thursday 2 July 2026" or "2026-07-02"
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  taxableSubtotal: number; // excluding GST
  // Maldives GST breakdown
  gst6: number;
  gst8: number;
  gst12: number;
  gst16: number;
  gst17: number;
  totalGst: number;
  grandTotal: number;
  taxableActivityNumber: number; // e.g. 1
  revenueOrCapital: RevenueOrCapital;
  sector: 'General' | 'Tourism'; // General (8%) or Tourism (16%/17%)
  notes?: string;
  attachedSupplierDocId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type SupplierDocStatus = 'verified' | 'pending_review' | 'reconciled';

export interface SupplierDocument {
  id: string;
  fileName: string;
  supplierName: string;
  supplierTin: string; // Maldives MIRA TIN
  invoiceNumber: string;
  invoiceDate: string;
  invoiceTotalExclGst: number;
  gst6: number;
  gst8: number;
  gst12: number;
  gst16: number;
  gst17: number;
  totalGst: number;
  totalAmount: number; // total including GST
  taxableActivityNumber: number;
  revenueOrCapital: RevenueOrCapital;
  fileSize: number;
  fileType: string;
  status: SupplierDocStatus;
  category: string;
  notes?: string;
  matchedInvoiceId?: string;
  uploadDate: string;
  userId: string;
}

export interface MaldivesGstInputRecord {
  id: string;
  rowNumber: number;
  supplierTin: string;
  supplierName: string;
  supplierInvoiceNumber: string;
  invoiceDate: string;
  invoiceTotalExclGst: number;
  gst6: number;
  gst8: number;
  gst12: number;
  gst16: number;
  gst17: number;
  taxableActivityNumber: number;
  revenueOrCapital: RevenueOrCapital;
  matchedSupplierDocId?: string;
}

export interface MaldivesGstReport {
  id: string;
  period: string; // e.g. "July 2026", "August 2026", "Q3 2026"
  taxYear: number;
  // Output Tax (Sales)
  generalSuppliesTaxable: number; // subject to 8%
  generalOutputGst: number; // 8%
  tourismSuppliesTaxable: number; // subject to 16% / 17%
  tourismOutputGst: number; // 16% or 17%
  zeroRatedSupplies: number;
  exemptSupplies: number;
  totalOutputTax: number;
  // Input Tax Deductions (From Template Table)
  inputRecords: MaldivesGstInputRecord[];
  totalInputExclGst: number;
  totalInputGst6: number;
  totalInputGst8: number;
  totalInputGst12: number;
  totalInputGst16: number;
  totalInputGst17: number;
  totalInputTaxCredit: number; // sum of all input GST
  totalRevenueExpenses: number;
  totalCapitalExpenses: number;
  // Net Tax
  netGstPayable: number; // Output Tax - Input Tax (if positive: payable to MIRA; if negative: refund/credit)
  status: 'draft' | 'reconciled' | 'filed';
  filingDate?: string;
  miraAckNumber?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'admin' | 'finance_manager' | 'accountant' | 'auditor';

export interface UserPermissions {
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canManageGst: boolean;
  canExportReports: boolean;
  canManageBackups: boolean;
  canVerifySupplierDocs: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canEditBusinessProfile: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyName: string;
  tradeName?: string;
  registrationNumber?: string;
  tin: string; // MIRA TIN e.g. 1029384GST501
  address: string;
  atollOrCity: string;
  phone?: string;
  website?: string;
  sector?: 'General' | 'Tourism';
  taxableActivityNumber: number;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  invoiceFooterNote?: string;
  permissions: UserPermissions;
  avatarUrl?: string;
  lastActive?: string;
}

export interface SystemUserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface SystemSettings {
  defaultGstRate: MaldivesGstRate;
  primarySector: 'General' | 'Tourism';
  taxYear: number;
  filingFrequency: 'Monthly' | 'Quarterly';
  requireTinValidation: boolean;
  autoSequencing: boolean;
  invoicePrefix: string;
  currency: string;
  sessionTimeoutMinutes: number;
  enableAuditLog: boolean;
  autoSyncCloud: boolean;
  backupFrequency: 'Hourly' | 'Daily' | 'Weekly';
}

export interface BackupSnapshot {
  id: string;
  snapshotTitle: string;
  snapshotType: 'automated' | 'manual' | 'scheduled';
  recordCount: number;
  sizeKb: number;
  storageLocation: string;
  status: 'active' | 'archived' | 'restored';
  dataPayload?: string;
  userId: string;
  createdAt: string;
}
