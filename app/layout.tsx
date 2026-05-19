import type { Metadata } from "next";
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Home Affordability Calculator",
    description: "How much house can you afford? Enter your income and debts to find out.",
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
    <html lang="en">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
