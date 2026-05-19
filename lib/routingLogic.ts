// lib/routingLogic.ts — homebuycheck.com

export const CALCMONEY_GOLD = "#D4AF37" as const;

const URLS = {
  lendingTree:
    process.env.NEXT_PUBLIC_LENDING_TREE_URL ?? "https://calcmoney.io/go/lending-tree",
} as const;

export interface HomeBuyRouteResult {
  recommendation: "rent" | "buy";
  url: string | null;
  label: string;
  sublabel: string;
  colorHex: string;
}

/**
 * time_horizon_years: how long user plans to stay.
 * threshold: < 5 years → rent, >= 5 years → buy + LendingTree
 */
export function resolveHomeBuyRoute(timeHorizonYears: number): HomeBuyRouteResult {
  if (timeHorizonYears < 5) {
    return {
      recommendation: "rent",
      url: null,
      label: "Renting is likely smarter for your timeline",
      sublabel:
        "Buying and selling within 5 years rarely covers transaction costs (closing costs + agent fees = 8-11%). You would likely lose money.",
      colorHex: "#F59E0B",
    };
  }

  return {
    recommendation: "buy",
    url: URLS.lendingTree,
    label: "Compare Mortgage Rates on LendingTree",
    sublabel: "At 5+ years, buying typically beats renting. Lock in a rate and start building equity.",
    colorHex: "#38BDF8",
  };
}
