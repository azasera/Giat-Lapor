export interface RealizationItem {
  id: string;
  expenseItemId: string; // Link to original expense item from RAB
  description: string;
  plannedAmount: number; // From RAB
  actualAmount: number; // Actual spending
  actualDate: string; // When the expense occurred
  receipt?: string; // Optional receipt/proof image URL
  notes?: string;
}

export interface RABRealization {
  id: string;
  rabId: string; // Link to original RAB
  user_id: string;
  status: 'in_progress' | 'completed' | 'submitted' | 'approved';
  realizationItems: RealizationItem[];
  totalPlanned: number;
  totalActual: number;
  variance: number; // Difference between planned and actual
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
}

export const defaultRABRealization: Partial<RABRealization> = {
  status: 'in_progress',
  realizationItems: [],
  totalPlanned: 0,
  totalActual: 0,
  variance: 0,
};
