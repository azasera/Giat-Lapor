export type SourceOfFund = 'Yayasan' | 'Bos' | 'Komite' | 'Donasi' | '';
export type UnitType = 'Buah' | 'pcs/unit' | 'Pack' | 'Botol' | 'Rim' | 'Dus' | 'Set' | 'Meter' | 'Liter' | 'Kg' | '';
export type WeekNumber = 'Pekan 1' | 'Pekan 2' | 'Pekan 3' | 'Pekan 4' | 'Pekan 5' | '';
export type RABStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface ExpenseItem {
  id: string;
  description: string;
  volume: number | '';
  unit: UnitType;
  unitPrice: number | '';
  amount: number; // Calculated field, will be stored as numeric in DB
  sourceOfFund: SourceOfFund;
  estimatedWeek: WeekNumber;
}

export interface WeeklyBudgetSummary {
  yayasan: number[]; // Array of 5 numbers for Pekan 1-5
  bos: number[];
  komite: number[];
  donasi: number[];
  total: number[]; // Calculated total for each week
}

export interface RABData {
  id: string; // Now a UUID from Supabase
  user_id: string; // Added to link RAB to a user
  status: RABStatus; // Status of the RAB
  submittedAt?: string; // Date when submitted to foundation
  reviewedAt?: string; // Date when reviewed by foundation
  reviewComment?: string; // Foundation's review comment
  institutionName: string;
  period: string;
  year: string;
  routineExpenses: ExpenseItem[];
  incidentalExpenses: ExpenseItem[];
  weeklySummary: WeeklyBudgetSummary; // Calculated field, not stored directly
  // New signature fields
  signatureKabidUmum?: string | null;
  signatureBendaharaYayasan?: string | null;
  signatureSekretarisYayasan?: string | null;
  signatureKetuaYayasan?: string | null;
  signatureKepalaMTA?: string | null;
}

export const defaultRABData: RABData = {
  id: '',
  user_id: '', // Will be set by session
  status: 'draft',
  submittedAt: undefined,
  reviewedAt: undefined,
  reviewComment: undefined,
  institutionName: 'MTA',
  period: 'Sep',
  year: new Date().getFullYear().toString(),
  routineExpenses: [
    { id: 'RUT-1', description: '', volume: '', unit: '', unitPrice: '', amount: 0, sourceOfFund: '', estimatedWeek: '' },
  ],
  incidentalExpenses: [
    { id: 'INC-1', description: '', volume: '', unit: 'pcs/unit', unitPrice: '', amount: 0, sourceOfFund: 'Yayasan', estimatedWeek: 'Pekan 1' },
  ],
  weeklySummary: {
    yayasan: [0, 0, 0, 0, 0],
    bos: [0, 0, 0, 0, 0],
    komite: [0, 0, 0, 0, 0],
    donasi: [0, 0, 0, 0, 0],
    total: [0, 0, 0, 0, 0],
  },
  // Initialize new signature fields as null
  signatureKabidUmum: null,
  signatureBendaharaYayasan: null,
  signatureSekretarisYayasan: null,
  signatureKetuaYayasan: null,
  signatureKepalaMTA: null,
};

export const sourceOfFundOptions: SourceOfFund[] = ['Yayasan', 'Bos', 'Komite', 'Donasi'];
export const unitTypeOptions: UnitType[] = ['Buah', 'pcs/unit', 'Pack', 'Botol', 'Rim', 'Dus', 'Set', 'Meter', 'Liter', 'Kg'];
export const weekNumberOptions: WeekNumber[] = ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Pekan 4', 'Pekan 5'];