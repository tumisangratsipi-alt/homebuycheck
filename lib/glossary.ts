export interface GlossaryEntry {
  term: string;
  definition: string;
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  DTI: {
    term: "Debt-to-Income Ratio",
    definition: "Your monthly debt payments divided by gross monthly income. Lenders typically cap approval at 43%. Below 36% is considered healthy.",
  },
  LTV: {
    term: "Loan-to-Value Ratio",
    definition: "The loan amount as a percentage of the property's appraised value. Above 80% generally triggers PMI. Lower LTV means better rates.",
  },
  PMI: {
    term: "Private Mortgage Insurance",
    definition: "Insurance required on conventional loans when your down payment is below 20%. It protects the lender, not you. Cancels automatically at 78% LTV.",
  },
  PITI: {
    term: "Principal, Interest, Taxes & Insurance",
    definition: "The four components of a full monthly mortgage payment. Lenders qualify you on total PITI, not just principal and interest.",
  },
};

export function lookupTerm(key: string): GlossaryEntry | undefined {
  return GLOSSARY[key];
}
