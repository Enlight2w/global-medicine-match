export type MedicalKnowledgeSource = {
  id: string;
  name: string;
  owner: string;
  scope: string;
  updateCadence: string;
  lastVerified: string;
  link: string;
  tier: "Regulatory" | "Clinical guidance" | "Research registry" | "Literature";
  use: string;
  limitation: string;
};

export const medicalKnowledgeSources: MedicalKnowledgeSource[] = [
  {
    id: "openfda",
    name: "openFDA drug labels and safety data",
    owner: "U.S. Food and Drug Administration",
    scope: "Public FDA drug-label, adverse-event, enforcement, and product datasets.",
    updateCadence: "API metadata reports source update timestamps; sync jobs should store the returned timestamp and checksum.",
    lastVerified: "2026-10-19",
    link: "https://open.fda.gov/apis/",
    tier: "Regulatory",
    use: "Medicine identity, labeling, safety signals, and regulatory context.",
    limitation: "FDA warns that not all openFDA data is validated for clinical or production use and says it must not be used alone to make medical-care decisions.",
  },
  {
    id: "ema",
    name: "EMA medicine data and safety communications",
    owner: "European Medicines Agency",
    scope: "Centrally authorised medicines, post-authorisation procedures, referrals, safety communications, shortages, and medicines under evaluation.",
    updateCadence: "EMA publishes downloadable tables and JSON website data; its medicine data page says tables update automatically overnight.",
    lastVerified: "2026-10-19",
    link: "https://www.ema.europa.eu/en/medicines/download-medicine-data",
    tier: "Regulatory",
    use: "EU authorisation status, safety changes, shortages, and post-authorisation activity.",
    limitation: "EU-level data does not replace national authorisation, reimbursement, prescribing, import, or dispensing rules.",
  },
  {
    id: "who-eml",
    name: "WHO Model Lists of Essential Medicines",
    owner: "World Health Organization",
    scope: "Essential medicines, children’s essential medicines, AWaRe antibiotic classification, and national essential-medicine-list resources.",
    updateCadence: "WHO Model Lists are updated every two years; the current pages identify the September 2025 24th EML and 10th EMLc.",
    lastVerified: "2026-10-19",
    link: "https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines/essential-medicines-lists",
    tier: "Clinical guidance",
    use: "Population-level medicine policy, procurement context, and essential-medicine classification.",
    limitation: "An essential-medicine listing is not a prescription, treatment plan, or proof of local approval or availability.",
  },
  {
    id: "clinicaltrials",
    name: "ClinicalTrials.gov API",
    owner: "U.S. National Library of Medicine",
    scope: "Registered studies, conditions, interventions, recruitment status, outcomes, locations, and posted results.",
    updateCadence: "ClinicalTrials.gov states that data refreshes Monday through Friday and generally completes by 09:00 ET; consumers should check the dataTimestamp version field.",
    lastVerified: "2026-10-19",
    link: "https://clinicaltrials.gov/data-api/api",
    tier: "Research registry",
    use: "Research discovery and study-status updates, not proof of treatment efficacy or clinical availability.",
    limitation: "A registered or recruiting study is not an approved medicine, recommendation, or guarantee of eligibility.",
  },
  {
    id: "pubmed",
    name: "PubMed and NCBI E-utilities",
    owner: "National Library of Medicine / NIH",
    scope: "Programmatic search and retrieval across PubMed, PMC, and other Entrez databases.",
    updateCadence: "Use scheduled searches with stored query, retrieval timestamp, PMID, publication date, and deduplication keys.",
    lastVerified: "2026-10-19",
    link: "https://www.ncbi.nlm.nih.gov/home/develop/api/",
    tier: "Literature",
    use: "Peer-reviewed literature discovery and evidence-change monitoring.",
    limitation: "Publication does not equal high-quality evidence, regulatory approval, clinical consensus, or suitability for an individual.",
  },
  {
    id: "nci",
    name: "NCI cancer treatment information",
    owner: "National Cancer Institute / NIH",
    scope: "Patient-facing cancer treatment categories, cancer drugs, side effects, questions for clinicians, and trial discovery.",
    updateCadence: "Use page revision metadata and source-page change detection; do not silently rewrite clinical summaries without review.",
    lastVerified: "2026-10-19",
    link: "https://www.cancer.gov/about-cancer/treatment",
    tier: "Clinical guidance",
    use: "An example of authoritative, patient-oriented educational treatment information.",
    limitation: "Treatment choice depends on diagnosis, stage, test results, comorbidities, preferences, and clinician assessment.",
  },
];
