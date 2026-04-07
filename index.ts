// ============================================================
// VENTURESTACK - TYPE DEFINITIONS
// ============================================================

export type VentureType =
  | 'trading'
  | 'reselling'
  | 'freelance'
  | 'rental'
  | 'saas'
  | 'ecommerce'
  | 'consulting'
  | 'other';

export type TransactionType = 'income' | 'expense';

export type VentureStatus = 'active' | 'paused' | 'archived';

export type ScoreRating = 'scale' | 'maintain' | 'kill';

export interface Venture {
  id: string;
  user_id: string;
  name: string;
  type: VentureType;
  color: string;
  icon: string;
  status: VentureStatus;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  venture_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  receipt_url: string | null;
  date: string;
  is_recurring: boolean;
  created_at: string;
}

export interface TimeLog {
  id: string;
  user_id: string;
  venture_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  note: string;
  created_at: string;
}

export interface TaxProfile {
  id: string;
  user_id: string;
  filing_status: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  state: string;
  w2_income: number;
  estimated_deductions: number;
  created_at: string;
  updated_at: string;
}

export interface RecurringTemplate {
  id: string;
  user_id: string;
  venture_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  next_date: string;
  is_active: boolean;
  created_at: string;
}

// Computed types (not stored in DB)
export interface VenturePnL {
  venture: Venture;
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalHours: number;
  dollarPerHour: number | null;
  trend: number; // % change from prior period
}

export interface TaxEstimate {
  totalSEIncome: number;
  w2Income: number;
  totalIncome: number;
  seTax: number;
  federalIncomeTax: number;
  stateTax: number;
  totalTaxOwed: number;
  quarterlyPayment: number;
  nextDeadline: string;
  effectiveRate: number;
}

export interface VentureScore {
  venture_id: string;
  venture_name: string;
  rating: ScoreRating;
  profitMarginScore: number;
  dollarPerHourScore: number;
  growthScore: number;
  reasoning: string;
}

// Navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  VentureDetail: { ventureId: string };
  AddTransaction: { ventureId?: string };
  AddVenture: undefined;
  EditVenture: { ventureId: string };
  TimeLog: { ventureId: string };
  TaxCenter: undefined;
  Scorecard: undefined;
  Settings: undefined;
  Paywall: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Ventures: undefined;
  TaxCenter: undefined;
  Settings: undefined;
};

// Venture icons & colors
export const VENTURE_ICONS: Record<VentureType, string> = {
  trading: '📈',
  reselling: '🏷️',
  freelance: '💻',
  rental: '🏠',
  saas: '☁️',
  ecommerce: '🛒',
  consulting: '🤝',
  other: '⚡',
};

export const VENTURE_COLORS: string[] = [
  '#6366F1', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#3B82F6', // Blue
  '#84CC16', // Lime
];

export const EXPENSE_CATEGORIES = [
  'Supplies',
  'Software',
  'Advertising',
  'Shipping',
  'Fees & Commissions',
  'Equipment',
  'Travel',
  'Meals',
  'Office',
  'Insurance',
  'Professional Services',
  'Utilities',
  'Rent',
  'Inventory/COGS',
  'Subscriptions',
  'Education',
  'Vehicle/Mileage',
  'Phone & Internet',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Sales',
  'Services',
  'Commissions',
  'Royalties',
  'Rental Income',
  'Trading Gains',
  'Subscriptions',
  'Tips',
  'Refunds',
  'Other',
];
