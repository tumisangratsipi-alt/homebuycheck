// dangerouslySetInnerHTML is used only for server-generated JSON-LD structured data
// (static constants, no user input). This matches the pattern in salary/[income]/page.tsx.
import type { Metadata } from "next";
import Calculator from "@/app/Calculator";
import { formatCurrency } from "@/lib/affordability-data";
import { CITY_DATA, CITY_SLUGS, calcRequiredIncome } from "@/lib/city-data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = CITY_DATA[slug];
  if (!city) return {};

  const requiredIncome = calcRequiredIncome(city);

  return {
    title: `Can I Afford a Home in ${city.name}? Affordability Calculator`,
    description: `Median home price in ${city.name} is ${formatCurrency(city.medianHomePrice)}. At 6.5% with 25% down, you need ${formatCurrency(requiredIncome)}/year to qualify. See the full breakdown.`,
    alternates: {
      canonical: `https://homebuycheck.com/city/${slug}`,
    },
    openGraph: {
      title: `${city.name} Home Affordability — Can You Afford It?`,
      description: `Median home price: ${formatCurrency(city.medianHomePrice)}. Required income at 6.5%: ${formatCurrency(requiredIncome)}/year. 28/36 DTI rule applied.`,
      url: `https://homebuycheck.com/city/${slug}`,
    },
  };
}

