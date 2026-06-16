import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: "Methodology — Home Affordability Calculator",
  description:
    "How the home affordability calculator works: 28/36 DTI rule, property tax estimates, PMI calculation, and limitations.",
  alternates: {
    canonical: "https://homebuycheck.com/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <>
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
          <Link
            href="/"
            className="font-bold text-lg tracking-tight flex items-center gap-2"
            style={{ color: "var(--text-primary)", textDecoration: "none" }}
          >
            <img src="/logo.png" alt="HomeBuyCheck logo" style={{ height: "28px", width: "auto" }} />
            <span className="text-gradient-1">homebuy</span>check.com
          </Link>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            28/36 Rule Calculator
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8"
          style={{ color: "var(--text-muted)", textDecoration: "none" }}
        >
          &larr; Back to calculator
        </Link>

        <h1 className="text-3xl font-black mb-2">Methodology</h1>
        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          How this home affordability calculator works and what it does not cover.
        </p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              The 28/36 DTI rule
            </h2>
            <p>
              This calculator uses the 28/36 debt-to-income (DTI) rule, which is the standard
              guideline most conventional lenders apply when evaluating mortgage applications.
            </p>
            <p className="mt-3">
              The <strong style={{ color: "var(--text-secondary)" }}>front-end ratio (28%)</strong> limits
              total monthly housing costs — principal, interest, property taxes, and insurance (PITI)
              — to no more than 28% of gross monthly income.
            </p>
            <p className="mt-3">
              The <strong style={{ color: "var(--text-secondary)" }}>back-end ratio (36%)</strong> limits
              all monthly debt obligations — housing costs plus existing debts like car loans,
              student loans, and minimum credit card payments — to no more than 36% of gross
              monthly income.
            </p>
            <p className="mt-3">
              We apply both limits and use the more conservative result. If your existing debts
              are high, the back-end ratio will be the binding constraint. If your existing debts
              are low, the front-end ratio sets the ceiling.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Monthly payment formula
            </h2>
            <p>
              Monthly principal and interest is calculated using the standard amortization formula:
            </p>
            <div
              className="my-3 px-4 py-3 rounded-lg font-mono text-xs"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-default)", color: "var(--amber-400)" }}
            >
              M = P &times; [r(1+r)^n] / [(1+r)^n - 1]
            </div>
            <p>
              Where P = loan principal, r = monthly interest rate (annual rate / 12),
              and n = total number of payments (loan term in years &times; 12).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Property tax estimate
            </h2>
            <p>
              Property taxes are estimated at <strong style={{ color: "var(--text-secondary)" }}>1.1% of the home value annually</strong>,
              which is the national average effective property tax rate across all US states
              (per ATTOM Data Solutions and Tax Foundation data). This is divided by 12 to get
              the monthly estimate included in PITI.
            </p>
            <p className="mt-3">
              Actual rates vary significantly by state and county. Texas, Illinois, and New
              Jersey have effective rates above 2%. Hawaii, Alabama, and Colorado are below 0.5%.
              The state dropdown is provided for context — this version does not apply
              state-specific tax rates. For state-level accuracy, verify the effective rate
              for your target county.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              PMI calculation
            </h2>
            <p>
              Private mortgage insurance (PMI) is added when the down payment is less than 20%
              of the home price. PMI is estimated at <strong style={{ color: "var(--text-secondary)" }}>0.5% of the loan amount annually</strong>,
              divided by 12 for the monthly cost. Actual PMI rates depend on your credit
              score, loan type, and lender — typical range is 0.5% to 1.5% annually.
            </p>
            <p className="mt-3">
              PMI can be removed once your loan-to-value ratio reaches 80% (20% equity). You
              can request cancellation at that point, or it automatically terminates at 78% LTV
              under the Homeowners Protection Act.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Homeowner&apos;s insurance
            </h2>
            <p>
              Homeowner&apos;s insurance is estimated at <strong style={{ color: "var(--text-secondary)" }}>0.5% of the home value annually</strong>.
              Actual premiums vary by location, coverage level, home age, and claims history.
              Flood and earthquake insurance are separate policies not included in this estimate.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Limitations
            </h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                HOA fees are not included. These can range from $100 to $1,000+ per month
                and directly reduce affordability by increasing total monthly housing costs.
              </li>
              <li>
                Property tax rates are estimated at the national average. Actual rates vary
                substantially by state and county.
              </li>
              <li>
                This calculator assumes a fixed-rate conventional mortgage. Adjustable-rate
                mortgages, FHA, VA, and USDA loans have different requirements and costs.
              </li>
              <li>
                Credit score is not factored in. Your actual interest rate depends heavily
                on your credit score — rates for excellent credit may be 1-2% lower than
                the default input.
              </li>
              <li>
                Closing costs (typically 2-5% of the loan amount) are not included.
              </li>
              <li>
                All calculations happen entirely in your browser. No data you enter is
                stored or transmitted.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Not financial advice
            </h2>
            <p>
              This calculator provides estimates based on widely-used underwriting guidelines.
              It does not constitute financial advice, mortgage advice, or any recommendation
              to buy or not buy a home. Lenders may apply different standards. The only
              definitive affordability number comes from a formal mortgage pre-approval.
              Consult a licensed mortgage professional for personalized guidance.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="btn-primary-gold block text-center"
            style={{ textDecoration: "none" }}
          >
            Back to calculator
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="mt-16 border-t"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-2xl mx-auto px-4 py-8 text-sm" style={{ color: "var(--text-muted)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p>Based on the 28/36 DTI rule and national averages.</p>
            <p>
              Mortgage calculator at{" "}
              <a
                href="https://calcmoney.io/calculators/mortgage"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--amber-500)", textDecoration: "none" }}
              >
                CalcMoney
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
