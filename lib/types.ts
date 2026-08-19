// Core domain model for Barbershop OS.
// All app state is derived from these shapes. A real backend can later
// implement the same shapes behind lib/data/repository.ts without UI changes.

export type Role =
  | "customer"
  | "barber"
  | "receptionist"
  | "manager"
  | "owner"
  | "admin";

export type Language = "en" | "ml";

export interface Address {
  line1: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface OpeningHours {
  // 0 = Sunday .. 6 = Saturday
  day: number;
  open: string; // "10:00"
  close: string; // "20:00"
  closed?: boolean;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoInitial: string;
  languages: Language[];
  plan: SubscriptionPlanId;
  createdAt: string;
  ratingAverage: number;
  ratingCount: number;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  slug: string;
  address: Address;
  phone: string;
  whatsapp: string;
  hours: OpeningHours[];
  resourceIds: string[];
  heroImageTone: "amber" | "emerald" | "clay" | "ink";
  isPrimary?: boolean;
}

export interface ResourceItem {
  id: string;
  branchId: string;
  name: string;
  type: "chair" | "room" | "station";
  status: "available" | "in-use" | "maintenance";
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

export type ServiceCategory =
  | "hair"
  | "beard"
  | "color"
  | "spa"
  | "kids"
  | "styling";

export interface Service {
  id: string;
  branchIds: string[];
  category: ServiceCategory;
  name: string;
  nameMl?: string;
  description: string;
  price: number;
  durationMin: number;
  requiresResourceType?: ResourceItem["type"];
  addonIds: string[];
  popular?: boolean;
  image?: string;
}

export interface StaffCommissionRule {
  serviceCategory: ServiceCategory | "product" | "default";
  rate: number; // 0..1
}

export type StaffRole = "senior-barber" | "barber" | "stylist" | "trainee";

export interface WorkingHours {
  day: number;
  start: string;
  end: string;
  off?: boolean;
}

export interface Staff {
  id: string;
  userId: string;
  branchId: string;
  name: string;
  role: StaffRole;
  title: string;
  phone: string;
  avatarTone: string;
  experienceYears: number;
  serviceIds: string[];
  rating: number;
  ratingCount: number;
  workingHours: WorkingHours[];
  commissionRules: StaffCommissionRule[];
  color: string; // for calendar lane accent
  bio?: string;
  joinedAt: string;
}

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: string;
  staffId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
}

export type ShiftStatus = "working" | "break" | "leave" | "off" | "overtime";

export interface ShiftEntry {
  id: string;
  staffId: string;
  date: string; // yyyy-mm-dd
  status: ShiftStatus;
  start?: string;
  end?: string;
}

export interface CustomerPreference {
  label: string;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  avatarTone: string;
  homeBranchId: string;
  preferredStaffId?: string;
  preferences: string[];
  notes: string;
  tags: Array<"vip" | "new" | "at-risk" | "loyal">;
  joinedAt: string;
  favoriteBranchIds: string[];
  favoriteServiceIds: string[];
  language: Language;
}

export type AppointmentSource = "online" | "walk-in" | "phone";

export type AppointmentStatus =
  | "waitlisted"
  | "confirmed"
  | "checked-in"
  | "waiting"
  | "in-service"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Appointment {
  id: string;
  branchId: string;
  customerId: string;
  staffId: string | null; // null = "any barber", assigned at check-in
  requestedAnyStaff: boolean;
  serviceIds: string[];
  addonIds: string[];
  resourceId?: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  status: AppointmentStatus;
  source: AppointmentSource;
  createdAt: string;
  checkedInAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  paymentPreference: "advance" | "full" | "pay-at-shop";
  advanceAmount?: number;
  advancePaid?: boolean;
  invoiceId?: string;
  note?: string;
  queueNumber?: number;
  estimatedWaitMin?: number;
  reminderSent?: boolean;
}

export interface WaitlistEntry {
  id: string;
  branchId: string;
  customerId: string;
  staffId: string | null;
  serviceIds: string[];
  desiredDate: string;
  desiredWindow: string;
  createdAt: string;
  status: "open" | "notified" | "converted" | "expired";
}

export type PaymentMethod =
  | "upi"
  | "cash"
  | "card"
  | "wallet"
  | "advance"
  | "split";

export interface InvoiceLineItem {
  id: string;
  kind: "service" | "product" | "addon";
  refId: string;
  name: string;
  price: number;
  qty: number;
  staffId?: string;
}

export interface Invoice {
  id: string;
  branchId: string;
  appointmentId?: string;
  customerId: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  membershipDiscount: number;
  loyaltyRedeemed: number;
  loyaltyPointsUsed: number;
  tip: number;
  tax: number;
  total: number;
  paymentMethods: Array<{ method: PaymentMethod; amount: number }>;
  status: "paid" | "pending" | "refunded";
  createdAt: string;
  createdBy: string;
  receiptNumber: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  perks: string[];
  includedServices: Array<{ serviceId: string; qty: number }>;
  discountPercent: number;
}

export interface Membership {
  id: string;
  planId: string;
  customerId: string;
  branchId: string;
  status: "active" | "paused" | "expired";
  startedAt: string;
  renewsAt: string;
  usage: Record<string, number>; // serviceId -> used count this cycle
}

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: "earn" | "redeem" | "expire" | "bonus";
  points: number;
  reason: string;
  createdAt: string;
}