export default async function CityAffordabilityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = CITY_DATA[slug];
  if (!city) return <div>Not found</div>;

  const requiredIncome = calcRequiredIncome(city);
  const downPayment25 = Math.round(city.medianHomePrice * 0.25);
  const downPayment20 = Math.round(city.medianHomePrice * 0.20);

  // Monthly PITI breakdown at 25% down, 6.5%
  const loanAmount = city.medianHomePrice * 0.75;
  const monthlyRate = 0.065 / 12;
  const months = 360;
  const monthlyPI = Math.round(
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
  const monthlyTax = Math.round((city.medianHomePrice * city.propertyTaxRate) / 12);
  const monthlyInsurance = Math.round((city.medianHomePrice * 0.005) / 12);
  const monthlyTotal = monthlyPI + monthlyTax + monthlyInsurance;

  // Affordability ratio: median income vs. required income
  const affordabilityGap = requiredIncome - city.medianHouseholdIncome;
  const isAffordable = affordabilityGap <= 0;

  // Income-to-price ratio
  const incomeToPrice = (city.medianHomePrice / city.medianHouseholdIncome).toFixed(1);

  // Rate scenarios at 20% down
  const scenarios = [6.0, 6.5, 7.0, 7.5].map((rate) => {
    const loan20 = city.medianHomePrice * 0.80;
    const r = rate / 100 / 12;
    const pi = Math.round(loan20 * (r * Math.pow(1 + r, 360)) / (Math.pow(1 + r, 360) - 1));
    const tax = Math.round((city.medianHomePrice * city.propertyTaxRate) / 12);
    const ins = Math.round((city.medianHomePrice * 0.005) / 12);
    const total = pi + tax + ins;
    const reqInc = Math.round((total / 0.28) * 12);
    return { rate, monthly: total, reqIncome: reqInc };
  });

  // Nearby city cross-links
  const nearbyLinks = CITY_SLUGS.filter((s) => s !== slug).slice(0, 8);

  // JSON-LD: all content is static/server-generated, not from user input
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Home Affordability in ${city.name}, ${city.stateCode}`,
    description: `Median home price in ${city.name} is ${formatCurrency(city.medianHomePrice)}. At 6.5% with 25% down, you need ${formatCurrency(requiredIncome)}/year to qualify using the 28/36 rule.`,
    url: `https://homebuycheck.com/city/${slug}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "HomeBuyCheck", item: "https://homebuycheck.com" },
        { "@type": "ListItem", position: 2, name: `${city.name} Affordability`, item: `https://homebuycheck.com/city/${slug}` },
      ],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Can I afford a home in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Median home price in ${city.name} is ${formatCurrency(city.medianHomePrice)}. At 6.5% with 25% down (${formatCurrency(downPayment25)}), the monthly PITI is ${formatCurrency(monthlyTotal)}. To keep housing costs at or below 28% of gross income, you need ${formatCurrency(requiredIncome)}/year. The median household income in ${city.name} is ${formatCurrency(city.medianHouseholdIncome)}.`,
        },
      },
      {
        "@type": "Question",
        name: `What income do you need to buy a house in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `To afford the median ${city.name} home at ${formatCurrency(city.medianHomePrice)} with 25% down and a 6.5% rate, you need approximately ${formatCurrency(requiredIncome)}/year in gross income. This applies the 28% front-end DTI limit used by conventional lenders.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the property tax rate in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The effective property tax rate in ${city.name}, ${city.state} is ${(city.propertyTaxRate * 100).toFixed(2)}% annually. On the median home of ${formatCurrency(city.medianHomePrice)}, that is ${formatCurrency(monthlyTax)}/month or ${formatCurrency(monthlyTax * 12)}/year.`,
        },
      },
      {
        "@type": "Question",
        name: `How much is a down payment on a house in ${city.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `On the ${city.name} median home price of ${formatCurrency(city.medianHomePrice)}, a 20% down payment is ${formatCurrency(downPayment20)} and a 25% down payment is ${formatCurrency(downPayment25)}. Putting down at least 20% eliminates PMI.`,
        },
      },
    ],
  };

  // Serialize once — static data only, safe for dangerouslySetInnerHTML
  const jsonLdString = JSON.stringify(jsonLd);
  const faqJsonLdString = JSON.stringify(faqJsonLd);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLdString }} />

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
          <a href="/city" style={{ color: "var(--amber-500)", textDecoration: "none" }}>Cities</a>
          {" / "}
          <span>{city.name}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="font-black mb-3 leading-tight" style={{ fontSize: "clamp(22px, 5vw, 36px)" }}>
            Can I Afford a Home
            <br />
            <span className="text-gradient-1">in {city.name}?</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Median home price in {city.name} is{" "}
            <strong style={{ color: "var(--amber-400)" }}>{formatCurrency(city.medianHomePrice)}</strong>.
            At 6.5% with 25% down, you need{" "}
            <strong style={{ color: "var(--amber-400)" }}>{formatCurrency(requiredIncome)}/year</strong>{" "}
            to qualify under the 28% housing rule.
          </p>
        </div>

        {/* AEO summary card */}
        <div className="gradient-border-result rounded-xl p-6 mb-8">
          <p className="terminal-label mb-4">{city.name}, {city.stateCode} — 2024 snapshot</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Median home price", amount: city.medianHomePrice },
              { label: "Required income (6.5%, 25% down)", amount: requiredIncome },
              { label: "Median household income", amount: city.medianHouseholdIncome },
              { label: "Monthly PITI (25% down)", amount: monthlyTotal },
            ].map((row) => {
              const isHighlight = row.label.startsWith("Required");
              return (
                <div
                  key={row.label}
                  className="flex justify-between items-center px-4 py-3 rounded-lg"
                  style={{
                    background: isHighlight ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)",
                    border: isHighlight ? "1px solid rgba(212,175,55,0.25)" : "1px solid var(--border-subtle)",
                  }}
                >
                  <span className="terminal-label text-xs">{row.label}</span>
                  <span className="tabular-gold font-mono font-bold text-sm">{formatCurrency(row.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Affordability verdict */}
        <div
          className="mb-8 p-5 rounded-xl"
          style={{
            background: isAffordable ? "rgba(34,197,94,0.06)" : "rgba(212,175,55,0.06)",
            border: isAffordable ? "1px solid rgba(34,197,94,0.25)" : "1px solid rgba(212,175,55,0.25)",
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: isAffordable ? "#4ade80" : "var(--amber-500)" }}>
            {isAffordable ? "Attainable for median earners" : "Income gap vs. median earners"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {isAffordable
              ? `The ${city.name} median household income of ${formatCurrency(city.medianHouseholdIncome)}/year exceeds the ${formatCurrency(requiredIncome)} needed to afford the median home. Income-to-price ratio: ${incomeToPrice}x.`
              : `At a ${incomeToPrice}x income-to-price ratio, ${city.name} buyers need ${formatCurrency(affordabilityGap)}/year more than the local median household income to afford the median home.`
            }
          </p>
        </div>

        {/* Monthly payment breakdown */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Monthly payment breakdown — {city.name}</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Median home price {formatCurrency(city.medianHomePrice)}, 25% down ({formatCurrency(downPayment25)}), 6.5% rate, 30-year fixed.
          </p>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th className="text-left px-4 py-3 terminal-label">Component</th>
                  <th className="text-right px-4 py-3 terminal-label">Monthly</th>
                  <th className="text-right px-4 py-3 terminal-label">Annual</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Principal & interest", monthly: monthlyPI },
                  { label: `Property tax (${(city.propertyTaxRate * 100).toFixed(2)}% rate)`, monthly: monthlyTax },
                  { label: "Homeowner insurance (est.)", monthly: monthlyInsurance },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>{row.label}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                      {formatCurrency(row.monthly)}/mo
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatCurrency(row.monthly * 12)}/yr
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "rgba(212,175,55,0.06)" }}>
                  <td className="px-4 py-3 text-xs font-bold" style={{ color: "var(--amber-400)" }}>Total PITI</td>
                  <td className="px-4 py-3 text-right tabular-gold font-mono font-bold text-sm">
                    {formatCurrency(monthlyTotal)}/mo
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: "var(--amber-400)" }}>
                    {formatCurrency(monthlyTotal * 12)}/yr
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Rate scenarios */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Required income by mortgage rate</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            Median {city.name} home at {formatCurrency(city.medianHomePrice)}, 20% down ({formatCurrency(downPayment20)}), 30-year fixed.
          </p>
          <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--border-subtle)" }}>
                  <th className="text-left px-4 py-3 terminal-label">Rate</th>
                  <th className="text-right px-4 py-3 terminal-label">Monthly PITI</th>
                  <th className="text-right px-4 py-3 terminal-label">Required income</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((row, i) => {
                  const isSelected = row.rate === 6.5;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: i < scenarios.length - 1 ? "1px solid var(--border-subtle)" : "none",
                        background: isSelected ? "rgba(212,175,55,0.06)" : "transparent",
                      }}
                    >
                      <td className="px-4 py-3 text-xs" style={{ color: isSelected ? "var(--amber-400)" : "var(--text-secondary)" }}>
                        {row.rate}%{isSelected ? " (current est.)" : ""}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                        {formatCurrency(row.monthly)}/mo
                      </td>
                      <td className="px-4 py-3 text-right tabular-gold font-mono font-bold text-sm">
                        {formatCurrency(row.reqIncome)}/yr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Uses {city.name}&apos;s {(city.propertyTaxRate * 100).toFixed(2)}% property tax rate and 0.5% insurance estimate. No existing debts assumed.
          </p>
        </section>

        {/* Cross-link: income pages */}
        <div
          className="mb-8 p-5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)" }}
        >
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Check your specific salary
          </p>
          <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
            Use the income bracket pages to see how your salary compares to the {formatCurrency(requiredIncome)}/year needed in {city.name}.
          </p>
          <div className="flex flex-wrap gap-2">
            {[100000, 120000, 150000, 200000, 250000, 300000].map((inc) => (
              <a
                key={inc}
                href={`/salary/${inc}`}
                className="text-xs px-3 py-1.5 rounded-full"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--amber-400)",
                  textDecoration: "none",
                }}
              >
                {formatCurrency(inc)} salary
              </a>
            ))}
          </div>
        </div>

        {/* Interactive calculator */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Run your exact numbers for {city.name}</h2>
          <Calculator defaultIncome={city.medianHouseholdIncome} />
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              {
                q: `Can I afford a home in ${city.name}?`,
                a: `Median home price in ${city.name} is ${formatCurrency(city.medianHomePrice)}. At 6.5% with 25% down (${formatCurrency(downPayment25)}), the monthly PITI is ${formatCurrency(monthlyTotal)}. To keep housing costs at or below 28% of gross income, you need ${formatCurrency(requiredIncome)}/year. The median household income in ${city.name} is ${formatCurrency(city.medianHouseholdIncome)}, which means the typical household ${isAffordable ? "can qualify" : `falls ${formatCurrency(affordabilityGap)} short`}.`,
              },
              {
                q: `What income do you need to buy a house in ${city.name}?`,
                a: `To afford the median ${city.name} home at ${formatCurrency(city.medianHomePrice)} with 25% down and a 6.5% rate, you need approximately ${formatCurrency(requiredIncome)}/year. This applies the 28% front-end DTI limit used by conventional lenders. Increasing your down payment or waiting for lower rates reduces this threshold.`,
              },
              {
                q: `What is the property tax rate in ${city.name}?`,
                a: `The effective property tax rate in ${city.name}, ${city.state} is ${(city.propertyTaxRate * 100).toFixed(2)}% annually. On the median home of ${formatCurrency(city.medianHomePrice)}, that is ${formatCurrency(monthlyTax)}/month or ${formatCurrency(monthlyTax * 12)}/year in property taxes. Property taxes are included in PITI and count toward the 28% front-end DTI limit.`,
              },
              {
                q: `How much is a down payment on a house in ${city.name}?`,
                a: `On the ${city.name} median home price of ${formatCurrency(city.medianHomePrice)}, a 20% down payment is ${formatCurrency(downPayment20)} and a 25% down payment is ${formatCurrency(downPayment25)}. Putting down at least 20% eliminates PMI. For homes above $766,550, you will need a jumbo loan, which typically requires 20-30% down and stricter income documentation.`,
              },
            ].map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>{item.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Other cities */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">Affordability in other cities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {nearbyLinks.map((citySlug) => {
              const c = CITY_DATA[citySlug];
              const reqInc = calcRequiredIncome(c);
              return (
                <a
                  key={citySlug}
                  href={`/city/${citySlug}`}
                  className="rounded-lg p-3 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                    textDecoration: "none",
                  }}
                >
                  <p className="text-xs font-bold" style={{ color: "var(--text-secondary)" }}>
                    {c.name}, {c.stateCode}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    Need {formatCurrency(reqInc)}/yr
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
            <a
              href="https://calcmoney.io/calculators/mortgage"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: "999px", background: "rgba(212,175,55,0.1)", color: "var(--amber-500)", border: "1px solid rgba(212,175,55,0.25)", textDecoration: "none", fontSize: "12px", fontWeight: 600 }}
            >
              Full amortization and rate comparison at CalcMoney &rarr;
            </a>
          </div>
          <p className="mt-3 text-xs">
            Results are estimates for informational purposes only. Consult a licensed financial professional before making financial decisions.
            &copy; {new Date().getFullYear()} homebuycheck.com
            {" · "}
            <a href="/privacy" style={{ color: "var(--amber-500)", textDecoration: "none" }}>Privacy</a>
          </p>
        </div>
      </footer>
    </>
  );
}
