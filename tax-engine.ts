// ============================================================
// VENTURESTACK - TAX ENGINE
// ============================================================
// Deterministic IRS 2026 tax calculations.
// NOT AI — pure math for accuracy and auditability.
// ============================================================

import { TaxEstimate } from '../types';

// 2026 Federal Income Tax Brackets (projected/estimated)
const FEDERAL_BRACKETS_2026 = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  married_joint: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
  married_separate: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
};

// Standard deductions 2026 (projected)
const STANDARD_DEDUCTION_2026: Record<string, number> = {
  single: 15700,
  married_joint: 31400,
  married_separate: 15700,
  head_of_household: 23500,
};

// Self-employment tax constants
const SE_TAX_RATE = 0.153; // 12.4% Social Security + 2.9% Medicare
const SE_SOCIAL_SECURITY_RATE = 0.124;
const SE_MEDICARE_RATE = 0.029;
const SE_ADDITIONAL_MEDICARE_RATE = 0.009; // on earnings > $200K
const SE_ADDITIONAL_MEDICARE_THRESHOLD = 200000;
const SE_SOCIAL_SECURITY_WAGE_BASE_2026 = 174900; // projected

// Quarterly deadlines
const QUARTERLY_DEADLINES_2026 = [
  { quarter: 'Q1', deadline: '2026-04-15', period: 'Jan 1 – Mar 31' },
  { quarter: 'Q2', deadline: '2026-06-15', period: 'Apr 1 – May 31' },
  { quarter: 'Q3', deadline: '2026-09-15', period: 'Jun 1 – Aug 31' },
  { quarter: 'Q4', deadline: '2027-01-15', period: 'Sep 1 – Dec 31' },
];

function calculateFederalIncomeTax(
  taxableIncome: number,
  filingStatus: string
): number {
  const brackets =
    FEDERAL_BRACKETS_2026[filingStatus as keyof typeof FEDERAL_BRACKETS_2026] ||
    FEDERAL_BRACKETS_2026.single;

  let tax = 0;
  let remainingIncome = Math.max(0, taxableIncome);

  for (const bracket of brackets) {
    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max - bracket.min
    );
    if (taxableInBracket <= 0) break;
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

function calculateSelfEmploymentTax(netSEIncome: number): number {
  // 92.35% of net SE income is subject to SE tax
  const seBase = netSEIncome * 0.9235;

  // Social Security portion (capped at wage base)
  const socialSecurityBase = Math.min(seBase, SE_SOCIAL_SECURITY_WAGE_BASE_2026);
  const socialSecurityTax = socialSecurityBase * SE_SOCIAL_SECURITY_RATE;

  // Medicare portion (no cap)
  const medicareTax = seBase * SE_MEDICARE_RATE;

  // Additional Medicare Tax on earnings > $200K
  const additionalMedicareTax =
    seBase > SE_ADDITIONAL_MEDICARE_THRESHOLD
      ? (seBase - SE_ADDITIONAL_MEDICARE_THRESHOLD) * SE_ADDITIONAL_MEDICARE_RATE
      : 0;

  return socialSecurityTax + medicareTax + additionalMedicareTax;
}

function getNextQuarterlyDeadline(): { quarter: string; deadline: string; period: string } {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  for (const q of QUARTERLY_DEADLINES_2026) {
    if (q.deadline >= today) {
      return q;
    }
  }

  // If all 2026 deadlines passed, return Q1 of next year
  return {
    quarter: 'Q1 2027',
    deadline: '2027-04-15',
    period: 'Jan 1 – Mar 31',
  };
}

// Simple state tax estimates (flat-ish approximations)
const STATE_TAX_RATES: Record<string, number> = {
  AL: 0.05, AK: 0, AZ: 0.025, AR: 0.044, CA: 0.093, CO: 0.044, CT: 0.05,
  DE: 0.066, FL: 0, GA: 0.0549, HI: 0.072, ID: 0.058, IL: 0.0495,
  IN: 0.0305, IA: 0.038, KS: 0.057, KY: 0.04, LA: 0.0425, ME: 0.0715,
  MD: 0.0575, MA: 0.05, MI: 0.0425, MN: 0.0985, MS: 0.05, MO: 0.048,
  MT: 0.059, NE: 0.0564, NV: 0, NH: 0, NJ: 0.0637, NM: 0.059,
  NY: 0.0685, NC: 0.045, ND: 0.0195, OH: 0.035, OK: 0.0475, OR: 0.099,
  PA: 0.0307, RI: 0.0599, SC: 0.064, SD: 0, TN: 0, TX: 0, UT: 0.0465,
  VT: 0.066, VA: 0.0575, WA: 0, WV: 0.055, WI: 0.0765, WY: 0, DC: 0.085,
};

export function calculateTaxEstimate(
  totalSEIncome: number,
  w2Income: number,
  filingStatus: string,
  state: string,
  estimatedDeductions: number
): TaxEstimate {
  // Step 1: Self-employment tax
  const seTax = calculateSelfEmploymentTax(totalSEIncome);

  // Step 2: Deductible portion of SE tax (50%)
  const seDeduction = seTax / 2;

  // Step 3: Adjusted Gross Income
  const agi = w2Income + totalSEIncome - seDeduction;

  // Step 4: Taxable income
  const standardDeduction =
    STANDARD_DEDUCTION_2026[filingStatus] || STANDARD_DEDUCTION_2026.single;
  const deduction = Math.max(standardDeduction, estimatedDeductions);
  const taxableIncome = Math.max(0, agi - deduction);

  // Step 5: Federal income tax
  const federalIncomeTax = calculateFederalIncomeTax(taxableIncome, filingStatus);

  // Step 6: State tax (simplified)
  const stateRate = STATE_TAX_RATES[state.toUpperCase()] || 0;
  const stateTax = taxableIncome * stateRate;

  // Step 7: Total tax owed (SE income portion only — subtract W2 withholding assumed)
  // Approximate W2 withholding
  const estimatedW2Withholding = w2Income > 0
    ? calculateFederalIncomeTax(Math.max(0, w2Income - deduction), filingStatus)
    : 0;

  const totalTaxOwed = Math.max(
    0,
    federalIncomeTax + seTax + stateTax - estimatedW2Withholding
  );

  // Step 8: Quarterly payment
  const quarterlyPayment = totalTaxOwed / 4;

  // Step 9: Effective rate
  const totalIncome = w2Income + totalSEIncome;
  const effectiveRate = totalIncome > 0 ? totalTaxOwed / totalIncome : 0;

  const nextDeadlineInfo = getNextQuarterlyDeadline();

  return {
    totalSEIncome,
    w2Income,
    totalIncome,
    seTax: Math.round(seTax * 100) / 100,
    federalIncomeTax: Math.round(federalIncomeTax * 100) / 100,
    stateTax: Math.round(stateTax * 100) / 100,
    totalTaxOwed: Math.round(totalTaxOwed * 100) / 100,
    quarterlyPayment: Math.round(quarterlyPayment * 100) / 100,
    nextDeadline: nextDeadlineInfo.deadline,
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
  };
}

export { getNextQuarterlyDeadline, QUARTERLY_DEADLINES_2026 };
