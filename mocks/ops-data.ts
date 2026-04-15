/**
 * Payment Ops Centre — seeded mock data.
 * All values are illustrative; no real PII or financial data.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TxnStatus =
  | "completed"
  | "processing"
  | "held"
  | "failed"
  | "reversed";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RFIStatus = "open" | "responded" | "overdue" | "closed";

export type AMLTrigger =
  | "velocity"
  | "structuring"
  | "sanctions_hit"
  | "geo_anomaly"
  | "dark_web"
  | "pep";

export type DisputeStatus =
  | "open"
  | "under_review"
  | "resolved_customer"
  | "resolved_merchant"
  | "escalated";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface OpsTransaction {
  id: string;
  ref: string;
  amount: number;
  currency: string;
  senderName: string;
  senderIban: string;
  receiverName: string;
  receiverIban: string;
  type: "domestic" | "international";
  status: TxnStatus;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  channel: "app" | "api" | "branch";
  timestamp: Date;
  country?: string; // destination country for intl
  holdReason?: string;
  flagReason?: string;
}

export interface FraudAlert {
  id: string;
  transactionRef: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  riskLevel: RiskLevel;
  triggers: string[];
  riskScore: number;
  detectedAt: Date;
  status: "open" | "investigating" | "confirmed_fraud" | "false_positive";
  assignedTo?: string;
}

export interface RFI {
  id: string;
  correspondentBank: string;
  country: string;
  transactionRef: string;
  amount: number;
  currency: string;
  queryType: "source_of_funds" | "purpose" | "beneficiary_info" | "aml_check";
  queryTypeLabel: string;
  receivedAt: Date;
  dueAt: Date;
  status: RFIStatus;
  notes?: string;
}

export interface AMLAlert {
  id: string;
  customerId: string;
  customerName: string;
  trigger: AMLTrigger;
  triggerLabel: string;
  amount: number;
  currency: string;
  riskLevel: RiskLevel;
  detectedAt: Date;
  status: "open" | "cleared" | "escalated_to_fiu" | "sar_filed";
  details: string;
}

export interface Dispute {
  id: string;
  caseRef: string;
  customerId: string;
  customerName: string;
  merchant: string;
  amount: number;
  currency: string;
  txnDate: Date;
  openedAt: Date;
  slaDueAt: Date;
  status: DisputeStatus;
  category: "unauthorized" | "duplicate" | "not_received" | "quality" | "other";
  categoryLabel: string;
  assignedAgent?: string;
}

export interface KPIMetric {
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  sub?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const now = new Date();
const minsAgo = (n: number) => new Date(now.getTime() - n * 60_000);
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3_600_000);
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000);
const hoursAhead = (n: number) => new Date(now.getTime() + n * 3_600_000);
const daysAhead = (n: number) => new Date(now.getTime() + n * 86_400_000);

// ─── KPIs ──────────────────────────────────────────────────────────────────────

export const MOCK_KPIS: KPIMetric[] = [
  {
    label: "Transactions Today",
    value: "1,247",
    delta: "+12%",
    deltaPositive: true,
    sub: "vs yesterday",
  },
  {
    label: "Volume (AED)",
    value: "8,412,330",
    delta: "+8.4%",
    deltaPositive: true,
    sub: "vs yesterday",
  },
  {
    label: "Held / Pending",
    value: "23",
    delta: "+5",
    deltaPositive: false,
    sub: "requires action",
  },
  {
    label: "Fraud Alerts",
    value: "7",
    delta: "3 critical",
    deltaPositive: false,
    sub: "open cases",
  },
  {
    label: "RFI Pending",
    value: "12",
    delta: "4 overdue",
    deltaPositive: false,
    sub: "correspondent banks",
  },
  {
    label: "STP Rate",
    value: "94.2%",
    delta: "+0.3%",
    deltaPositive: true,
    sub: "straight-through processing",
  },
];

// ─── Transaction Queue ──────────────────────────────────────────────────────────

export const MOCK_TXN_QUEUE: OpsTransaction[] = [
  {
    id: "otxn_001",
    ref: "WIO20260415001",
    amount: 3_200,
    currency: "AED",
    senderName: "Khalid Al Marzooqi",
    senderIban: "AE600331000000000000000",
    receiverName: "Ravi Sharma",
    receiverIban: "DE89370400440532013000",
    type: "international",
    status: "held",
    riskScore: 72,
    riskLevel: "high",
    channel: "app",
    timestamp: hoursAgo(3),
    country: "Germany",
    holdReason: "International compliance review",
  },
  {
    id: "otxn_002",
    ref: "WIO20260415002",
    amount: 15_000,
    currency: "AED",
    senderName: "Fiona Al Hamdan",
    senderIban: "AE460090000000987654321",
    receiverName: "Zahid Construction LLC",
    receiverIban: "AE070331999888777666555",
    type: "domestic",
    status: "processing",
    riskScore: 38,
    riskLevel: "medium",
    channel: "api",
    timestamp: minsAgo(8),
    holdReason: undefined,
  },
  {
    id: "otxn_003",
    ref: "WIO20260415003",
    amount: 500,
    currency: "AED",
    senderName: "Mohammed Al Kindi",
    senderIban: "AE290090000003456789012",
    receiverName: "Khalid Al Marzooqi",
    receiverIban: "AE600331000000000000000",
    type: "domestic",
    status: "completed",
    riskScore: 12,
    riskLevel: "low",
    channel: "app",
    timestamp: hoursAgo(5),
  },
  {
    id: "otxn_004",
    ref: "WIO20260415004",
    amount: 85_000,
    currency: "AED",
    senderName: "Nadia Al Falasi",
    senderIban: "AE070330000009876543210",
    receiverName: "Offshore Holdings Ltd",
    receiverIban: "GB82WEST12345698765432",
    type: "international",
    status: "held",
    riskScore: 91,
    riskLevel: "critical",
    channel: "app",
    timestamp: minsAgo(32),
    country: "United Kingdom",
    holdReason: "High-value international + new beneficiary",
    flagReason: "Velocity spike: 3rd large transfer this week",
  },
  {
    id: "otxn_005",
    ref: "WIO20260415005",
    amount: 249,
    currency: "AED",
    senderName: "Khalid Al Marzooqi",
    senderIban: "AE600331000000000000000",
    receiverName: "Etisalat",
    receiverIban: "AE070331000000001234567",
    type: "domestic",
    status: "completed",
    riskScore: 4,
    riskLevel: "low",
    channel: "app",
    timestamp: minsAgo(15),
  },
  {
    id: "otxn_006",
    ref: "WIO20260415006",
    amount: 1_200,
    currency: "AED",
    senderName: "Sara Al Mansouri",
    senderIban: "AE460090000002345678901",
    receiverName: "Luxury Travel Agency",
    receiverIban: "AE290090000004444444444",
    type: "domestic",
    status: "completed",
    riskScore: 21,
    riskLevel: "low",
    channel: "app",
    timestamp: hoursAgo(1),
  },
  {
    id: "otxn_007",
    ref: "WIO20260415007",
    amount: 47_500,
    currency: "AED",
    senderName: "Ahmad Qureshi",
    senderIban: "AE460090000009999999999",
    receiverName: "Gold Trading Co",
    receiverIban: "AE070330000007777777777",
    type: "domestic",
    status: "held",
    riskScore: 83,
    riskLevel: "high",
    channel: "branch",
    timestamp: minsAgo(45),
    holdReason: "Structuring pattern detected",
    flagReason: "4th cash-equivalent transaction today — possible structuring",
  },
];

// ─── Fraud Alerts ──────────────────────────────────────────────────────────────

export const MOCK_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: "fraud_001",
    transactionRef: "WIO20260415004",
    customerId: "cust_014",
    customerName: "Nadia Al Falasi",
    amount: 85_000,
    currency: "AED",
    riskLevel: "critical",
    triggers: ["velocity_spike", "new_beneficiary", "high_value_intl"],
    riskScore: 91,
    detectedAt: minsAgo(32),
    status: "open",
    assignedTo: undefined,
  },
  {
    id: "fraud_002",
    transactionRef: "WIO20260415007",
    customerId: "cust_029",
    customerName: "Ahmad Qureshi",
    amount: 47_500,
    currency: "AED",
    riskLevel: "high",
    triggers: ["structuring", "velocity"],
    riskScore: 83,
    detectedAt: minsAgo(45),
    status: "investigating",
    assignedTo: "Layla Hassan",
  },
  {
    id: "fraud_003",
    transactionRef: "WIO20260414089",
    customerId: "cust_007",
    customerName: "Mohammed Tariq",
    amount: 12_000,
    currency: "AED",
    riskLevel: "high",
    triggers: ["geo_anomaly", "device_fingerprint"],
    riskScore: 76,
    detectedAt: hoursAgo(18),
    status: "investigating",
    assignedTo: "Omar Al Shamsi",
  },
  {
    id: "fraud_004",
    transactionRef: "WIO20260414052",
    customerId: "cust_033",
    customerName: "Priya Nair",
    amount: 3_400,
    currency: "AED",
    riskLevel: "medium",
    triggers: ["card_not_present", "unusual_merchant"],
    riskScore: 58,
    detectedAt: hoursAgo(24),
    status: "false_positive",
    assignedTo: "Layla Hassan",
  },
];

// ─── RFI Engine ────────────────────────────────────────────────────────────────

export const MOCK_RFIS: RFI[] = [
  {
    id: "rfi_001",
    correspondentBank: "Deutsche Bank AG",
    country: "Germany",
    transactionRef: "WIO20260412001",
    amount: 120_000,
    currency: "EUR",
    queryType: "source_of_funds",
    queryTypeLabel: "Source of Funds",
    receivedAt: daysAgo(3),
    dueAt: hoursAhead(12),
    status: "open",
    notes: "Deutsche Bank requests documentation for source of funds for EUR 120k transfer.",
  },
  {
    id: "rfi_002",
    correspondentBank: "Barclays Bank PLC",
    country: "United Kingdom",
    transactionRef: "WIO20260410004",
    amount: 45_000,
    currency: "GBP",
    queryType: "beneficiary_info",
    queryTypeLabel: "Beneficiary Information",
    receivedAt: daysAgo(5),
    dueAt: daysAgo(1),
    status: "overdue",
    notes: "Beneficiary KYC documents requested. SLA breached.",
  },
  {
    id: "rfi_003",
    correspondentBank: "Saudi National Bank",
    country: "Saudi Arabia",
    transactionRef: "WIO20260413008",
    amount: 75_000,
    currency: "SAR",
    queryType: "purpose",
    queryTypeLabel: "Purpose of Payment",
    receivedAt: daysAgo(2),
    dueAt: daysAhead(5),
    status: "responded",
    notes: "Customer invoice and contract submitted. Awaiting SNB confirmation.",
  },
  {
    id: "rfi_004",
    correspondentBank: "JPMorgan Chase Bank",
    country: "United States",
    transactionRef: "WIO20260411012",
    amount: 250_000,
    currency: "USD",
    queryType: "aml_check",
    queryTypeLabel: "AML Compliance Check",
    receivedAt: daysAgo(4),
    dueAt: daysAgo(1),
    status: "overdue",
    notes: "High-value transfer flagged by JPMC AML. Customer CTR required.",
  },
  {
    id: "rfi_005",
    correspondentBank: "HSBC Holdings",
    country: "United Kingdom",
    transactionRef: "WIO20260415009",
    amount: 18_500,
    currency: "GBP",
    queryType: "source_of_funds",
    queryTypeLabel: "Source of Funds",
    receivedAt: minsAgo(120),
    dueAt: daysAhead(7),
    status: "open",
  },
];

// ─── AML Monitoring ────────────────────────────────────────────────────────────

export const MOCK_AML_ALERTS: AMLAlert[] = [
  {
    id: "aml_001",
    customerId: "cust_014",
    customerName: "Nadia Al Falasi",
    trigger: "velocity",
    triggerLabel: "Velocity Spike",
    amount: 225_000,
    currency: "AED",
    riskLevel: "critical",
    detectedAt: minsAgo(35),
    status: "escalated_to_fiu",
    details: "3 international transfers totalling AED 225k in 7 days — well above 90-day baseline of AED 18k.",
  },
  {
    id: "aml_002",
    customerId: "cust_029",
    customerName: "Ahmad Qureshi",
    trigger: "structuring",
    triggerLabel: "Structuring",
    amount: 47_500,
    currency: "AED",
    riskLevel: "high",
    detectedAt: minsAgo(45),
    status: "open",
    details: "Series of 9 transactions between AED 4,900–5,000 over 10 days. Classic structuring pattern.",
  },
  {
    id: "aml_003",
    customerId: "cust_041",
    customerName: "Tariq Al Mualla",
    trigger: "pep",
    triggerLabel: "PEP Match",
    amount: 500_000,
    currency: "AED",
    riskLevel: "high",
    detectedAt: hoursAgo(6),
    status: "open",
    details: "Customer flagged as Politically Exposed Person. AED 500k deposit received from unknown entity requires enhanced due diligence.",
  },
  {
    id: "aml_004",
    customerId: "cust_018",
    customerName: "Elena Petrov",
    trigger: "sanctions_hit",
    triggerLabel: "Sanctions Hit",
    amount: 32_000,
    currency: "USD",
    riskLevel: "critical",
    detectedAt: hoursAgo(2),
    status: "open",
    details: "Partial name match against OFAC SDN list. Transaction to be frozen pending compliance review.",
  },
  {
    id: "aml_005",
    customerId: "cust_009",
    customerName: "Rania El Sayed",
    trigger: "geo_anomaly",
    triggerLabel: "Geographic Anomaly",
    amount: 8_000,
    currency: "AED",
    riskLevel: "medium",
    detectedAt: hoursAgo(11),
    status: "cleared",
    details: "Transfer originated from IP in sanctioned jurisdiction. Customer confirmed travel via branch. Cleared.",
  },
];

// ─── Disputes ──────────────────────────────────────────────────────────────────

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "disp_001",
    caseRef: "DSP-2026-00441",
    customerId: "cust_007",
    customerName: "Mohammed Tariq",
    merchant: "Amazon.ae",
    amount: 1_299,
    currency: "AED",
    txnDate: daysAgo(8),
    openedAt: daysAgo(6),
    slaDueAt: daysAhead(4),
    status: "under_review",
    category: "not_received",
    categoryLabel: "Item Not Received",
    assignedAgent: "Omar Al Shamsi",
  },
  {
    id: "disp_002",
    caseRef: "DSP-2026-00437",
    customerId: "cust_022",
    customerName: "Hind Al Zaabi",
    merchant: "Noon.com",
    amount: 340,
    currency: "AED",
    txnDate: daysAgo(12),
    openedAt: daysAgo(10),
    slaDueAt: daysAgo(1),
    status: "escalated",
    category: "duplicate",
    categoryLabel: "Duplicate Charge",
    assignedAgent: "Layla Hassan",
  },
  {
    id: "disp_003",
    caseRef: "DSP-2026-00429",
    customerId: "cust_033",
    customerName: "Priya Nair",
    merchant: "Unknown Merchant — Dubai",
    amount: 850,
    currency: "AED",
    txnDate: daysAgo(15),
    openedAt: daysAgo(13),
    slaDueAt: daysAhead(2),
    status: "under_review",
    category: "unauthorized",
    categoryLabel: "Unauthorised Transaction",
    assignedAgent: "Omar Al Shamsi",
  },
  {
    id: "disp_004",
    caseRef: "DSP-2026-00418",
    customerId: "cust_011",
    customerName: "James O'Brien",
    merchant: "Emirates Airlines",
    amount: 4_200,
    currency: "AED",
    txnDate: daysAgo(22),
    openedAt: daysAgo(20),
    slaDueAt: daysAgo(5),
    status: "resolved_customer",
    category: "not_received",
    categoryLabel: "Service Not Received",
  },
];
