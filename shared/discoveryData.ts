export type PartnerLocation = {
  id: string;
  name: string;
  countryCode: "US" | "GB" | "KE";
  country: string;
  city: string;
  coordinates: { lat: number; lng: number };
  organizationType: "Charitable pharmacy" | "Community clinic" | "Hospital partner";
  categories: string[];
  activePathways: number;
  availableUnits: number;
  urgencySupport: "Routine" | "Priority" | "Urgent";
};

export type MedicineAvailability = {
  id: string;
  medicine: string;
  category: string;
  partnerId: string;
  countryCode: "US" | "GB" | "KE";
  city: string;
  urgency: "Routine" | "Priority" | "Urgent";
  availableUnits: number;
  expires: string;
  pathwayStatus: "Review-ready" | "Verified pathway";
};

export const partnerLocations: PartnerLocation[] = [
  { id: "partner-us-01", name: "Northshore Community Pharmacy", countryCode: "US", country: "United States", city: "Chicago, IL", coordinates: { lat: 41.8781, lng: -87.6298 }, organizationType: "Charitable pharmacy", categories: ["Chronic care", "Antibiotics"], activePathways: 8, availableUnits: 860, urgencySupport: "Priority" },
  { id: "partner-us-02", name: "Kingswell Charitable Clinic", countryCode: "US", country: "United States", city: "Atlanta, GA", coordinates: { lat: 33.749, lng: -84.388 }, organizationType: "Community clinic", categories: ["Chronic care", "Women’s health"], activePathways: 6, availableUnits: 430, urgencySupport: "Urgent" },
  { id: "partner-gb-01", name: "Westway Health Access", countryCode: "GB", country: "United Kingdom", city: "London", coordinates: { lat: 51.5072, lng: -0.1276 }, organizationType: "Hospital partner", categories: ["Respiratory", "Chronic care"], activePathways: 4, availableUnits: 290, urgencySupport: "Routine" },
  { id: "partner-ke-01", name: "Nairobi Community Care", countryCode: "KE", country: "Kenya", city: "Nairobi", coordinates: { lat: -1.2864, lng: 36.8172 }, organizationType: "Community clinic", categories: ["Antibiotics", "Chronic care"], activePathways: 3, availableUnits: 190, urgencySupport: "Priority" },
];

export const medicineAvailability: MedicineAvailability[] = [
  { id: "med-001", medicine: "Metformin 500 mg", category: "Chronic care", partnerId: "partner-us-01", countryCode: "US", city: "Chicago, IL", urgency: "Priority", availableUnits: 240, expires: "2027-10", pathwayStatus: "Verified pathway" },
  { id: "med-002", medicine: "Amoxicillin 250 mg", category: "Antibiotics", partnerId: "partner-us-01", countryCode: "US", city: "Chicago, IL", urgency: "Urgent", availableUnits: 320, expires: "2027-08", pathwayStatus: "Review-ready" },
  { id: "med-003", medicine: "Lisinopril 10 mg", category: "Chronic care", partnerId: "partner-us-02", countryCode: "US", city: "Atlanta, GA", urgency: "Routine", availableUnits: 180, expires: "2028-02", pathwayStatus: "Verified pathway" },
  { id: "med-004", medicine: "Salbutamol inhaler", category: "Respiratory", partnerId: "partner-gb-01", countryCode: "GB", city: "London", urgency: "Priority", availableUnits: 90, expires: "2027-12", pathwayStatus: "Review-ready" },
  { id: "med-005", medicine: "Amlodipine 5 mg", category: "Chronic care", partnerId: "partner-ke-01", countryCode: "KE", city: "Nairobi", urgency: "Routine", availableUnits: 110, expires: "2027-09", pathwayStatus: "Verified pathway" },
];

export const partnerDashboardSnapshot = {
  impact: { rescuedValue: 48200, patientPathways: 326, donationsAccepted: 48, wasteAvoidedKg: 1820 },
  donations: [
    { id: "DON-221", medicine: "Metformin 500 mg", quantity: "240 packs", status: "Approved", date: "18 Aug 2026", route: "Northshore → Kingswell" },
    { id: "DON-209", medicine: "Amoxicillin 250 mg", quantity: "320 packs", status: "In review", date: "15 Aug 2026", route: "Northshore → Compliance review" },
    { id: "DON-197", medicine: "Lisinopril 10 mg", quantity: "180 packs", status: "Transferred", date: "04 Aug 2026", route: "Northshore → Community care" },
  ],
  impactTrend: [
    { month: "Mar", pathways: 34, value: 5100 }, { month: "Apr", pathways: 42, value: 6200 }, { month: "May", pathways: 49, value: 7700 }, { month: "Jun", pathways: 55, value: 8300 }, { month: "Jul", pathways: 68, value: 10500 }, { month: "Aug", pathways: 78, value: 10400 },
  ],
};

export function filterMedicineAvailability(input: { query?: string; category?: string; countryCode?: string; urgency?: string }) {
  const query = input.query?.trim().toLowerCase() ?? "";
  return medicineAvailability.filter(item => {
    const haystack = `${item.medicine} ${item.category} ${item.city}`.toLowerCase();
    return (!query || haystack.includes(query)) && (!input.category || input.category === "all" || item.category === input.category) && (!input.countryCode || input.countryCode === "all" || item.countryCode === input.countryCode) && (!input.urgency || input.urgency === "all" || item.urgency === input.urgency);
  });
}
