import type {
  BookingRequest,
  ScenarioId,
  ShopConfig,
  Staff,
  AppNotification,
  Appointment,
  Campaign,
  Customer,
  Expense,
  InventoryItem,
  Invoice,
  LeaveRequest,
  LoyaltyAccount,
  LoyaltyTransaction,
  Membership,
  Offer,
  PurchaseOrder,
  Review,
  ShiftEntry,
  SupportTicket,
  WaitlistEntry,
} from "@/lib/types";
import { Rng } from "./rng";
import { buildSoloSeed } from "./seed-solo";
import { buildSmallSeed } from "./seed-small";
import { buildCustomers } from "./seed-customers";
import { buildOperations } from "./seed-operations";
import {
  buildCampaigns,
  buildExpenses,
  buildInventory,
  buildLoyalty,
  buildMemberships,
  buildNotifications,
  buildOffers,
  buildPurchaseOrders,
  buildReviews,
  buildShiftsAndLeave,
  buildSupportTickets,
} from "./seed-business";

export interface DemoData {
  seededAt: string;
  /** Which demo world this data belongs to (Demo V1.1). */
  scenario: ScenarioId;
  businessId: string;
  branchId: string;
  /** Operating style — editable in demo settings, affects public UX. */
  config: ShopConfig;
  /** Staff added at runtime (temporary hires). Seed staff stay static. */
  extraStaff: Staff[];
  /** Runtime edits to seed staff (invites, contract changes) merged by id. */
  staffOverrides: Record<string, Partial<Staff>>;
  bookingRequests: BookingRequest[];
  customers: Customer[];
  appointments: Appointment[];
  invoices: Invoice[];
  waitlist: WaitlistEntry[];
  memberships: Membership[];
  loyaltyAccounts: LoyaltyAccount[];
  loyaltyTransactions: LoyaltyTransaction[];
  offers: Offer[];
  campaigns: Campaign[];
  reviews: Review[];
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  shifts: ShiftEntry[];
  leaveRequests: LeaveRequest[];
  notifications: AppNotification[];
  supportTickets: SupportTicket[];
}

/** Premium (Royal Cuts) defaults reproduce Demo V1 behavior exactly. */
export const PREMIUM_CONFIG: ShopConfig = {
  bookingMode: "online_instant",
  staffSelection: "customer",
  advance: "optional",
  ownerWorksAsStaff: false,
  remoteQueueJoin: false,
};

export function buildSeed(
  now = new Date(),
  scenario: ScenarioId = "premium"
): DemoData {
  if (scenario === "solo") return buildSoloSeed(now);
  if (scenario === "small") return buildSmallSeed(now);
  const rng = new Rng(42);
  const { customers, heroIds } = buildCustomers(rng, now);
  const { appointments, invoices, waitlist } = buildOperations({
    rng,
    now,
    customers,
    heroIds,
  });
  const memberships = buildMemberships(now, heroIds, customers, rng);
  const { accounts, transactions } = buildLoyalty(now, heroIds, customers, invoices, rng);
  const offers = buildOffers(now);
  const campaigns = buildCampaigns(now);
  const reviews = buildReviews(now, customers, appointments, rng);
  const inventory = buildInventory(rng);
  const purchaseOrders = buildPurchaseOrders(now, inventory);
  const expenses = buildExpenses(now, rng);
  const { shifts, leaveRequests } = buildShiftsAndLeave(now);
  const notifications = buildNotifications(now);
  const supportTickets = buildSupportTickets(now);

  return {
    seededAt: now.toISOString(),
    scenario: "premium",
    businessId: "biz_royalcuts",
    branchId: "br_kakkanad",
    config: { ...PREMIUM_CONFIG },
    extraStaff: [],
    staffOverrides: {},
    bookingRequests: [],
    customers,
    appointments,
    invoices,
    waitlist,
    memberships,
    loyaltyAccounts: accounts,
    loyaltyTransactions: transactions,
    offers,
    campaigns,
    reviews,
    inventory,
    purchaseOrders,
    expenses,
    shifts,
    leaveRequests,
    notifications,
    supportTickets,
  };
}
