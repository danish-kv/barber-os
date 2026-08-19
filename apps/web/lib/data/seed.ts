import type {
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

export function buildSeed(now = new Date()): DemoData {
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
