import type { MetadataRoute } from "next";
import { CITY_SLUGS } from "@/lib/city-data";
import dataSources from "@/data-sources.json";

// Pages change when their data does. data-sources.json records when each
// dataset was last verified, so the newest of those dates is an honest
// lastModified (a new Date() here told Google every page changed daily).
const CONTENT_UPDATED = new Date(
  dataSources.entries
    .map((entry) => entry.last_verified?.date)
    .filter((date): date is string => Boolean(date))
    .sort()
    .pop() ?? "2026-09-01"
);


const INCOME_TIERS = [50000, 60000, 75000, 80000, 100000, 120000, 150000, 200000, 250000, 300000];

export default function sitemap(): MetadataRoute.Sitemap {
  const incomePages: MetadataRoute.Sitemap = INCOME_TIERS.map((income) => ({
    url: `https://homebuycheck.com/salary/${income}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  const cityPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `https://homebuycheck.com/city/${slug}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "yearly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://homebuycheck.com",
      lastModified: CONTENT_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://homebuycheck.com/methodology",
      lastModified: CONTENT_UPDATED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...incomePages,
    ...cityPages,
  ];
}
