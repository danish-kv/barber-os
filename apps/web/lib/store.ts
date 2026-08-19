"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { addMinutes } from "date-fns";
import type {
  AppNotification,
  Appointment,
  BookingRequest,
  ScenarioId,
  ShopConfig,
  Staff,
  Campaign,
  Customer,
  InvoiceLineItem,
  Invoice,
  Language,
  LeaveRequest,
  Offer,
  PaymentMethod,
  PurchaseOrder,
  Role,
  WaitlistEntry,
} from "@/lib/types";
import { buildSeed, type DemoData } from "@/lib/data/seed";
import {
  ALL_SERVICES,
  ADDONS,
  STAFF,
  MEMBERSHIP_PLANS,
} from "@/lib/data/seed-static";
import {
  computeCheckoutTotals,
  totalDurationMin,
  totalPrice,
} from "@barbershop-os/domain";

const SEED_VERSION = 7;
const SEED_MAX_AGE_MS = 1000 * 60 * 60 * 18; // reseed after 18h so demo stays "today"

export interface DemoSession {
  role: Role | null;
  activeBranchId: string; // for staff-scoped roles; owner can use "all"
  ownerBranchFilter: string; // "all" or branchId
  language: Language;
  /** Selected demo business archetype (Demo V1.1). */
  scenario: ScenarioId;
}

export interface DemoState {
  data: DemoData;
  session: DemoSession;
  seedVersion: number;
  hydrated: boolean;

  // ---- session ----
  enterRole: (role: Role) => void;
  exitDemo: () => void;
  setOwnerBranchFilter: (branchId: string) => void;
  setActiveBranch: (branchId: string) => void;
  setLanguage: (lang: Language) => void;
  resetDemo: () => void;
  markHydrated: () => void;

  // ---- Demo V1.1: scenarios, operating modes, flexible staff ----
  setScenario: (scenario: ScenarioId) => void;
  updateConfig: (patch: Partial<ShopConfig>) => void;
  addStaff: (staff: Staff) => void;
  reactivateStaff: (staffId: string, activeUntil: string) => void;
  inviteStaffToApp: (staffId: string) => void;
  requestBooking: (args: {
    branchId: string;
    customerId?: string;
    customerName: string;
    customerPhone?: string;
    serviceIds: string[];
    preferredStart: string;
  }) => BookingRequest;
  acceptBookingRequest: (requestId: string, start?: string) => void;
  suggestBookingTime: (requestId: string, suggestedStart: string) => void;
  declineBookingRequest: (requestId: string) => void;
  acceptSuggestedTime: (requestId: string) => void;

  // ---- booking (Flow A) ----
  createBooking: (args: {
    branchId: string;
    customerId: string;
    staffId: string | null;
    serviceIds: string[];
    addonIds: string[];
    start: string;
    paymentPreference: Appointment["paymentPreference"];
    source?: Appointment["source"];
    note?: string;
  }) => Appointment;
  cancelAppointment: (appointmentId: string, reason?: string) => void;
  rescheduleAppointment: (appointmentId: string, newStart: string) => void;

  // ---- reception (Flows B, F) ----
  checkIn: (appointmentId: string) => void;
  addWalkIn: (args: {
    branchId: string;
    customerId?: string;
    walkInName?: string;
    walkInPhone?: string;
    staffId: string | null;
    serviceIds: string[];
  }) => Appointment;
  assignStaff: (appointmentId: string, staffId: string) => void;

  // ---- barber (Flow C) ----
  startService: (appointmentId: string) => void;
  completeService: (appointmentId: string) => void;
  markNoShow: (appointmentId: string) => void;
  toggleBreak: (staffId: string) => void;
  addCustomerNote: (customerId: string, note: string) => void;

  // ---- checkout (Flow D) ----
  checkout: (args: {
    appointmentId?: string;
    customerId: string;
    branchId: string;
    lineItems: InvoiceLineItem[];
    discount: number;
    loyaltyPointsUsed: number;
    tip: number;
    paymentMethods: Array<{ method: PaymentMethod; amount: number }>;
  }) => Invoice;