export interface LoyaltyAccount {
  customerId: string;
  points: number;
  tier: "bronze" | "silver" | "gold";
  visitStreak: number;
}

export type OfferAudience =
  | "new"
  | "repeat"
  | "vip"
  | "inactive-30"
  | "inactive-60"
  | "birthday"
  | "membership-expiring"
  | "high-spender"
  | "all";

export interface Offer {
  id: string;
  branchId: string | "all";
  title: string;
  description: string;
  serviceId?: string;
  originalPrice?: number;
  offerPrice?: number;
  discountPercent?: number;
  validFrom: string;
  validTo: string;
  windowLabel?: string;
  audience: OfferAudience;
  active: boolean;
  redemptions: number;
  code: string;
}

export type CampaignChannel = "whatsapp" | "sms" | "push";

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  audience: OfferAudience;
  audienceCount: number;
  message: string;
  offerId?: string;
  status: "draft" | "scheduled" | "sent";
  estimatedCost: number;
  estimatedRevenue: number;
  createdAt: string;
  sentAt?: string;
}

export interface Review {
  id: string;
  branchId: string;
  customerId: string;
  staffId?: string;
  appointmentId?: string;
  ratingOverall: number;
  ratingService: number;
  ratingCleanliness: number;
  ratingWait: number;
  ratingStaff: number;
  comment: string;
  createdAt: string;
  response?: string;
  respondedAt?: string;
}

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  sellPrice?: number;
  sellable: boolean;
  vendorId: string;
  consumedPerService?: Record<string, number>; // serviceId -> qty consumed
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  itemIds: string[];
  leadTimeDays: number;
}

export type PurchaseOrderStatus = "draft" | "ordered" | "received" | "cancelled";

export interface PurchaseOrderItem {
  itemId: string;
  qty: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  branchId: string;
  vendorId: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  createdAt: string;
  expectedAt: string;
  receivedAt?: string;
  total: number;
}

export type ExpenseCategory =
  | "rent"
  | "electricity"
  | "salaries"
  | "consumables"
  | "marketing"
  | "maintenance"
  | "software"
  | "misc";

export interface Expense {
  id: string;
  branchId: string;
  category: ExpenseCategory;
  label: string;
  amount: number;
  date: string;
  recurring?: boolean;
}

export type NotificationCategory =
  | "booking"
  | "queue"
  | "inventory"
  | "staff"
  | "payment"
  | "system";

export interface AppNotification {
  id: string;
  role: Role | "all";
  branchId?: string;
  category: NotificationCategory;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

export type SubscriptionPlanId = "free" | "pro" | "business" | "multi-branch";

export interface SubscriptionPlanDef {
  id: SubscriptionPlanId;
  name: string;
  pricePerMonth: number;
  priceSuffix?: string;
  features: string[];
  highlight?: boolean;
}

export interface PlatformShop {
  id: string;
  businessId: string;
  ownerName: string;
  plan: SubscriptionPlanId;
  status: "trial" | "active" | "past-due" | "churned";
  branchCount: number;
  mrr: number;
  createdAt: string;
  city: string;
  supportOpenTickets: number;
}

export interface SupportTicket {
  id: string;
  shopId: string;
  subject: string;
  status: "open" | "pending" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastMessage: string;
}

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  phone: string;
  email?: string;
  linkedId: string; // customerId or staffId, or businessId for owner/admin
  branchId?: string; // for staff roles
}
