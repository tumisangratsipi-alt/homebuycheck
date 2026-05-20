// lib/routingLogic.ts — homebuycheck.com

export const CALCMONEY_GOLD = "#D4AF37" as const;

const URLS = {
  lendingTree:
    process.env.NEXT_PUBLIC_LENDING_TREE_URL ?? "https://calcmoney.io/go/lending-tree",
  betterment:
    process.env.NEXT_PUBLIC_BETTERMENT_URL ?? "https://calcmoney.io/go/betterment",
} as const;

export interface HomeBuyRouteResult {
  recommendation: "rent" | "buy";
  url: string;
  label: string;
  sublabel: string;
  colorHex: string;
}

/**
 * time_horizon_years: how long user plans to stay.
 * < 5 years → rent + invest down payment (Betterment)
 * >= 5 years → buy + compare rates (LendingTree)
 */
export function resolveHomeBuyRoute(timeHorizonYears: number): HomeBuyRouteResult {
  if (timeHorizonYears < 5) {
    return {
      recommendation: "rent",
      url: URLS.betterment,
      label: "Put Your Down Payment to Work — Betterment",
      sublabel:
        "Buying and selling within 5 years rarely covers transaction costs (8-11%). Keep renting and invest that down payment instead.",
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