  // ---- leave (Flow G) ----
  requestLeave: (args: {
    staffId: string;
    branchId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) => void;
  decideLeave: (leaveId: string, decision: "approved" | "rejected") => void;

  // ---- inventory (Flow H) ----
  createPurchaseOrder: (args: {
    branchId: string;
    vendorId: string;
    items: Array<{ itemId: string; qty: number; unitCost: number }>;
  }) => PurchaseOrder;
  receivePurchaseOrder: (poId: string) => void;
  adjustStock: (itemId: string, delta: number) => void;

  // ---- waitlist ----
  joinWaitlist: (args: {
    branchId: string;
    customerId: string;
    staffId: string | null;
    serviceIds: string[];
    desiredDate: string;
    desiredWindow: string;
  }) => void;
  resolveWaitlist: (entryId: string, status: WaitlistEntry["status"]) => void;

  // ---- reviews / marketing ----
  respondToReview: (reviewId: string, response: string) => void;
  createOffer: (offer: Omit<Offer, "id" | "redemptions">) => void;
  toggleOffer: (offerId: string) => void;
  createCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "status">) => void;
  sendCampaign: (campaignId: string) => void;

  // ---- notifications ----
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (role: Role) => void;
  pushNotification: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;

  // ---- misc ----
  toggleFavoriteBranch: (customerId: string, branchId: string) => void;
  upsertCustomer: (customer: Customer) => void;
  closeRegister: (branchId: string, actualCash: number) => void;
}

let idCounter = 0;
function uid(prefix: string) {
  idCounter += 1;
  return `${prefix}_live_${Date.now().toString(36)}_${idCounter}`;
}

const serviceMap = new Map(ALL_SERVICES.map((s) => [s.id, s]));
const addonMap = new Map(ADDONS.map((a) => [a.id, a]));

// Selection totals delegate to the shared domain package, bound to the demo
// catalog. (Demo money is rupee numbers; production uses paise — see
// @barbershop-os/domain money notes.)
export function durationForSelection(serviceIds: string[], addonIds: string[]) {
  return totalDurationMin(serviceIds, addonIds, serviceMap, addonMap);
}

export function priceForSelection(serviceIds: string[], addonIds: string[]) {
  return totalPrice(serviceIds, addonIds, serviceMap, addonMap);
}

