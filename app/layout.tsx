import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const clashDisplay = localFont({
  src: "../assets/fonts/ClashDisplay-Semibold.ttf",
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

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
  return (
    <html lang="en" className={`${clashDisplay.variable} ${plusJakartaSans.variable}`}>
      <head>
        {/* @ts-expect-error impact.com requires non-standard value= attribute */}
        <meta name="impact-site-verification" value="ce1b51cb-8b0f-401e-8855-5e6f2a2e72a6" />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1046440660422479"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
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
