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
  termYears: number
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
  const tax = (homePrice * 0.011) / 12;          // 1.1% annually
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
  termYears: number
): number {
  let lo = downPayment;
  let hi = downPayment + 10_000_000;

  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const { total } = computeMonthlyPayment(mid, downPayment, annualRate, termYears);
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

  // Front-end limit: 28% of gross monthly income
  const maxHousingFrontEnd = grossMonthlyIncome * 0.28;

  // Back-end limit: 36% total — subtract existing debts
  const maxHousingBackEnd = grossMonthlyIncome * 0.36 - monthlyDebts;

  // Conservative: use the lower limit
  const maxHousingPayment = Math.min(maxHousingFrontEnd, Math.max(0, maxHousingBackEnd));

  // Solve for home price
  const maxHomePrice = Math.max(downPayment, solveForHomePrice(maxHousingPayment, downPayment, interestRate, loanTermYears));
  const roundedPrice = Math.round(maxHomePrice / 1000) * 1000;

  const { total, pi, tax, insurance, pmi } = computeMonthlyPayment(roundedPrice, downPayment, interestRate, loanTermYears);

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
