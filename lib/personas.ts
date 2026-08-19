import type { Role } from "@/lib/types";

export interface Persona {
  role: Role;
  name: string;
  title: string;
  linkedId: string;
  branchId?: string;
  home: string;
  avatarTone: string;
  description: string;
  cta: string;
}

export const PERSONAS: Record<Role, Persona> = {
  customer: {
    role: "customer",
    name: "Danish",
    title: "Customer",
    linkedId: "cu_danish",
    home: "/customer",
    avatarTone: "amber",
    description: "Book services and manage your visits.",
    cta: "Enter as Customer",
  },
  barber: {
    role: "barber",
    name: "Akhil",
    title: "Senior Barber · Kakkanad",
    linkedId: "st_akhil",
    branchId: "br_kakkanad",
    home: "/staff",
    avatarTone: "amber",
    description: "Manage your schedule, queue and customers.",
    cta: "Enter as Barber",
  },
  receptionist: {
    role: "receptionist",
    name: "Priya",
    title: "Receptionist · Kakkanad",
    linkedId: "reception_kakkanad",
    branchId: "br_kakkanad",
    home: "/reception",
    avatarTone: "rose",
    description: "Run bookings, walk-ins, checkout and queue.",
    cta: "Enter as Receptionist",
  },
  manager: {
    role: "manager",
    name: "Sanjay Menon",
    title: "Branch Manager · Kakkanad",
    linkedId: "manager_kakkanad",
    branchId: "br_kakkanad",
    home: "/manager",
    avatarTone: "emerald",
    description: "Manage staff and branch operations.",
    cta: "Enter as Manager",
  },
  owner: {
    role: "owner",
    name: "Vikram Menon",
    title: "Owner · Royal Cuts",
    linkedId: "biz_royalcuts",
    home: "/owner",
    avatarTone: "gold",
    description: "Run the entire business.",
    cta: "Enter as Owner",
  },
  admin: {
    role: "admin",
    name: "Platform Admin",
    title: "Barbershop OS HQ",
    linkedId: "platform",
    home: "/admin",
    avatarTone: "ink",
    description: "Manage all businesses using the SaaS platform.",
    cta: "Enter as Platform Admin",
  },
};

export const ROLE_ORDER: Role[] = [
  "customer",
  "barber",
  "receptionist",
  "manager",
  "owner",
  "admin",
];

// Route-prefix access map: which roles may see which app areas.
export const ROLE_ROUTES: Record<Role, string> = {
  customer: "/customer",
  barber: "/staff",
  receptionist: "/reception",
  manager: "/manager",
  owner: "/owner",
  admin: "/admin",
};

export interface PermissionSet {
  viewAllFinancials: boolean;
  manageStaff: boolean;
  manageBookings: boolean;
  managePayments: boolean;
  manageInventory: boolean;
  manageMarketing: boolean;
  viewOwnEarnings: boolean;
  approveLeave: boolean;
  switchBranches: boolean;
}

export const PERMISSIONS: Record<Role, PermissionSet> = {
  customer: {
    viewAllFinancials: false,
    manageStaff: false,
    manageBookings: false,
    managePayments: false,
    manageInventory: false,
    manageMarketing: false,
    viewOwnEarnings: false,
    approveLeave: false,
    switchBranches: false,
  },
  barber: {
    viewAllFinancials: false,
    manageStaff: false,
    manageBookings: false,
    managePayments: false,
    manageInventory: false,
    manageMarketing: false,
    viewOwnEarnings: true,
    approveLeave: false,
    switchBranches: false,
  },
  receptionist: {
    viewAllFinancials: false,
    manageStaff: false,
    manageBookings: true,
    managePayments: true,
    manageInventory: false,
    manageMarketing: false,
    viewOwnEarnings: false,
    approveLeave: false,
    switchBranches: false,
  },
  manager: {
    viewAllFinancials: false,
    manageStaff: true,
    manageBookings: true,
    managePayments: true,
    manageInventory: true,
    manageMarketing: false,
    viewOwnEarnings: false,
    approveLeave: true,
    switchBranches: false,
  },
  owner: {
    viewAllFinancials: true,
    manageStaff: true,
    manageBookings: true,
    managePayments: true,
    manageInventory: true,
    manageMarketing: true,
    viewOwnEarnings: false,
    approveLeave: true,
    switchBranches: true,
  },
  admin: {
    viewAllFinancials: true,
    manageStaff: false,
    manageBookings: false,
    managePayments: false,
    manageInventory: false,
    manageMarketing: false,
    viewOwnEarnings: false,
    approveLeave: false,
    switchBranches: true,
  },
};
