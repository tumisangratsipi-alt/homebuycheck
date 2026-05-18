"use client";

import { useState } from "react";
import {
  getPercentile,
  getTopPercent,
  getDiffFromMedian,
  formatCurrency,
  NATIONAL_MEDIAN,
  AGE_BRACKET_LABELS,
  type AgeBracket,
} from "@/lib/scf-data";

interface Result {
  percentile: number;
  topPercent: number;
  bracket: AgeBracket;
  bracketLabel: string;
  netWorth: number;
  median: number;
  diffAmount: number;
  diffDirection: "ahead" | "behind";
}

function PercentileBar({ percentile }: { percentile: number }) {
  const fill = percentile;
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
        <span>Bottom</span>
        <span>Top</span>
      </div>
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: "var(--surface-2)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${fill}%`,
            background: "linear-gradient(90deg, #D4AF37 0%, #F0D060 100%)",
          }}
        />
        <div
          className="absolute top-0 h-full w-0.5 -translate-x-1/2"
          style={{ left: `${fill}%`, background: "#fff", opacity: 0.8 }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        <span>0th</span>
        <span className="font-semibold" style={{ color: "var(--gold)" }}>
          {percentile}th percentile
        </span>
        <span>100th</span>
      </div>
    </div>
  );
}

function ShareButtons({ result }: { result: Result }) {
  const [copied, setCopied] = useState(false);

  const shareText = `My net worth puts me in the top ${result.topPercent}% of Americans ages ${result.bracketLabel}. Calculated at networthrank.com`;

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://networthrank.com")}&summary=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex gap-3 mt-6">
      <button
        onClick={copyResult}
        className="btn-secondary flex-1"
        style={{ fontSize: 14 }}
      >
        {copied ? "Copied!" : "Copy result"}
      </button>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary flex-1 text-center"
        style={{ fontSize: 14, textDecoration: "none" }}
      >
        Share on LinkedIn
      </a>
    </div>
  );
}

function ResultCard({ result }: { result: Result }) {
  const isAhead = result.diffDirection === "ahead";

  const tone =
    result.percentile >= 75
      ? { label: "You&rsquo;re well ahead of most Americans your age.", color: "#4ade80" }
      : result.percentile >= 50
      ? { label: "You&rsquo;re above average for your age group.", color: "var(--gold)" }
      : result.percentile >= 25
      ? { label: "You&rsquo;re close to the national median.", color: "var(--gold)" }
      : { label: "Building net worth takes time. Here&rsquo;s what moves the needle most.", color: "#f87171" };

  return (
    <div className="result-card rounded-xl p-6 mt-8">
      <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
        Your rank
      </p>

      <div className="text-center my-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>You are in the</p>
        <p
          className="gold-text font-black leading-none my-2"
          style={{ fontSize: "clamp(52px, 12vw, 88px)" }}
        >
          TOP {result.topPercent}%
        </p>
        <p className="text-lg font-semibold" style={{ color: "var(--text-muted)" }}>
          of Americans ages {result.bracketLabel}
        </p>
      </div>

      <PercentileBar percentile={result.percentile} />

      <div
        className="mt-6 p-4 rounded-lg"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Median net worth, ages {result.bracketLabel}
          </span>
          <span className="font-semibold">{formatCurrency(result.median)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your net worth
          </span>
          <span className="font-semibold">{formatCurrency(result.netWorth)}</span>
        </div>
        <div
          className="mt-3 pt-3 flex justify-between items-center"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span className="text-sm font-medium">
            vs. median
          </span>
          <span
            className="font-bold text-sm"
            style={{ color: isAhead ? "#4ade80" : "#f87171" }}
          >
            {isAhead ? "+" : "-"}{formatCurrency(result.diffAmount)} {isAhead ? "ahead" : "behind"}
          </span>
        </div>
      </div>

      <p className="text-sm mt-4" style={{ color: tone.color }}>
        {tone.label.replace(/&rsquo;/g, "'")}
      </p>

      <ShareButtons result={result} />

      {/* CTAs */}
      <div className="mt-6 space-y-3">
        <a
          href="https://calcmoney.io/calculators/net-worth"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 px-4 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--gold)",
            color: "var(--gold)",
            textDecoration: "none",
          }}
        >
          See your full financial breakdown at CalcMoney &rarr;
        </a>
        <a
          href="https://www.empower.com/personal-wealth"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block w-full text-center py-3 px-4 rounded-lg font-medium text-sm transition-opacity hover:opacity-80"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          Track your net worth automatically &mdash; Empower is free &rarr;
        </a>
      </div>
    </div>
  );
}

export default function Calculator() {
  const [netWorthInput, setNetWorthInput] = useState("");
  const [bracket, setBracket] = useState<AgeBracket | "">("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");

    // Parse net worth — allow negative, strip $ and commas
    const raw = netWorthInput.replace(/[$,\s]/g, "");
    const nw = parseFloat(raw);

    if (isNaN(nw)) {
      setError("Enter a valid net worth amount (e.g. 250000 or -15000).");
      return;
    }
    if (!bracket) {
      setError("Select your age bracket.");
      return;
    }

    const percentile = getPercentile(nw, bracket);
    const topPercent = getTopPercent(percentile);
    const { amount: diffAmount, direction: diffDirection } = getDiffFromMedian(nw, bracket);
    const median = NATIONAL_MEDIAN[bracket];

    setResult({
      percentile,
      topPercent,
      bracket,
      bracketLabel: AGE_BRACKET_LABELS[bracket],
      netWorth: nw,
      median,
      diffAmount,
      diffDirection,
    });

    // Scroll to result on mobile
    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  return (
    <div>
      {/* Form */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Your net worth (assets minus debts)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 250000"
              value={netWorthInput}
              onChange={(e) => setNetWorthInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
            <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
              Total value of all assets (home equity, investments, savings, retirement accounts)
              minus all debts (mortgage balance, student loans, credit cards, car loans).
              Negative values are fine.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Your age bracket
            </label>
            <select
              value={bracket}
              onChange={(e) => setBracket(e.target.value as AgeBracket | "")}
            >
              <option value="">Select your age</option>
              {(Object.entries(AGE_BRACKET_LABELS) as [AgeBracket, string][]).map(
                ([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}

          <button className="btn-primary" onClick={handleCalculate}>
            Calculate My Rank
          </button>
        </div>
      </div>

      {/* Result */}
      <div id="result">
        {result && <ResultCard result={result} />}
      </div>
    </div>
  );
}
