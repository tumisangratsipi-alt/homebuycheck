"use client";

import { useState, useEffect } from "react";
import {
  calculateAffordability,
  formatCurrency,
  formatPercent,
  STATE_NAMES,
  type AffordabilityResult,
} from "@/lib/affordability-data";
import { resolveHomeBuyRoute, type HomeBuyRouteResult } from "@/lib/routingLogic";
import { logTelemetry } from "@/actions/logTelemetry";
import { captureEmail } from "@/actions/captureEmail";
import { TermTooltip } from "@/app/TermTooltip";

const STATE_CODES = Object.keys(STATE_NAMES).sort((a, b) =>
  STATE_NAMES[a].localeCompare(STATE_NAMES[b])
);

function DTIBar({ result }: { result: AffordabilityResult }) {
  const housingPct = Math.min(result.frontEndDTI, 100);
  const otherDebtPct = Math.min(
    (result.monthlyPayment > 0
      ? (result.backEndDTI - result.frontEndDTI)
      : 0),
    100 - housingPct
  );
  const remaining = Math.max(0, 100 - housingPct - otherDebtPct);

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-2">
        <span className="terminal-label"><TermTooltip term="DTI">Debt-to-income breakdown</TermTooltip></span>
        <span className="terminal-label" style={{ color: "var(--amber-500)" }}>
          36% limit
        </span>
      </div>
      {/* Front-end DTI bar */}
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="terminal-label"><TermTooltip term="DTI">Housing (front-end DTI)</TermTooltip></span>
          <span className="terminal-label" style={{ color: "var(--amber-500)" }}>
            {formatPercent(result.frontEndDTI)} / 28% limit
          </span>
        </div>
        <div
          className="relative h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(result.frontEndDTI / 28 * 100, 100)}%`,
              background: result.frontEndDTI > 28
                ? "linear-gradient(90deg, #EF4444, #F87171)"
                : "linear-gradient(90deg, #0EA5E9, #38BDF8)",
            }}
          />
        </div>
      </div>
      {/* Back-end DTI bar */}
      <div>
        <div className="flex justify-between mb-1">
          <span className="terminal-label"><TermTooltip term="DTI">Total debts (back-end DTI)</TermTooltip></span>
          <span className="terminal-label" style={{ color: "var(--amber-500)" }}>
            {formatPercent(result.backEndDTI)} / 36% limit
          </span>
        </div>
        <div
          className="relative h-2.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          {/* Housing portion */}
          <div
            className="absolute left-0 top-0 h-full transition-all duration-700"
            style={{
              width: `${Math.min(housingPct / 36 * 100, 100)}%`,
              background: "linear-gradient(90deg, #0EA5E9, #38BDF8)",
              borderRadius: otherDebtPct < 1 ? "4px" : "4px 0 0 4px",
            }}
          />
          {/* Other debts portion */}
          {otherDebtPct > 0.5 && (
            <div
              className="absolute top-0 h-full transition-all duration-700"
              style={{
                left: `${Math.min(housingPct / 36 * 100, 100)}%`,
                width: `${Math.min(otherDebtPct / 36 * 100, 100)}%`,
                background: "linear-gradient(90deg, #D97706, #F59E0B)",
              }}
            />
          )}
          {/* 36% limit marker */}
          <div
            className="absolute top-0 h-full w-px opacity-60"
            style={{ left: "100%", background: "#fff" }}
          />
        </div>
        <div className="flex gap-4 mt-2">
          <span className="terminal-label flex items-center gap-1">
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#38BDF8" }} />
            Housing
          </span>
          <span className="terminal-label flex items-center gap-1">
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "#F59E0B" }} />
            Other debts
          </span>
          <span className="terminal-label flex items-center gap-1">
            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
            Available
          </span>
        </div>
      </div>
    </div>
  );
}

