import Calculator from "./Calculator";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home Affordability Calculator — How Much House Can You Afford?",
  description:
    "Find out how much home you can afford based on your income, debts, and down payment. All 50 states. Free calculator, no sign-up.",
};

const faqItems = [
  {
    q: "What is the 28/36 rule for buying a home?",
    a: "The 28/36 rule is the standard lenders use to evaluate whether you can afford a mortgage. The front-end ratio (28%) means your total monthly housing costs — principal, interest, property taxes, and insurance (PITI) — should not exceed 28% of your gross monthly income. The back-end ratio (36%) means all monthly debt payments combined, including housing and any existing debts like car loans or student loans, should not exceed 36% of gross monthly income. This calculator uses both limits and applies the more conservative of the two.",
  },
  {
    q: "How does my down payment affect what I can afford?",
    a: "A larger down payment directly increases the home price you can afford by reducing the loan amount — which lowers your monthly principal and interest payment. It also reduces or eliminates private mortgage insurance (PMI), which is required when your down payment is less than 20% of the home price. PMI typically costs 0.5% to 1% of the loan amount annually. A 20% down payment removes that cost entirely and gives you immediate equity in the home.",
  },
  {
    q: "What other costs should I budget for beyond the mortgage?",
    a: "Monthly homeownership costs go well beyond principal and interest. This calculator already estimates property taxes (1.1% annually, national average), homeowner's insurance (0.5% annually), and PMI if applicable. Beyond those, you should budget for HOA fees if the community has one (can range from $100 to $1,000+ per month), closing costs (typically 2-5% of the loan amount), maintenance (most experts recommend budgeting 1% of home value annually), and utilities. These can meaningfully affect your real affordability.",
  },
  {
    q: "Should I get pre-approved before using this calculator?",
    a: "Yes. This calculator gives you a solid estimate based on the 28/36 rule, but a mortgage pre-approval from a lender is the definitive number. Pre-approval involves a hard credit pull and a full review of your income, assets, and debts. Lenders may use different underwriting standards, offer different rates based on your credit score, and account for factors this calculator cannot — such as employment history, type of income (W-2 vs. self-employed), and the specific loan product. Use this calculator to understand your range, then get pre-approved to confirm the real number.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Home Affordability Calculator",
  url: "https://homebuycheck.com",
  description:
    "Calculate how much home you can afford based on your income, debts, and down payment using the 28/36 DTI rule.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: "rgba(9,9,11,0.95)",
          borderColor: "var(--border)",
          backdropFilter: "blur(8px)",
        }}
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
          <nav className="flex items-center gap-1 flex-wrap">
            <a href="https://calcmoney.io" target="_blank" rel="noopener" className="text-xs px-2.5 py-1 rounded-full transition-[color,border-color] duration-150 ease-out" style={{ color: "var(--color-accent)", border: "1px solid var(--color-accent-dark)", textDecoration: "none" }}>CalcMoney.io</a>
            <a href="https://netpaytool.com" target="_blank" rel="noopener" className="text-xs px-2.5 py-1 rounded-full transition-[color,border-color] duration-150 ease-out" style={{ color: "var(--color-ink-muted)", border: "1px solid var(--color-border)", textDecoration: "none" }}>Take-Home Pay</a>
            <a href="https://salaryfact.com" target="_blank" rel="noopener" className="text-xs px-2.5 py-1 rounded-full transition-[color,border-color] duration-150 ease-out" style={{ color: "var(--color-ink-muted)", border: "1px solid var(--color-border)", textDecoration: "none" }}>Salary Rank</a>
            <a href="https://networthrank.com" target="_blank" rel="noopener" className="text-xs px-2.5 py-1 rounded-full transition-[color,border-color] duration-150 ease-out" style={{ color: "var(--color-ink-muted)", border: "1px solid var(--color-border)", textDecoration: "none" }}>Net Worth Rank</a>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h1
            className="font-black mb-3 leading-tight"
            style={{ fontSize: "clamp(28px, 6vw, 42px)" }}
          >
            Home Affordability
            <br />
            <span className="text-gradient-1">Calculator</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
            Enter your income and debts. See exactly how much house you can afford
            using the{" "}
            <a
              href="/methodology"
              style={{ color: "var(--amber-500)", textDecoration: "none" }}
            >
              28/36 rule
            </a>
            .
          </p>
          <div
            className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid var(--border-default)",
            }}
          >
            <span className="live-dot" />
            <span className="terminal-label" style={{ letterSpacing: "0.08em" }}>
              Free. No sign-up. No data collected.
            </span>
          </div>
        </div>

        {/* Calculator */}
        <Calculator />

        {/* Browse by income */}
        <section className="mt-14">
          <h2 className="text-xl font-bold mb-4">Affordability by salary</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            See the exact home price range for common US salaries, pre-calculated using the 28/36 rule.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { income: 50000,  label: "$50K salary" },
              { income: 60000,  label: "$60K salary" },
              { income: 75000,  label: "$75K salary" },
              { income: 80000,  label: "$80K salary" },
              { income: 100000, label: "$100K salary" },
              { income: 120000, label: "$120K salary" },
              { income: 150000, label: "$150K salary" },
              { income: 200000, label: "$200K salary" },
              { income: 250000, label: "$250K salary" },
              { income: 300000, label: "$300K salary" },
            ].map(({ income, label }) => (
              <a
                key={income}
                href={`/salary/${income}`}
                className="aura-panel p-4 text-sm hover:opacity-80"
                style={{ textDecoration: "none", color: "var(--text-primary)" }}
              >
                {label}
              </a>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-14">
          <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <div key={i} className="aura-panel p-5">
                <h3 className="font-semibold mb-2" style={{ fontSize: 15 }}>
                  {item.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="mt-16 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>
              Based on the 28/36 DTI rule.{" "}
              <a href="/methodology" style={{ color: "var(--amber-500)", textDecoration: "none" }}>
                Methodology &rarr;
              </a>
            </p>
            <p>
              More tools at{" "}
              <a
                href="https://calcmoney.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--amber-500)", textDecoration: "none" }}
              >
                CalcMoney.io
              </a>
            </p>
          </div>
          <p className="mt-3 text-xs">
            Not financial advice. Estimates are based on national averages and standard underwriting guidelines. Actual mortgage qualification may differ. &copy; {new Date().getFullYear()} homebuycheck.com
            {" · "}
            <a href="/privacy" style={{ color: "var(--amber-500)", textDecoration: "none" }}>Privacy</a>
          </p>
        </div>
      </footer>
    </>
  );
}
