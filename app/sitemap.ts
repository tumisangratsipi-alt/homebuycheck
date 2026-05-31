import type { MetadataRoute } from "next";
import { CITY_SLUGS } from "@/lib/city-data";

const INCOME_TIERS = [50000, 60000, 75000, 80000, 100000, 120000, 150000, 200000, 250000, 300000];

export default function sitemap(): MetadataRoute.Sitemap {
  const incomePages: MetadataRoute.Sitemap = INCOME_TIERS.map((income) => ({
    url: `https://homebuycheck.com/salary/${income}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `https://homebuycheck.com/city/${slug}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://homebuycheck.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://homebuycheck.com/methodology",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...incomePages,
    ...cityPages,
  ];
}