function AffordabilityBadge({ rating }: { rating: AffordabilityResult["affordabilityRating"] }) {
  const config = {
    Conservative: { color: "#22C55E", bg: "rgba(34,197,94,0.12)", label: "Conservative" },
    Moderate:     { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Moderate" },
    Aggressive:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "Aggressive" },
  }[rating];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.color}33` }}
    >
      <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: config.color }} />
      {config.label}
    </span>
  );
}

function ResultCard({ result }: { result: AffordabilityResult }) {
  const hasPMI = result.monthlyPMI > 0;

  return (
    <div className="gradient-border-result rounded-xl p-6 mt-8">
      <div className="flex items-center justify-between mb-4">
        <p className="terminal-label">Affordability estimate</p>
        <AffordabilityBadge rating={result.affordabilityRating} />
      </div>

      {/* Hero number */}
      <div className="text-center my-6">
        <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
          Max home price in {result.stateName}
        </p>
        <p
          className="text-gradient-1 font-black leading-none glow-amber"
          style={{ fontSize: "clamp(48px, 12vw, 84px)" }}
        >
          {formatCurrency(result.maxHomePrice)}
        </p>
        <p className="mt-2 text-sm font-mono" style={{ color: "var(--text-muted)" }}>
          {formatPercent(result.downPaymentPct)} down &middot; {formatCurrency(result.loanAmount)} loan
        </p>
      </div>

      {/* Monthly payment breakdown */}
      <div className="holo-panel p-4 mt-6 space-y-2">
        <p className="terminal-label mb-3">Monthly payment breakdown</p>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Principal &amp; interest</span>
          <span className="tabular-gold text-sm">{formatCurrency(result.monthlyPrincipalInterest)}/mo</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Property tax (est.)</span>
          <span className="tabular-gold text-sm">{formatCurrency(result.monthlyPropertyTax)}/mo</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="terminal-label">Homeowner&apos;s insurance</span>
          <span className="tabular-gold text-sm">{formatCurrency(result.monthlyInsurance)}/mo</span>
        </div>
        {hasPMI && (
          <div className="flex justify-between items-center">
            <span className="terminal-label"><TermTooltip term="PMI">PMI (down &lt; 20%)</TermTooltip></span>
            <span className="tabular-gold text-sm">{formatCurrency(result.monthlyPMI)}/mo</span>
          </div>
        )}
        <div
          className="flex justify-between items-center pt-2 mt-1"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <span className="terminal-label"><TermTooltip term="PITI">Total monthly PITI{hasPMI ? "+PMI" : ""}</TermTooltip></span>
          <span
            className="font-bold font-mono text-sm"
            style={{ color: "var(--amber-500)" }}
          >
            {formatCurrency(result.monthlyPayment)}/mo
          </span>
        </div>
      </div>

      {/* DTI bar */}
      <DTIBar result={result} />

      {/* CTA */}
      <div className="mt-6 space-y-3">
        <a
          href="https://calcmoney.io/calculators/mortgage"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-orbital block w-full text-center py-3"
          style={{ textDecoration: "none" }}
        >
          Run a full mortgage scenario &amp; amortization at CalcMoney &rarr;
        </a>

        <div className="pt-3 border-t" style={{ borderColor: "var(--border-subtle, rgba(255,255,255,0.06))" }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Related tools</p>
          <div className="flex flex-col gap-2">
            <a href="https://salaryfact.com" target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              SalaryFact — what salary do you need for this mortgage in your city? &rarr;
            </a>
            <a href="https://networthrank.com" target="_blank" rel="noopener noreferrer" className="text-sm" style={{ color: "var(--color-accent)", textDecoration: "none" }}>
              NetWorthRank — does buying this home improve your wealth percentile? &rarr;
            </a>
          </div>
        </div>
      </div>

      {hasPMI && (
        <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          PMI applies because your down payment is less than 20%. Once you reach 20% equity, you can request PMI removal.
        </p>
      )}
    </div>
  );
}

function AffiliateCTA({ route }: { route: HomeBuyRouteResult }) {
  const isRent = route.recommendation === "rent";
  return (
    <div
      className="mt-6 p-4 rounded-xl"
      style={{
        background: isRent ? "rgba(245,158,11,0.06)" : "rgba(14,165,233,0.06)",
        border: `1px solid ${isRent ? "rgba(245,158,11,0.25)" : "rgba(14,165,233,0.25)"}`,
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: route.colorHex }}>
        {isRent ? "Based on your timeline" : "Ready to buy"}
      </p>
      <p className="text-sm mb-3 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {route.sublabel}
      </p>
      <a
        href={route.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block w-full text-center py-3 rounded-lg font-bold text-sm transition-[background-color,color,transform,opacity] duration-150 ease-out active:scale-[0.97]"
        style={{ background: route.colorHex, color: "#09090B", textDecoration: "none" }}
      >
        {route.label} &rarr;
      </a>
    </div>
  );
}

const TIME_HORIZON_OPTIONS = [
  { label: "1-2 yrs", value: 1 },
  { label: "3-4 yrs", value: 3 },
  { label: "5-7 yrs", value: 5 },
  { label: "8-10 yrs", value: 8 },
  { label: "10+ yrs", value: 11 },
] as const;

export default function Calculator({ defaultIncome }: { defaultIncome?: number }) {
  const [income, setIncome] = useState(defaultIncome ? String(defaultIncome) : "");
  const [debts, setDebts] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [rate, setRate] = useState("7.0");
  const [rateSource, setRateSource] = useState<"live" | "default">("default");
  const [term, setTerm] = useState<15 | 30>(30);

  useEffect(() => {
    fetch("https://calcmoney.io/api/market-pulse")
      .then((r) => r.json())
      .then((d) => {
        if (d?.mortgageRate30Y) {
          setRate(Number(d.mortgageRate30Y).toFixed(2));
          setRateSource("live");
        }
      })
      .catch(() => {});
  }, []);
  const [stateCode, setStateCode] = useState("");
  const [timeHorizon, setTimeHorizon] = useState(5);
  const [result, setResult] = useState<AffordabilityResult | null>(null);
  const [route, setRoute] = useState<HomeBuyRouteResult | null>(null);
  const [error, setError] = useState("");

  const parseNumber = (s: string) => parseFloat(s.replace(/[$,\s]/g, ""));

  const handleCalculate = () => {
    setError("");
    const grossAnnualIncome = parseNumber(income);
    const monthlyDebts = parseNumber(debts) || 0;
    const down = parseNumber(downPayment) || 0;
    const interestRate = parseFloat(rate);

    if (isNaN(grossAnnualIncome) || grossAnnualIncome <= 0) {
      setError("Enter a valid annual gross income.");
      return;
    }
    if (isNaN(interestRate) || interestRate <= 0 || interestRate > 25) {
      setError("Enter a valid interest rate (e.g. 7.0).");
      return;
    }
    if (!stateCode) {
      setError("Select your state.");
      return;
    }

    const res = calculateAffordability({
      grossAnnualIncome,
      monthlyDebts,
      downPayment: down,
      interestRate,
      loanTermYears: term,
      stateCode,
    });

    const routeResult = resolveHomeBuyRoute(timeHorizon);
    setResult(res);
    setRoute(routeResult);

    // Fire-and-forget telemetry
    void logTelemetry({
      annual_income: grossAnnualIncome,
      monthly_debts: monthlyDebts,
      down_payment: down,
      interest_rate: parseFloat(rate),
      loan_term_years: term,
      time_horizon_years: timeHorizon,
      state_code: stateCode,
    });

    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCalculate();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(212,175,55,0.20)",
    color: "var(--amber-400)",
  };

  return (
    <div>
      <div className="aura-panel p-6">
        <div className="flex items-center justify-between pb-4 mb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
            Home Affordability Calculator
          </span>
          <span className="inline-flex items-center gap-1 text-[8px] font-mono tracking-wide rounded px-1.5 py-0.5"
            style={{ color: "var(--color-accent)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--color-accent)", display: "inline-block" }} />
            Live data
          </span>
        </div>
        <div className="space-y-5">
          {/* Annual income */}
          <div>
            <label className="terminal-label block mb-2">
              Annual gross income (before taxes)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="85000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-lg px-4 py-3 text-base font-mono tracking-wider transition-[color,box-shadow,border-color] duration-150 ease-out"
              style={inputStyle}
            />
          </div>

          {/* Monthly debts */}
          <div>
            <label className="terminal-label block mb-2">
              Monthly debt payments (car, student loans, credit cards, etc.)
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="400"
              value={debts}
              onChange={(e) => setDebts(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-lg px-4 py-3 text-base font-mono tracking-wider transition-[color,box-shadow,border-color] duration-150 ease-out"
              style={inputStyle}
            />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Do not include rent — only recurring debt obligations.
            </p>
          </div>

          {/* Down payment */}
          <div>
            <label className="terminal-label block mb-2">
              Down payment amount
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="30000"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full rounded-lg px-4 py-3 text-base font-mono tracking-wider transition-[color,box-shadow,border-color] duration-150 ease-out"
              style={inputStyle}
            />
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Less than 20% of the home price triggers PMI (private mortgage insurance).
            </p>
          </div>

          {/* Interest rate */}
          <div>
            <label className="terminal-label mb-2 flex items-center gap-2">
              Interest rate (%)
              {rateSource === "live" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black font-mono tracking-widest" style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.3)" }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#D4AF37", display: "inline-block", boxShadow: "0 0 4px #D4AF37", animation: "pulse 2s infinite" }} />
                  LIVE
                </span>
              )}
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="7.0"
              min="0.1"
              max="25"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg px-4 py-3 text-base font-mono tracking-wider transition-[color,box-shadow,border-color] duration-150 ease-out"
              style={inputStyle}
            />
          </div>

          {/* Time horizon */}
          <div>
            <label className="terminal-label block mb-2">How long do you plan to stay?</label>
            <div className="flex gap-2 flex-wrap">
              {TIME_HORIZON_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTimeHorizon(value)}
                  className="flex-1 py-2.5 rounded-md text-xs font-mono font-bold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]"
                  style={{
                    background: timeHorizon === value
                      ? "rgba(14,165,233,0.2)"
                      : "rgba(255,255,255,0.04)",
                    color: timeHorizon === value ? "#38BDF8" : "var(--text-muted)",
                    border: timeHorizon === value
                      ? "1px solid rgba(14,165,233,0.5)"
                      : "1px solid var(--border-default)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Buying and selling within 5 years rarely covers transaction costs.
            </p>
          </div>

          {/* Loan term toggle */}
          <div>
            <label className="terminal-label block mb-2">Loan term</label>
            <div className="flex gap-2">
              {([30, 15] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerm(t)}
                  className="flex-1 py-2.5 rounded-md text-sm font-mono font-bold transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97]"
                  style={{
                    background: term === t
                      ? "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)"
                      : "rgba(255,255,255,0.04)",
                    color: term === t ? "#09090B" : "var(--text-muted)",
                    border: term === t ? "none" : "1px solid var(--border-default)",
                  }}
                >
                  {t}-year
                </button>
              ))}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="terminal-label block mb-2">State</label>
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-base transition-[color,box-shadow,border-color] duration-150 ease-out"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(212,175,55,0.20)",
                color: "var(--text-primary)",
              }}
            >
              <option value="" style={{ background: "#16181F" }}>
                Select your state
              </option>
              {STATE_CODES.map((code) => (
                <option key={code} value={code} style={{ background: "#16181F" }}>
                  {STATE_NAMES[code]}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--rose-500)" }}>
              {error}
            </p>
          )}

          <button className="btn-primary-gold" onClick={handleCalculate}>
            Calculate Affordability
          </button>
        </div>
      </div>

      <div id="result">
        {result && <ResultCard result={result} />}
        {route && <AffiliateCTA route={route} />}
        {result && <EmailCapture />}
      </div>
    </div>
  );
}

/* ─── Email Capture ─────────────────────────────────────────── */

function EmailCapture() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await captureEmail(email);
    if (res.ok) {
      setStatus("done");
    } else {
      setErrMsg(res.error ?? "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mt-6 rounded-xl px-5 py-4 text-center" style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-accent-dark)" }}>
        <p className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>You&rsquo;re on the list.</p>
        <p className="text-xs mt-1" style={{ color: "var(--color-ink-muted)" }}>We&rsquo;ll send rate alerts and home-buying insights. Unsubscribe any time.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl px-5 py-5" style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-border)" }}>
      <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-ink)" }}>Get rate alerts + home-buying tips</p>
      <p className="text-xs mb-4" style={{ color: "var(--color-ink-muted)" }}>We track mortgage rate moves and send a quick note when it matters for your number.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
          style={{ background: "var(--color-paper-3)", border: "1px solid var(--color-border)", color: "var(--color-ink)" }}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] disabled:opacity-50"
          style={{ background: "var(--color-accent)", color: "#000" }}
        >
          {status === "loading" ? "..." : "Notify me"}
        </button>
      </form>
      {status === "error" && <p className="text-xs mt-2" style={{ color: "var(--color-hud-negative)" }}>{errMsg}</p>}
    </div>
  );
}
