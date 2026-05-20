import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Affordability Calculator — How Much House Can You Afford?",
  description:
    "Find out how much home you can afford based on your income, debts, and down payment. All 50 states. Free calculator, no sign-up.",
  metadataBase: new URL("https://homebuycheck.com"),
  openGraph: {
    title: "Home Affordability Calculator",
    description:
      "Find out how much home you can afford based on your income, debts, and down payment. All 50 states.",
    url: "https://homebuycheck.com",
    siteName: "homebuycheck.com",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Home Affordability Calculator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Affordability Calculator",
    description: "How much house can you afford? Enter your income and debts to find out.",
    images: ["/og.png"],
  },
  alternates: {
    canonical: "https://homebuycheck.com",
  },
  verification: {
    google: "XcwFVNpbar0dYrDMGH-KdwRb87FbDDLXJHgJQ5WNq58",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
        {adsenseId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-PDXEK5JF9E" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">{`
          window.dataLayer=window.dataLayer||[];
          function gtag(){dataLayer.push(arguments);}
          gtag('js',new Date());
          gtag('config','G-PDXEK5JF9E',{page_path:window.location.pathname});
        `}</Script>
      </body>
    </html>
  );
}
