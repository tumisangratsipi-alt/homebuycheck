// ============================================================
// Top 25 US home-buying metros — 2024 data
// Sources: NAR, Zillow, Tax Foundation, Census ACS
// ============================================================

export interface CityData {
  name: string;
  state: string;
  stateCode: string;
  medianHomePrice: number;
  propertyTaxRate: number;   // annual, decimal (e.g. 0.0172 = 1.72%)
  medianHouseholdIncome: number;
}

export const CITY_DATA: Record<string, CityData> = {
  "new-york": {
    name: "New York",
    state: "New York",
    stateCode: "NY",
    medianHomePrice: 750_000,
    propertyTaxRate: 0.0172,
    medianHouseholdIncome: 78_000,
  },
  "los-angeles": {
    name: "Los Angeles",
    state: "California",
    stateCode: "CA",
    medianHomePrice: 850_000,
    propertyTaxRate: 0.0074,
    medianHouseholdIncome: 74_000,
  },
  "chicago": {
    name: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    medianHomePrice: 360_000,
    propertyTaxRate: 0.0227,
    medianHouseholdIncome: 68_000,
  },
  "houston": {
    name: "Houston",
    state: "Texas",
    stateCode: "TX",
    medianHomePrice: 310_000,
    propertyTaxRate: 0.0209,
    medianHouseholdIncome: 63_000,
  },
  "phoenix": {
    name: "Phoenix",
    state: "Arizona",
    stateCode: "AZ",
    medianHomePrice: 420_000,
    propertyTaxRate: 0.0063,
    medianHouseholdIncome: 61_000,
  },
  "philadelphia": {
    name: "Philadelphia",
    state: "Pennsylvania",
    stateCode: "PA",
    medianHomePrice: 320_000,
    propertyTaxRate: 0.0199,
    medianHouseholdIncome: 64_000,
  },
  "san-diego": {
    name: "San Diego",
    state: "California",
    stateCode: "CA",
    medianHomePrice: 820_000,
    propertyTaxRate: 0.0076,
    medianHouseholdIncome: 74_000,
  },
  "dallas": {
    name: "Dallas",
    state: "Texas",
    stateCode: "TX",
    medianHomePrice: 380_000,
    propertyTaxRate: 0.018,
    medianHouseholdIncome: 65_000,
  },
  "san-jose": {
    name: "San Jose",
    state: "California",
    stateCode: "CA",
    medianHomePrice: 1_400_000,
    propertyTaxRate: 0.0074,
    medianHouseholdIncome: 116_000,
  },
  "austin": {
    name: "Austin",
    state: "Texas",
    stateCode: "TX",
    medianHomePrice: 480_000,
    propertyTaxRate: 0.0181,
    medianHouseholdIncome: 73_000,
  },
  "charlotte": {
    name: "Charlotte",
    state: "North Carolina",
    stateCode: "NC",
    medianHomePrice: 380_000,
    propertyTaxRate: 0.0077,
    medianHouseholdIncome: 66_000,
  },
  "san-francisco": {
    name: "San Francisco",
    state: "California",
    stateCode: "CA",
    medianHomePrice: 1_300_000,
    propertyTaxRate: 0.0074,
    medianHouseholdIncome: 119_000,
  },
  "seattle": {
    name: "Seattle",
    state: "Washington",
    stateCode: "WA",
    medianHomePrice: 720_000,
    propertyTaxRate: 0.0098,
    medianHouseholdIncome: 96_000,
  },
  "denver": {
    name: "Denver",
    state: "Colorado",
    stateCode: "CO",
    medianHomePrice: 550_000,
    propertyTaxRate: 0.0049,
    medianHouseholdIncome: 77_000,
  },
  "washington-dc": {
    name: "Washington DC",
    state: "District of Columbia",
    stateCode: "DC",
    medianHomePrice: 620_000,
    propertyTaxRate: 0.0055,
    medianHouseholdIncome: 97_000,
  },
  "boston": {
    name: "Boston",
    state: "Massachusetts",
    stateCode: "MA",
    medianHomePrice: 680_000,
    propertyTaxRate: 0.0108,
    medianHouseholdIncome: 90_000,
  },
  "nashville": {
    name: "Nashville",
    state: "Tennessee",
    stateCode: "TN",
    medianHomePrice: 450_000,
    propertyTaxRate: 0.0066,
    medianHouseholdIncome: 63_000,
  },
  "portland": {
    name: "Portland",
    state: "Oregon",
    stateCode: "OR",
    medianHomePrice: 510_000,
    propertyTaxRate: 0.0091,
    medianHouseholdIncome: 73_000,
  },
  "las-vegas": {
    name: "Las Vegas",
    state: "Nevada",
    stateCode: "NV",
    medianHomePrice: 400_000,
    propertyTaxRate: 0.0056,
    medianHouseholdIncome: 59_000,
  },
  "minneapolis": {
    name: "Minneapolis",
    state: "Minnesota",
    stateCode: "MN",
    medianHomePrice: 360_000,
    propertyTaxRate: 0.011,
    medianHouseholdIncome: 77_000,
  },
  "miami": {
    name: "Miami",
    state: "Florida",
    stateCode: "FL",
    medianHomePrice: 580_000,
    propertyTaxRate: 0.0089,
    medianHouseholdIncome: 63_000,
  },
  "atlanta": {
    name: "Atlanta",
    state: "Georgia",
    stateCode: "GA",
    medianHomePrice: 390_000,
    propertyTaxRate: 0.0091,
    medianHouseholdIncome: 64_000,
  },
  "raleigh": {
    name: "Raleigh",
    state: "North Carolina",
    stateCode: "NC",
    medianHomePrice: 420_000,
    propertyTaxRate: 0.0073,
    medianHouseholdIncome: 73_000,
  },
  "sacramento": {
    name: "Sacramento",
    state: "California",
    stateCode: "CA",
    medianHomePrice: 510_000,
    propertyTaxRate: 0.0074,
    medianHouseholdIncome: 71_000,
  },
  "riverside": {
    name: "Riverside",
    state: "California",
    stateCode: "CA",
    medianHomePrice: 480_000,
    propertyTaxRate: 0.0074,
    medianHouseholdIncome: 68_000,
  },
};

export const CITY_SLUGS = Object.keys(CITY_DATA) as (keyof typeof CITY_DATA)[];

// Required annual income to afford the median home in a city.
// Formula: (medianHomePrice * 0.75 * 0.065 / 12) / 0.28 * 12
// = 75% loan (25% down) at 6.5% rate, front-end DTI 28%
// Note: uses city property tax rate for the PITI housing payment estimate.
export function calcRequiredIncome(city: CityData): number {
  const loanAmount = city.medianHomePrice * 0.75;
  const monthlyRate = 0.065 / 12;
  const months = 360;
  const monthlyPI =
    loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  const monthlyTax = (city.medianHomePrice * city.propertyTaxRate) / 12;
  const monthlyInsurance = (city.medianHomePrice * 0.005) / 12;
  const totalMonthlyHousing = monthlyPI + monthlyTax + monthlyInsurance;
  // Reverse the 28% front-end DTI: monthly = income/12 * 0.28
  const requiredMonthly = totalMonthlyHousing / 0.28;
  return Math.round(requiredMonthly * 12);
}
