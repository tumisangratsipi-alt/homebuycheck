import type { Metadata } from "next";
import Calculator from "@/app/Calculator";
import {
  calculateAffordability,
  formatCurrency,
} from "@/lib/affordability-data";

export const dynamic = "force-static";

const INCOME_TIERS = [50000, 60000, 75000, 80000, 100000, 120000, 150000, 200000, 250000, 300000];

function parseIncomeSlug(slug: string): number | null {
  const n = parseInt(slug, 10);
  if (isNaN(n) || !INCOME_TIERS.includes(n)) return null;
  return n;
}

function formatK(n: number): string {
  return n >= 1000 ? `$${n / 1000}k` : `$${n}`;
}

export function generateStaticParams() {
  return INCOME_TIERS.map((income) => ({ income: String(income) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ income: string }>;
}): Promise<Metadata> {
  const { income: slug } = await params;
  const income = parseIncomeSlug(slug);
  if (!income) return {};

  // Reference calc: 10% down, no debts, 7% rate, 30yr
  const result = calculateAffordability({
    grossAnnualIncome: income,
    monthlyDebts: 0,
    downPayment: Math.round(income * 0.1),
    interestRate: 7.0,
    loanTermYears: 30,
    stateCode: "TX",
  });

  const gross = formatCurrency(income);
  const maxHome = formatCurrency(result.maxHomePrice);

  return {
    title: `How Much House Can I Afford on a ${gross} Salary?`,
    description: `On a ${gross} salary with 10% down and a 7% mortgage rate, you can afford up to ${maxHome}. See the full breakdown including monthly payment, DTI, and PMI.`,
    alternates: {
      canonical: `https://homebuycheck.com/salary/${slug}`,
    },
    openGraph: {
      title: `${gross} Salary — Home Affordability Calculator`,
      description: `How much house can you afford on ${gross}? See the 28/36 DTI rule applied to your income.`,
      url: `https://homebuycheck.com/salary/${slug}`,
    },
  };
}

// Pre-compute scenarios for the static data table
function getScenarios(income: number) {
  const downPayments = [
    { label: "3.5% down (FHA minimum)", pct: 0.035 },
    { label: "5% down", pct: 0.05 },
    { label: "10% down", pct: 0.10 },
    { label: "20% down (no PMI)", pct: 0.20 },
  ];
  const rates = [6.5, 7.0, 7.5];

  return rates.map((rate) => ({
    rate,
    scenarios: downPayments.map(({ label, pct }) => {
      const down = Math.round(income * pct);
      const result = calculateAffordability({
        grossAnnualIncome: income,
        monthlyDebts: 0,
        downPayment: down,
        interestRate: rate,
        loanTermYears: 30,
        stateCode: "TX",
      });
      return { label, down, maxHome: result.maxHomePrice, monthly: result.monthlyPayment };
    }),
  }));
}

// The 28/36 rule breakdown
function getDtiBreakdown(income: number) {
  const monthly = income / 12;
  return {
    maxHousing: monthly * 0.28,      // front-end limit
    maxTotalDebt: monthly * 0.36,    // back-end limit
  };
}

export default async function SalaryAffordabilityPage({
  params,
}: {
  params: Promise<{ income: string }>;
}) {
  const { income: slug } = await params;
  const income = parseIncomeSlug(slug);
  if (!income) return <div>Not found</div>;

  const gross = formatCurrency(income);
  const grossK = formatK(income);
  const dti = getDtiBreakdown(income);
  const scenarios = getScenarios(income);

  // Hero reference: 10% down, 7% rate
  const hero = calculateAffordability({
    grossAnnualIncome: income,
    monthlyDebts: 0,
    downPayment: Math.round(income * 0.10),
    interestRate: 7.0,
    loanTermYears: 30,
    stateCode: "TX",
  });

  // Conservative: 20% down, 6.5%
  const conservative = calculateAffordability({
    grossAnnualIncome: income,
    monthlyDebts: 0,
    downPayment: Math.round(income * 0.20),
    interestRate: 6.5,
    loanTermYears: 30,
    stateCode: "TX",
  });

  const nearbyTiers = INCOME_TIERS.filter((t) => t !== income).slice(
    Math.max(0, INCOME_TIERS.indexOf(income) - 2),
    INCOME_TIERS.indexOf(income) + 3
  ).filter((t) => t !== income).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Home Affordability on a ${gross} Salary`,
    description: `On a ${gross} salary, the 28/36 rule allows up to ${formatCurrency(dti.maxHousing)}/month on housing.`,
    url: `https://homebuycheck.com/salary/${slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "HomeBuyCheck", item: "https://homebuycheck.com" },
        { "@type": "ListItem", position: 2, name: `${gross} Salary Affordability`, item: `https://homebuycheck.com/salary/${slug}` },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `How much house can I afford on a ${gross} salary?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a ${gross} salary with 10% down and a 7% mortgage rate, you can afford a home up to ${formatCurrency(hero.maxHomePrice)}. Using the conservative 20% down at 6.5%, that rises to ${formatCurrency(conservative.maxHomePrice)}. These figures assume no existing monthly debts. The 28/36 DTI rule limits your housing payment to ${formatCurrency(dti.maxHousing)}/month.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the 28/36 rule for a ${gross} income?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The 28/36 rule says your housing costs should not exceed 28% of gross monthly income and total debts should not exceed 36%. On a ${gross} salary, that means maximum housing costs of ${formatCurrency(dti.maxHousing)}/month and maximum total debt payments of ${formatCurrency(dti.maxTotalDebt)}/month. Most conventional lenders use these thresholds.`,
        },
      },
      {
        "@type": "Question",
        name: `How much should I put down on a ${grossK} salary?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `With a ${gross} income, a 10% down payment is ${formatCurrency(Math.round(income * 0.10))} and a 20% down payment is ${formatCurrency(Math.round(income * 0.20))}. The 20% threshold eliminates PMI (typically 0.5-1.5% of the loan annually), which meaningfully reduces your monthly payment and the total cost of the loan. FHA loans allow as little as 3.5% down but require mortgage insurance for the life of the loan.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I afford a house on ${grossK} with existing debt?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, but existing debts reduce your maximum home price. The back-end DTI limit of 36% means all monthly debts combined — car payment, student loans, credit cards, and your new mortgage — cannot exceed ${formatCurrency(dti.maxTotalDebt)}/month. Each $500/month in existing debts reduces your maximum home price by approximately $70,000-$90,000 at today's rates. Use the calculator above to enter your actual debt load.`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(9,9,11,0.95)", borderColor: "var(--border)", backdropFilter: "blur(8px)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="font-bold text-lg tracking-tight flex items-center gap-2"
            style={{ color: "var(--text-primary)", textDecoration: "none" }}
          >
            <img src="/logo.png" alt="HomeBuyCheck logo" style={{ height: "28px", width: "auto" }} />
            <span className="text-gradient-1">homebuy</span>check.com
          </a>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            28/36 DTI Rule
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        {/* Breadcrumb */}
        <nav className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
          <a href="/" style={{ color: "var(--amber-500)", textDecoration: "none" }}>HomeBuyCheck</a>
          {" / "}
          <span>{gross} salary</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-black mb-3 leading-tight" style={{ fontSize: "clamp(22px, 5vw, 36px)" }}>
            How Much House Can I Afford
            <br />
            <span className="text-gradient-1">on a {gross} Salary?</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            On a {gross} salary, the 28/36 rule limits your housing payment to{" "}
            <strong style={{ color: "var(--amber-400)" }}>{formatCurrency(dti.maxHousing)}/month</strong>.
            With 10% down at a 7% rate, that buys a home up to{" "}
            <strong style={{ color: "var(--amber-400)" }}>{formatCurrency(hero.maxHomePrice)}</strong>.
            Adjust for your down payment and existing debts below.
          </p>
        </div>

        {/* DTI summary card */}
        <div className="gradient-border-result rounded-xl p-6 mb-8">
          <p className="terminal-label mb-4">28/36 rule — {gross} income</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Gross monthly income", amount: income / 12 },
              { label: "Max housing (28%)", amount: dti.maxHousing },
              { label: "Max total debt (36%)", amount: dti.maxTotalDebt },
              { label: "Max home price (10% down, 7%)", amount: hero.maxHomePrice },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center px-4 py-3 rounded-lg"
                style={{
                  background: row.label.startsWith("Max home") ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
                  border: row.label.startsWith("Max home") ? "1px solid rgba(212,175,55,0.25)" : "1px solid var(--border-subtle)",
                }}
              >
                <span className="terminal-label text-xs">{row.label}</span>
                <span className="tabular-gold font-mono font-bold text-sm">{formatCurrency(row.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scenario matrix */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Maximum home price by rate and down payment</h2>
          {scenarios.map(({ rate, scenarios: rows }) => (
            <div key={rate} className="mb-6">
              <p className="terminal-label mb-2">{rate}% mortgage rate — 30-year fixed</p>
              <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-subtle)" }}>
                      <th className="text-left px-4 py-3 terminal-label">Down payment</th>
                      <th className="text-right px-4 py-3 terminal-label">Amount</th>
                      <th className="text-right px-4 py-3 terminal-label">Max home price</th>
                      <th className="text-right px-4 py-3 terminal-label">Monthly PITI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const isNoPMI = row.label.includes("20%");
                      return (
                        <tr
                          key={i}
                          style={{
                            borderBottom: i < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
                            background: isNoPMI ? "rgba(212,175,55,0.06)" : "transparent",
                          }}
                        >
                          <td className="px-4 py-3 text-xs" style={{ color: isNoPMI ? "var(--amber-400)" : "var(--text-secondary)" }}>
                            {row.label}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                            {formatCurrency(row.down)}
                          </td>
                          <td className="px-4 py-3 text-right tabular-gold font-mono font-bold text-sm">
                            {formatCurrency(row.maxHome)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                            {formatCurrency(row.monthly)}/mo
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Assumes no existing monthly debts and 30-year fixed mortgage. Property tax estimated at 1.1% annually. Homeowner insurance at 0.5%. PMI at 0.5% of loan for down payments below 20%.
          </p>
        </section>

        {/* Key insight */}
        <div
          className="mb-8 p-5 rounded-xl"
          style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.25)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--amber-500)" }}>
            PMI math on a {gross} salary
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Putting down less than 20% on a {gross} income triggers PMI at roughly 0.5% of the loan per year.
            On a {formatCurrency(hero.maxHomePrice)} home, that is{" "}
            <strong style={{ color: "var(--amber-400)" }}>{formatCurrency(hero.monthlyPMI * 12)}/year</strong> in extra cost
            until you reach 20% equity. Saving to the 20% threshold eliminates this entirely and reduces
            monthly payment by {formatCurrency(hero.monthlyPMI)}/month.
          </p>
        </div>

        {/* Interactive calculator */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Run your exact numbers</h2>
          <Calculator defaultIncome={income} />
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `How much house can I afford on a ${gross} salary?`,
                a: `On a ${gross} salary with 10% down and a 7% mortgage rate, you can afford a home up to ${formatCurrency(hero.maxHomePrice)}. Using the conservative 20% down at 6.5%, that rises to ${formatCurrency(conservative.maxHomePrice)}. These figures assume no existing monthly debts. The 28/36 DTI rule limits your housing payment to ${formatCurrency(dti.maxHousing)}/month.`,
              },
              {
                q: `What is the 28/36 rule for a ${gross} income?`,
                a: `The 28/36 rule says your housing costs should not exceed 28% of gross monthly income and total debts should not exceed 36%. On a ${gross} salary, that means maximum housing costs of ${formatCurrency(dti.maxHousing)}/month and maximum total debt payments of ${formatCurrency(dti.maxTotalDebt)}/month. Most conventional lenders use these thresholds.`,
              },
              {
                q: `How much should I put down on a ${grossK} salary?`,
                a: `With a ${gross} income, a 10% down payment is ${formatCurrency(Math.round(income * 0.10))} and a 20% down payment is ${formatCurrency(Math.round(income * 0.20))}. The 20% threshold eliminates PMI (typically 0.5% of the loan annually), which saves ${formatCurrency(hero.monthlyPMI * 12)}/year at this income level. FHA loans allow 3.5% down but require mortgage insurance for the life of the loan.`,
              },
              {
                q: `Can I afford a house on ${grossK} with existing debt?`,
                a: `Existing debts reduce your maximum home price directly. The 36% back-end DTI limit means all monthly debts — car payment, student loans, credit cards, and your new mortgage — cannot exceed ${formatCurrency(dti.maxTotalDebt)}/month combined. Each $500/month in existing debts reduces your maximum home price by roughly $70,000-$90,000 at current rates. Use the calculator above to model your exact situation.`,
              },
            ].map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Other income levels</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INCOME_TIERS.map((tier) => {
              const tierHero = calculateAffordability({
                grossAnnualIncome: tier,
                monthlyDebts: 0,
                downPayment: Math.round(tier * 0.10),
                interestRate: 7.0,
                loanTermYears: 30,
                stateCode: "TX",
              });
              const isActive = tier === income;
              return (
                <a
                  key={tier}
                  href={`/salary/${tier}`}
                  className="rounded-lg p-3 transition-colors"
                  style={{
                    background: isActive ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
                    border: isActive ? "1px solid rgba(212,175,55,0.4)" : "1px solid var(--border-subtle)",
                    textDecoration: "none",
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: isActive ? "var(--amber-400)" : "var(--text-secondary)" }}>
                    {formatCurrency(tier)} salary
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    up to {formatCurrency(tierHero.maxHomePrice)}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>
              Based on 28/36 DTI rule.{" "}
              <a href="/methodology" style={{ color: "var(--amber-500)", textDecoration: "none" }}>
                Methodology &rarr;
              </a>
            </p>
            <p>
              More tools at{" "}
              <a href="https://calcmoney.io" target="_blank" rel="noopener noreferrer" style={{ color: "var(--amber-500)", textDecoration: "none" }}>
                calcmoney.io
              </a>
            </p>
          </div>
          <p className="mt-3 text-xs">
            Estimates only. Actual affordability depends on credit score, lender requirements, local taxes, and HOA fees.
            &copy; {new Date().getFullYear()} homebuycheck.com
            {" · "}
            <a href="/privacy" style={{ color: "var(--amber-500)", textDecoration: "none" }}>Privacy</a>
          </p>
        </div>
      </footer>
    </>
  );
}
