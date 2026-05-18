// Federal Reserve 2022 Survey of Consumer Finances (SCF)
// Published October 2023
// Net worth by age group at key percentiles (in USD)
// Source: https://www.federalreserve.gov/publications/files/scf23.pdf

export type AgeBracket =
  | "under35"
  | "35to44"
  | "45to54"
  | "55to64"
  | "65to74"
  | "75plus";

export const AGE_BRACKET_LABELS: Record<AgeBracket, string> = {
  under35: "Under 35",
  "35to44": "35-44",
  "45to54": "45-54",
  "55to64": "55-64",
  "65to74": "65-74",
  "75plus": "75 and older",
};

// Each entry: [percentile, net worth at that percentile]
// Percentile 0 = $0 net worth (minimum anchor), 100 = top
type PercentilePoint = [number, number];

export const SCF_DATA: Record<AgeBracket, PercentilePoint[]> = {
  under35: [
    [0, -10000],
    [10, -3000],
    [25, 10000],
    [50, 39000],
    [75, 138000],
    [90, 375000],
    [95, 600000],
    [99, 1200000],
    [100, 5000000],
  ],
  "35to44": [
    [0, -50000],
    [10, 2000],
    [25, 48000],
    [50, 135000],
    [75, 385000],
    [90, 970000],
    [95, 1500000],
    [99, 3100000],
    [100, 15000000],
  ],
  "45to54": [
    [0, -30000],
    [10, 5000],
    [25, 82000],
    [50, 248000],
    [75, 694000],
    [90, 1900000],
    [95, 2800000],
    [99, 5700000],
    [100, 25000000],
  ],
  "55to64": [
    [0, -20000],
    [10, 9000],
    [25, 90000],
    [50, 365000],
    [75, 1070000],
    [90, 2700000],
    [95, 3700000],
    [99, 7800000],
    [100, 35000000],
  ],
  "65to74": [
    [0, -10000],
    [10, 14000],
    [25, 107000],
    [50, 410000],
    [75, 1100000],
    [90, 2700000],
    [95, 3700000],
    [99, 8300000],
    [100, 40000000],
  ],
  "75plus": [
    [0, -5000],
    [10, 8000],
    [25, 83000],
    [50, 335000],
    [75, 900000],
    [90, 2400000],
    [95, 3200000],
    [99, 6400000],
    [100, 30000000],
  ],
};

export const NATIONAL_MEDIAN: Record<AgeBracket, number> = {
  under35: 39000,
  "35to44": 135000,
  "45to54": 248000,
  "55to64": 365000,
  "65to74": 410000,
  "75plus": 335000,
};

/**
 * Interpolate percentile for a given net worth within an age bracket.
 * Returns percentile as integer 1-99.
 */
export function getPercentile(netWorth: number, bracket: AgeBracket): number {
  const data = SCF_DATA[bracket];

  // Below the floor
  if (netWorth <= data[0][1]) return 1;
  // Above the ceiling
  if (netWorth >= data[data.length - 1][1]) return 99;

  for (let i = 0; i < data.length - 1; i++) {
    const [p0, w0] = data[i];
    const [p1, w1] = data[i + 1];
    if (netWorth >= w0 && netWorth <= w1) {
      // Linear interpolation
      const t = (netWorth - w0) / (w1 - w0);
      const interpolated = p0 + t * (p1 - p0);
      return Math.min(99, Math.max(1, Math.round(interpolated)));
    }
  }

  return 50;
}

/**
 * Get the "top X%" framing.
 * Percentile 88 = "top 12%"
 */
export function getTopPercent(percentile: number): number {
  return Math.max(1, 100 - percentile);
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function getDiffFromMedian(
  netWorth: number,
  bracket: AgeBracket
): { amount: number; direction: "ahead" | "behind" } {
  const median = NATIONAL_MEDIAN[bracket];
  const diff = netWorth - median;
  return {
    amount: Math.abs(diff),
    direction: diff >= 0 ? "ahead" : "behind",
  };
}
