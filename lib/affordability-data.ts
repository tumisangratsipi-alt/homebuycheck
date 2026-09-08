// ============================================================
// Home Affordability Calculation Logic
// Rules: 28/36 DTI, PITI estimation, PMI if < 20% down
// ============================================================

export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  DC: "District of Columbia", FL: "Florida", GA: "Georgia", HI: "Hawaii",
  ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska",
  NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island",
  SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas",
  UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// Real state-level effective property tax rates. Source: Tax Foundation,
// "Property Taxes by State and County, 2026" (https://taxfoundation.org/
// data/all/state/property-taxes-by-state-county/), 2024 ACS 5-year estimate
// (the real, current vintage for this dataset - effective property tax
// rates lag since they're derived from Census ACS 5-year data, not an
// annually-reset table). Replaces the prior flat 1.1% national-average
// assumption now that the calculator collects a real state selection.
// A 1.1% fallback (the old national-average figure) covers any state code
// not in this table, which should not happen given the form requires a
// selection from STATE_NAMES above.
export const STATE_PROPERTY_TAX_RATES: Record<string, number> = {
  AL: 0.0037, AK: 0.0094, AZ: 0.0048, AR: 0.0056,
  CA: 0.0070, CO: 0.0050, CT: 0.0154, DE: 0.0054,
  DC: 0.0060, FL: 0.0078, GA: 0.0079, HI: 0.0029,
  ID: 0.0050, IL: 0.0188, IN: 0.0076, IA: 0.0133,
  KS: 0.0121, KY: 0.0074, LA: 0.0055, ME: 0.0098,
  MD: 0.0092, MA: 0.0100, MI: 0.0119, MN: 0.0100,
  MS: 0.0058, MO: 0.0089, MT: 0.0061, NE: 0.0144,
  NV: 0.0050, NH: 0.0150, NJ: 0.0188, NM: 0.0063,
  NY: 0.0130, NC: 0.0066, ND: 0.0092, OH: 0.0136,
  OK: 0.0079, OR: 0.0081, PA: 0.0126, RI: 0.0112,
  SC: 0.0049, SD: 0.0100, TN: 0.0052, TX: 0.0140,
  UT: 0.0048, VT: 0.0151, VA: 0.0078, WA: 0.0075,
  WV: 0.0051, WI: 0.0132, WY: 0.0053,
};

const NATIONAL_AVERAGE_PROPERTY_TAX_RATE = 0.011;

export interface AffordabilityInputs {
  grossAnnualIncome: number;
  monthlyDebts: number;
  downPayment: number;
  interestRate: number;       // percent e.g. 7.0
  loanTermYears: 15 | 30;
  stateCode: string;
}

export interface AffordabilityResult {
  maxHomePrice: number;
  loanAmount: number;
  monthlyPayment: number;       // total PITI + PMI
  monthlyPrincipalInterest: number;
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPMI: number;
  frontEndDTI: number;          // % of gross monthly income
  backEndDTI: number;           // % of gross monthly income
  downPaymentPct: number;       // % of home price
  affordabilityRating: "Conservative" | "Moderate" | "Aggressive";
  grossMonthlyIncome: number;
  stateName: string;
}

// Monthly mortgage payment for given principal, monthly rate, number of months
function calcMonthlyPI(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  const r = monthlyRate;
  const n = months;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// Given a home price, compute total monthly PITI+PMI
function computeMonthlyPayment(
  homePrice: number,
  downPayment: number,
  annualRate: number,
  termYears: number,
  propertyTaxRate: number
): {
  total: number;
  pi: number;
  tax: number;
  insurance: number;
  pmi: number;
} {
  const loan = Math.max(0, homePrice - downPayment);
  const monthlyRate = annualRate / 100 / 12;
  const months = termYears * 12;
  const pi = calcMonthlyPI(loan, monthlyRate, months);
  const tax = (homePrice * propertyTaxRate) / 12;
  const insurance = (homePrice * 0.005) / 12;    // 0.5% annually
  const downPct = homePrice > 0 ? downPayment / homePrice : 0;
  const pmi = downPct < 0.20 ? (loan * 0.005) / 12 : 0; // 0.5% of loan annually

  return {
    total: pi + tax + insurance + pmi,
    pi,
    tax,
    insurance,
    pmi,
  };
}

// Binary search for max home price given an allowable total monthly housing payment
function solveForHomePrice(
  maxHousingPayment: number,
  downPayment: number,
  annualRate: number,
  termYears: number,
  propertyTaxRate: number
): number {
  let lo = downPayment;
  let hi = downPayment + 10_000_000;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const { total } = computeMonthlyPayment(mid, downPayment, annualRate, termYears, propertyTaxRate);
    if (total < maxHousingPayment) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function calculateAffordability(inputs: AffordabilityInputs): AffordabilityResult {
  const {
    grossAnnualIncome,
    monthlyDebts,
    downPayment,
    interestRate,
    loanTermYears,
    stateCode,
  } = inputs;

  const grossMonthlyIncome = grossAnnualIncome / 12;
  const propertyTaxRate = STATE_PROPERTY_TAX_RATES[stateCode] ?? NATIONAL_AVERAGE_PROPERTY_TAX_RATE;

  // Front-end limit: 28% of gross monthly income
  const maxHousingFrontEnd = grossMonthlyIncome * 0.28;

  // Back-end limit: 36% total — subtract existing debts
  const maxHousingBackEnd = grossMonthlyIncome * 0.36 - monthlyDebts;

  // Conservative: use the lower limit
  const maxHousingPayment = Math.min(maxHousingFrontEnd, Math.max(0, maxHousingBackEnd));

  // Solve for home price
  const maxHomePrice = Math.max(downPayment, solveForHomePrice(maxHousingPayment, downPayment, interestRate, loanTermYears, propertyTaxRate));
  const roundedPrice = Math.round(maxHomePrice / 1000) * 1000;

  const { total, pi, tax, insurance, pmi } = computeMonthlyPayment(roundedPrice, downPayment, interestRate, loanTermYears, propertyTaxRate);

  const loanAmount = Math.max(0, roundedPrice - downPayment);
  const downPaymentPct = roundedPrice > 0 ? (downPayment / roundedPrice) * 100 : 0;

  const frontEndDTI = grossMonthlyIncome > 0 ? (total / grossMonthlyIncome) * 100 : 0;
  const backEndDTI = grossMonthlyIncome > 0 ? ((total + monthlyDebts) / grossMonthlyIncome) * 100 : 0;

  let affordabilityRating: "Conservative" | "Moderate" | "Aggressive";
  if (backEndDTI <= 28) {
    affordabilityRating = "Conservative";
  } else if (backEndDTI <= 36) {
    affordabilityRating = "Moderate";
  } else {
    affordabilityRating = "Aggressive";
  }

  return {
    maxHomePrice: roundedPrice,
    loanAmount,
    monthlyPayment: total,
    monthlyPrincipalInterest: pi,
    monthlyPropertyTax: tax,
    monthlyInsurance: insurance,
    monthlyPMI: pmi,
    frontEndDTI,
    backEndDTI,
    downPaymentPct,
    affordabilityRating,
    grossMonthlyIncome,
    stateName: STATE_NAMES[stateCode] ?? stateCode,
  };
}

// ---- Formatting helpers ----
export function formatCurrency(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function formatCurrencyFull(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function formatPercent(n: number): string {
  return n.toFixed(1) + "%";
}