const initialSession: DemoSession = {
  role: null,
  activeBranchId: "br_kakkanad",
  ownerBranchFilter: "all",
  language: "en",
  scenario: "premium",
};

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      data: buildSeed(),
      session: initialSession,
      seedVersion: SEED_VERSION,
      hydrated: false,

      markHydrated: () => {
        const st = get();
        const stale =
          st.seedVersion !== SEED_VERSION ||
          Date.now() - new Date(st.data.seededAt).getTime() > SEED_MAX_AGE_MS;
        if (stale) {
          set({
            data: buildSeed(new Date(), st.session.scenario),
            seedVersion: SEED_VERSION,
            hydrated: true,
          });
        } else {
          set({ hydrated: true });
        }
      },

      enterRole: (role) =>
        set((st) => ({ session: { ...st.session, role } })),
      exitDemo: () => set((st) => ({ session: { ...st.session, role: null } })),
      setOwnerBranchFilter: (branchId) =>
        set((st) => ({ session: { ...st.session, ownerBranchFilter: branchId } })),
      setActiveBranch: (branchId) =>
        set((st) => ({ session: { ...st.session, activeBranchId: branchId } })),
      setLanguage: (lang) =>
        set((st) => ({ session: { ...st.session, language: lang } })),
      resetDemo: () =>
        set((st) => ({
          data: buildSeed(new Date(), st.session.scenario),
          session: { ...initialSession, scenario: st.session.scenario },
          seedVersion: SEED_VERSION,
        })),

      setScenario: (scenario) =>
        set((st) => {
          if (st.session.scenario === scenario && st.data.scenario === scenario) {
            return st; // keep in-progress demo state when re-selecting
          }
          const data = buildSeed(new Date(), scenario);
          return {
            data,
            session: {
              ...initialSession,
              scenario,
              activeBranchId: data.branchId,
            },
          };
        }),

      updateConfig: (patch) =>
        set((st) => ({
          data: { ...st.data, config: { ...st.data.config, ...patch } },
        })),

      addStaff: (staff) =>
        set((st) => ({
          data: { ...st.data, extraStaff: [...st.data.extraStaff, staff] },
        })),

      reactivateStaff: (staffId, activeUntil) =>
        set((st) => ({
          data: {
            ...st.data,
            staffOverrides: {
              ...st.data.staffOverrides,
              [staffId]: {
                ...st.data.staffOverrides[staffId],
                activeFrom: new Date().toISOString().slice(0, 10),
                activeUntil,
              },
            },
          },
        })),

      inviteStaffToApp: (staffId) =>
        set((st) => ({
          data: {
            ...st.data,
            staffOverrides: {
              ...st.data.staffOverrides,
              [staffId]: {
                ...st.data.staffOverrides[staffId],
                inviteStatus: "pending" as const,
              },
            },
          },
        })),

      requestBooking: (args) => {
        const request: BookingRequest = {
          id: uid("req"),
          businessId: get().data.businessId,
          branchId: args.branchId,
          customerId: args.customerId,
          customerName: args.customerName,
          customerPhone: args.customerPhone,
          serviceIds: args.serviceIds,
          preferredStart: args.preferredStart,
          status: "requested",
          createdAt: new Date().toISOString(),
        };
        set((st) => ({
          data: {
            ...st.data,
            bookingRequests: [request, ...st.data.bookingRequests],
          },
        }));
        return request;
      },

      acceptBookingRequest: (requestId, start) => {
        const st = get();
        const req = st.data.bookingRequests.find((r) => r.id === requestId);
        if (!req || req.status === "confirmed") return;
        let customerId = req.customerId;
        if (!customerId) {
          const cust: Customer = {
            id: uid("cu"),
            userId: uid("user"),
            name: req.customerName,
            phone: req.customerPhone ?? "",
            avatarTone: "slate",
            homeBranchId: req.branchId,
            preferences: [],
            notes: "",
            tags: ["new"],
            joinedAt: new Date().toISOString(),
            favoriteBranchIds: [req.branchId],
            favoriteServiceIds: req.serviceIds.slice(0, 1),
            language: "en",
          };
          set((s2) => ({
            data: { ...s2.data, customers: [...s2.data.customers, cust] },
          }));
          customerId = cust.id;
        }
        const appt = get().createBooking({
          branchId: req.branchId,
          customerId,
          staffId: null,
          serviceIds: req.serviceIds,
          addonIds: [],
          start: start ?? req.suggestedStart ?? req.preferredStart,
          paymentPreference: "pay-at-shop",
          source: "phone",
        });
        set((s2) => ({
          data: {
            ...s2.data,
            bookingRequests: s2.data.bookingRequests.map((r) =>
              r.id === requestId
                ? {
                    ...r,
                    status: "confirmed" as const,
                    decidedAt: new Date().toISOString(),
                    appointmentId: appt.id,
                  }
                : r
            ),
          },
        }));
      },

      suggestBookingTime: (requestId, suggestedStart) =>
        set((st) => ({
          data: {
            ...st.data,
            bookingRequests: st.data.bookingRequests.map((r) =>
              r.id === requestId
                ? { ...r, status: "suggested" as const, suggestedStart }
                : r
            ),
          },
        })),

      declineBookingRequest: (requestId) =>
        set((st) => ({
          data: {
            ...st.data,
            bookingRequests: st.data.bookingRequests.map((r) =>
              r.id === requestId
                ? { ...r, status: "declined" as const, decidedAt: new Date().toISOString() }
                : r
            ),
          },
        })),

      acceptSuggestedTime: (requestId) => {
        const req = get().data.bookingRequests.find((r) => r.id === requestId);
        if (!req?.suggestedStart) return;
        get().acceptBookingRequest(requestId, req.suggestedStart);
      },

      createBooking: (args) => {
        const dur = durationForSelection(args.serviceIds, args.addonIds);
        const start = new Date(args.start);
        const appt: Appointment = {
          id: uid("ap"),
          branchId: args.branchId,
          customerId: args.customerId,
          staffId: args.staffId,
          requestedAnyStaff: args.staffId === null,
          serviceIds: args.serviceIds,
          addonIds: args.addonIds,
          start: start.toISOString(),
          end: addMinutes(start, dur).toISOString(),
          status: "confirmed",
          source: args.source ?? "online",
          createdAt: new Date().toISOString(),
          paymentPreference: args.paymentPreference,
          advanceAmount: args.paymentPreference === "advance" ? 100 : undefined,
          advancePaid: args.paymentPreference !== "pay-at-shop",
          note: args.note,
        };
        set((st) => ({
          data: { ...st.data, appointments: [...st.data.appointments, appt] },
        }));
        get().pushNotification({
          role: "receptionist",
          branchId: args.branchId,
          category: "booking",
          title: "New online booking",
          body: `${labelForServices(args.serviceIds)} · ${start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`,
          actionLabel: "Open Calendar",
          actionHref: "/reception/calendar",
        });
        if (args.staffId) {
          get().pushNotification({
            role: "barber",
            branchId: args.branchId,
            category: "booking",
            title: "New booking assigned to you",
            body: `${labelForServices(args.serviceIds)} · ${start.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`,
            actionLabel: "View Schedule",
            actionHref: "/staff/schedule",
          });
        }
        return appt;
      },

      cancelAppointment: (appointmentId, reason) => {
        set((st) => ({
          data: {
            ...st.data,
            appointments: st.data.appointments.map((a) =>
              a.id === appointmentId
                ? {
                    ...a,
                    status: "cancelled",
                    cancelledAt: new Date().toISOString(),
                    cancelReason: reason ?? "Cancelled by customer",
                  }
                : a
            ),
          },
        }));
        // Waitlist simulation: opening a slot notifies waitlisted customer.
        const st = get();
        const appt = st.data.appointments.find((a) => a.id === appointmentId);
        if (!appt) return;
        const wl = st.data.waitlist.find(
          (w) => w.status === "open" && w.branchId === appt.branchId
        );
        if (wl) {
          set((s2) => ({
            data: {
              ...s2.data,
              waitlist: s2.data.waitlist.map((w) =>
                w.id === wl.id ? { ...w, status: "notified" } : w
              ),
            },
          }));
          get().pushNotification({
            role: "customer",
            category: "queue",
            title: "A waitlisted slot just opened",
            body: "A cancellation freed up a slot you wanted. Book it before it's gone!",
            actionLabel: "Book Now",
            actionHref: "/customer",
          });
        }
      },

      rescheduleAppointment: (appointmentId, newStart) => {
        set((st) => ({
          data: {
            ...st.data,
            appointments: st.data.appointments.map((a) => {
              if (a.id !== appointmentId) return a;
              const dur = durationForSelection(a.serviceIds, a.addonIds);
              const start = new Date(newStart);
              return {
                ...a,
                start: start.toISOString(),
                end: addMinutes(start, dur).toISOString(),
                status: "confirmed",
              };
            }),
          },
        }));
      },

      checkIn: (appointmentId) => {
        set((st) => {
          const queueLen = st.data.appointments.filter(
            (a) => a.status === "waiting"
          ).length;
          return {
            data: {
              ...st.data,
              appointments: st.data.appointments.map((a) =>
                a.id === appointmentId
                  ? {
                      ...a,
                      status: "waiting",
                      checkedInAt: new Date().toISOString(),
                      queueNumber: queueLen + 1,
                    }
                  : a
              ),
            },
          };
        });
        const appt = get().data.appointments.find((a) => a.id === appointmentId);
        if (appt?.staffId) {
          get().pushNotification({
            role: "barber",
            branchId: appt.branchId,
            category: "queue",
            title: "Customer checked in",
            body: "Your next customer has arrived and joined the queue.",
            actionLabel: "View Queue",
            actionHref: "/staff/queue",
          });
        }
      },

      addWalkIn: (args) => {
        let customerId = args.customerId;
        if (!customerId) {
          const c: Customer = {
            id: uid("cu"),
            userId: uid("user"),
            name: args.walkInName || "Walk-in Guest",
            phone: args.walkInPhone || "",
            avatarTone: "slate",
            homeBranchId: args.branchId,
            preferences: [],
            notes: "",
            tags: ["new"],
            joinedAt: new Date().toISOString(),
            favoriteBranchIds: [],
            favoriteServiceIds: [],
            language: "en",
          };
          set((st) => ({
            data: { ...st.data, customers: [...st.data.customers, c] },
          }));
          customerId = c.id;
        }
        const now = new Date();
        const dur = durationForSelection(args.serviceIds, []);
        const queueLen = get().data.appointments.filter(
          (a) => a.status === "waiting" && a.branchId === args.branchId
        ).length;
        const appt: Appointment = {
          id: uid("ap"),
          branchId: args.branchId,
          customerId,
          staffId: args.staffId,
          requestedAnyStaff: args.staffId === null,
          serviceIds: args.serviceIds,
          addonIds: [],
          start: now.toISOString(),
          end: addMinutes(now, dur).toISOString(),
          status: "waiting",
          source: "walk-in",
          createdAt: now.toISOString(),
          checkedInAt: now.toISOString(),
          paymentPreference: "pay-at-shop",
          queueNumber: queueLen + 1,
          estimatedWaitMin: (queueLen + 1) * 12,
        };
        set((st) => ({
          data: { ...st.data, appointments: [...st.data.appointments, appt] },
        }));
        return appt;
      },

      assignStaff: (appointmentId, staffId) => {
        set((st) => ({
          data: {
            ...st.data,
            appointments: st.data.appointments.map((a) =>
              a.id === appointmentId
                ? { ...a, staffId, requestedAnyStaff: false }
                : a
            ),
          },
        }));
      },

      startService: (appointmentId) => {
        set((st) => ({
          data: {
            ...st.data,
            appointments: st.data.appointments.map((a) =>
              a.id === appointmentId
                ? {
                    ...a,
                    status: "in-service",
                    serviceStartedAt: new Date().toISOString(),
                  }
                : a
            ),
          },
        }));
      },

      completeService: (appointmentId) => {
        const st = get();
        const appt = st.data.appointments.find((a) => a.id === appointmentId);
        if (!appt) return;
        // Consume inventory tied to services performed.
        const consumption = new Map<string, number>();
        for (const sid of appt.serviceIds) {
          for (const item of st.data.inventory) {
            if (item.branchId !== appt.branchId) continue;
            const per = item.consumedPerService?.[sid];
            if (per) consumption.set(item.id, (consumption.get(item.id) ?? 0) + per);
          }
        }
        set((s2) => ({
          data: {
            ...s2.data,
            appointments: s2.data.appointments.map((a) =>
              a.id === appointmentId
                ? { ...a, status: "completed", completedAt: new Date().toISOString() }
                : a
            ),
            inventory: s2.data.inventory.map((item) => {
              const used = consumption.get(item.id);
              if (!used) return item;
              return { ...item, quantity: Math.max(0, Math.round((item.quantity - used) * 100) / 100) };
            }),
          },
        }));
        get().pushNotification({
          role: "receptionist",
          branchId: appt.branchId,
          category: "payment",
          title: "Service completed — ready for checkout",
          body: `${labelForServices(appt.serviceIds)} finished. Collect payment at POS.`,
          actionLabel: "Open POS",
          actionHref: `/reception/pos?appointment=${appt.id}`,
        });
      },

      markNoShow: (appointmentId) => {
        set((st) => ({
          data: {
            ...st.data,
            appointments: st.data.appointments.map((a) =>
              a.id === appointmentId ? { ...a, status: "no-show" } : a
            ),
          },
        }));
      },

      toggleBreak: (staffId) => {
        const todayKey = new Date().toISOString().slice(0, 10);
        set((st) => {
          const existing = st.data.shifts.find(
            (s) => s.staffId === staffId && s.date === todayKey
          );
          if (!existing) return st;
          const next = existing.status === "break" ? "working" : "break";
          return {
            data: {
              ...st.data,
              shifts: st.data.shifts.map((s) =>
                s.id === existing.id ? { ...s, status: next } : s
              ),
            },
          };
        });
      },

      addCustomerNote: (customerId, note) => {
        set((st) => ({
          data: {
            ...st.data,
            customers: st.data.customers.map((c) =>
              c.id === customerId
                ? { ...c, notes: c.notes ? `${c.notes}\n${note}` : note }
                : c
            ),
          },
        }));
      },

      checkout: (args) => {
        const st = get();
        const appt = args.appointmentId
          ? st.data.appointments.find((a) => a.id === args.appointmentId)
          : undefined;
        const membership = st.data.memberships.find(
          (m) => m.customerId === args.customerId && m.status === "active"
        );
        const plan = membership
          ? MEMBERSHIP_PLANS.find((p) => p.id === membership.planId)
          : undefined;

        // Checkout math lives in @barbershop-os/domain — the exact demo
        // arithmetic (pinned by the storyline test), now shared with the POS
        // preview and, later, the authoritative API.
        const advanceAlreadyPaid = appt?.advancePaid ? appt.advanceAmount ?? 0 : 0;
        const totals = computeCheckoutTotals({
          lines: args.lineItems,
          membership:
            membership && plan
              ? {
                  includedServices: plan.includedServices,
                  discountPercent: plan.discountPercent,
                  usage: membership.usage,
                }
              : null,
          discount: args.discount,
          loyaltyPointsUsed: args.loyaltyPointsUsed,
          tip: args.tip,
          advancePaid: advanceAlreadyPaid,
        });
        const {
          subtotal,
          membershipDiscount,
          membershipUsageDelta: usageDelta,
          loyaltyRedeemed,
        } = totals;

        const receiptNumber = `RC-${Math.floor(2000 + Math.random() * 8000)}`;
        const invoice: Invoice = {
          id: uid("inv"),
          branchId: args.branchId,
          appointmentId: args.appointmentId,
          customerId: args.customerId,
          lineItems: args.lineItems,
          subtotal,
          discount: args.discount,
          membershipDiscount,
          loyaltyRedeemed,
          loyaltyPointsUsed: args.loyaltyPointsUsed,
          tip: args.tip,
          tax: 0,
          total: totals.totalDue,
          paymentMethods:
            advanceAlreadyPaid > 0
              ? [
                  { method: "advance", amount: advanceAlreadyPaid },
                  ...args.paymentMethods,
                ]
              : args.paymentMethods,
          status: "paid",
          createdAt: new Date().toISOString(),
          createdBy: "reception",
          receiptNumber,
        };

        const pointsEarned = totals.pointsEarned;

        set((s2) => {
          const existingAccount = s2.data.loyaltyAccounts.find(
            (l) => l.customerId === args.customerId
          );
          const newAccounts = existingAccount
            ? s2.data.loyaltyAccounts.map((l) =>
                l.customerId === args.customerId
                  ? {
                      ...l,
                      points: l.points - args.loyaltyPointsUsed + pointsEarned,
                      visitStreak: l.visitStreak + 1,
                    }
                  : l
              )
            : [
                ...s2.data.loyaltyAccounts,
                {
                  customerId: args.customerId,
                  points: pointsEarned,
                  tier: "bronze" as const,
                  visitStreak: 1,
                },
              ];

          const newTx = [...s2.data.loyaltyTransactions];
          if (args.loyaltyPointsUsed > 0) {
            newTx.push({
              id: uid("lt"),
              customerId: args.customerId,
              type: "redeem",
              points: -args.loyaltyPointsUsed,
              reason: `Redeemed at checkout (${receiptNumber})`,
              createdAt: new Date().toISOString(),
            });
          }
          if (pointsEarned > 0) {
            newTx.push({
              id: uid("lt"),
              customerId: args.customerId,
              type: "earn",
              points: pointsEarned,
              reason: `Visit — ${labelForServices(
                args.lineItems.filter((li) => li.kind === "service").map((li) => li.refId)
              ) || "purchase"}`,
              createdAt: new Date().toISOString(),
            });
          }

          // decrement sellable product stock
          const productQty = new Map<string, number>();
          args.lineItems
            .filter((li) => li.kind === "product")
            .forEach((li) =>
              productQty.set(li.refId, (productQty.get(li.refId) ?? 0) + li.qty)
            );

          return {
            data: {
              ...s2.data,
              invoices: [...s2.data.invoices, invoice],
              appointments: s2.data.appointments.map((a) =>
                a.id === args.appointmentId ? { ...a, invoiceId: invoice.id } : a
              ),
              memberships: s2.data.memberships.map((m) =>
                m.id === membership?.id
                  ? {
                      ...m,
                      usage: Object.fromEntries(
                        Object.entries({ ...m.usage }).map(([k, v]) => [
                          k,
                          v + (usageDelta[k] ?? 0),
                        ])
                      ),
                    }
                  : m
              ),
              loyaltyAccounts: newAccounts,
              loyaltyTransactions: newTx,
              inventory: s2.data.inventory.map((item) => {
                const sold = productQty.get(item.id);
                if (!sold) return item;
                return { ...item, quantity: Math.max(0, item.quantity - sold) };
              }),
            },
          };
        });

        return invoice;
      },

      requestLeave: (args) => {
        const lr: LeaveRequest = {
          id: uid("lv"),
          staffId: args.staffId,
          branchId: args.branchId,
          startDate: args.startDate,
          endDate: args.endDate,
          reason: args.reason,
          status: "pending",
          requestedAt: new Date().toISOString(),
        };
        set((st) => ({
          data: { ...st.data, leaveRequests: [...st.data.leaveRequests, lr] },
        }));
        const staff = STAFF.find((s) => s.id === args.staffId);
        get().pushNotification({
          role: "manager",
          branchId: args.branchId,
          category: "staff",
          title: `${staff?.name ?? "Staff"} requested leave`,
          body: `${args.startDate} → ${args.endDate}: ${args.reason}`,
          actionLabel: "Review",
          actionHref: "/manager/leave",
        });
      },

      decideLeave: (leaveId, decision) => {
        set((st) => {
          const lr = st.data.leaveRequests.find((l) => l.id === leaveId);
          if (!lr) return st;
          const newShifts =
            decision === "approved"
              ? st.data.shifts.map((s) =>
                  s.staffId === lr.staffId &&
                  s.date >= lr.startDate &&
                  s.date <= lr.endDate
                    ? { ...s, status: "leave" as const, start: undefined, end: undefined }
                    : s
                )
              : st.data.shifts;
          return {
            data: {
              ...st.data,
              shifts: newShifts,
              leaveRequests: st.data.leaveRequests.map((l) =>
                l.id === leaveId
                  ? {
                      ...l,
                      status: decision,
                      decidedAt: new Date().toISOString(),
                      decidedBy: "Branch Manager",
                    }
                  : l
              ),
            },
          };
        });
        const lr = get().data.leaveRequests.find((l) => l.id === leaveId);
        if (lr) {
          get().pushNotification({
            role: "barber",
            branchId: lr.branchId,
            category: "staff",
            title: `Leave ${lr.status}`,
            body: `Your leave request for ${lr.startDate} was ${lr.status}.`,
          });
        }
      },

      createPurchaseOrder: (args) => {
        const total = args.items.reduce((s, i) => s + i.qty * i.unitCost, 0);
        const po: PurchaseOrder = {
          id: uid("po"),
          branchId: args.branchId,
          vendorId: args.vendorId,
          items: args.items,
          status: "ordered",
          createdAt: new Date().toISOString(),
          expectedAt: addMinutes(new Date(), 60 * 24 * 2).toISOString(),
          total,
        };
        set((st) => ({
          data: { ...st.data, purchaseOrders: [...st.data.purchaseOrders, po] },
        }));
        return po;
      },

      receivePurchaseOrder: (poId) => {
        set((st) => {
          const po = st.data.purchaseOrders.find((p) => p.id === poId);
          if (!po || po.status === "received") return st;
          const qtyByItem = new Map(po.items.map((i) => [i.itemId, i.qty]));
          return {
            data: {
              ...st.data,
              purchaseOrders: st.data.purchaseOrders.map((p) =>
                p.id === poId
                  ? { ...p, status: "received", receivedAt: new Date().toISOString() }
                  : p
              ),
              inventory: st.data.inventory.map((item) => {
                const add = qtyByItem.get(item.id);
                if (!add) return item;
                return { ...item, quantity: item.quantity + add };
              }),
            },
          };
        });
      },

      adjustStock: (itemId, delta) => {
        set((st) => ({
          data: {
            ...st.data,
            inventory: st.data.inventory.map((i) =>
              i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
            ),
          },
        }));
      },

      joinWaitlist: (args) => {
        const entry: WaitlistEntry = {
          id: uid("wl"),
          branchId: args.branchId,
          customerId: args.customerId,
          staffId: args.staffId,
          serviceIds: args.serviceIds,
          desiredDate: args.desiredDate,
          desiredWindow: args.desiredWindow,
          createdAt: new Date().toISOString(),
          status: "open",
        };
        set((st) => ({
          data: { ...st.data, waitlist: [...st.data.waitlist, entry] },
        }));
      },

      resolveWaitlist: (entryId, status) => {
        set((st) => ({
          data: {
            ...st.data,
            waitlist: st.data.waitlist.map((w) =>
              w.id === entryId ? { ...w, status } : w
            ),
          },
        }));
      },

      respondToReview: (reviewId, response) => {
        set((st) => ({
          data: {
            ...st.data,
            reviews: st.data.reviews.map((r) =>
              r.id === reviewId
                ? { ...r, response, respondedAt: new Date().toISOString() }
                : r
            ),
          },
        }));
      },

      createOffer: (offer) => {
        set((st) => ({
          data: {
            ...st.data,
            offers: [...st.data.offers, { ...offer, id: uid("of"), redemptions: 0 }],
          },
        }));
      },

      toggleOffer: (offerId) => {
        set((st) => ({
          data: {
            ...st.data,
            offers: st.data.offers.map((o) =>
              o.id === offerId ? { ...o, active: !o.active } : o
            ),
          },
        }));
      },

      createCampaign: (campaign) => {
        set((st) => ({
          data: {
            ...st.data,
            campaigns: [
              ...st.data.campaigns,
              {
                ...campaign,
                id: uid("cp"),
                createdAt: new Date().toISOString(),
                status: "draft" as const,
              },
            ],
          },
        }));
      },

      sendCampaign: (campaignId) => {
        set((st) => ({
          data: {
            ...st.data,
            campaigns: st.data.campaigns.map((c) =>
              c.id === campaignId
                ? { ...c, status: "sent", sentAt: new Date().toISOString() }
                : c
            ),
          },
        }));
      },

      markNotificationRead: (id) => {
        set((st) => ({
          data: {
            ...st.data,
            notifications: st.data.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            ),
          },
        }));
      },

      markAllNotificationsRead: (role) => {
        set((st) => ({
          data: {
            ...st.data,
            notifications: st.data.notifications.map((n) =>
              n.role === role || n.role === "all" ? { ...n, read: true } : n
            ),
          },
        }));
      },

      pushNotification: (n) => {
        set((st) => ({
          data: {
            ...st.data,
            notifications: [
              {
                ...n,
                id: uid("nt"),
                createdAt: new Date().toISOString(),
                read: false,
              },
              ...st.data.notifications,
            ],
          },
        }));
      },

      toggleFavoriteBranch: (customerId, branchId) => {
        set((st) => ({
          data: {
            ...st.data,
            customers: st.data.customers.map((c) => {
              if (c.id !== customerId) return c;
              const has = c.favoriteBranchIds.includes(branchId);
              return {
                ...c,
                favoriteBranchIds: has
                  ? c.favoriteBranchIds.filter((b) => b !== branchId)
                  : [...c.favoriteBranchIds, branchId],
              };
            }),
          },
        }));
      },

      upsertCustomer: (customer) => {
        set((st) => {
          const exists = st.data.customers.some((c) => c.id === customer.id);
          return {
            data: {
              ...st.data,
              customers: exists
                ? st.data.customers.map((c) => (c.id === customer.id ? customer : c))
                : [...st.data.customers, customer],
            },
          };
        });
      },

      closeRegister: (branchId, actualCash) => {
        get().pushNotification({
          role: "owner",
          branchId,
          category: "payment",
          title: "Register closed",
          body: `Day closed with ₹${actualCash.toLocaleString("en-IN")} counted cash.`,
        });
      },
    }),
    {
      name: "barber-os-demo",
      storage: createJSONStorage(() => localStorage),
      version: SEED_VERSION,
      migrate: () => {
        // Any version change: throw away persisted state and reseed.
        return undefined as unknown as DemoState;
      },
      partialize: (state) => ({
        data: state.data,
        session: state.session,
        seedVersion: state.seedVersion,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);

function labelForServices(serviceIds: string[]) {
  return serviceIds
    .map((id) => serviceMap.get(id)?.name)
    .filter(Boolean)
    .join(" + ");
}
