// Demo V1.1 scenario worlds: the solo one-chair shop and the small local
// shop. Static catalog data (business, branch, services, seed staff) lives
// here; per-scenario runtime data (appointments, customers, revenue…) is
// built in seed-solo.ts / seed-small.ts. Royal Cuts (premium) stays in
// seed-static.ts untouched.

import type { Branch, Business, Service, ShopConfig, Staff } from "@/lib/types";

// ---------------------------------------------------------------------------
// SOLO — Danish Men's Studio, Muvattupuzha. One chair, one owner-barber.
// ---------------------------------------------------------------------------

export const SOLO_BUSINESS: Business = {
  id: "biz_danishstudio",
  name: "Danish Men's Studio",
  slug: "danish-mens-studio",
  tagline: "Your neighbourhood barber in Muvattupuzha",
  logoInitial: "D",
  languages: ["en", "ml"],
  plan: "solo",
  createdAt: "2024-06-01T00:00:00.000Z",
  ratingAverage: 4.9,
  ratingCount: 214,
};

export const SOLO_BRANCH: Branch = {
  id: "br_muvattupuzha",
  businessId: SOLO_BUSINESS.id,
  name: "Muvattupuzha",
  slug: "muvattupuzha",
  address: {
    line1: "Market Road, near KSRTC stand",
    locality: "Muvattupuzha",
    city: "Ernakulam",
    state: "Kerala",
    pincode: "686661",
  },
  phone: "+91 9744 88 1102",
  whatsapp: "+91 9744 88 1102",
  hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: "09:00",
    close: day === 0 ? "13:00" : "20:30",
    closed: day === 1, // Monday off — common for local Kerala shops
  })),
  resourceIds: [],
  heroImageTone: "clay",
  isPrimary: true,
};

export const SOLO_SERVICES: Service[] = [
  {
    id: "svs_haircut",
    branchIds: [SOLO_BRANCH.id],
    category: "hair",
    name: "Haircut",
    nameMl: "ഹെയർകട്ട്",
    description: "Classic cut, machine or scissors.",
    price: 200,
    durationMin: 25,
    addonIds: [],
    popular: true,
  },
  {
    id: "svs_beard",
    branchIds: [SOLO_BRANCH.id],
    category: "beard",
    name: "Beard",
    nameMl: "ബിയേഡ്",
    description: "Trim and shape with razor finish.",
    price: 100,
    durationMin: 15,
    addonIds: [],
    popular: true,
  },
  {
    id: "svs_cutbeard",
    branchIds: [SOLO_BRANCH.id],
    category: "hair",
    name: "Haircut + Beard",
    nameMl: "ഹെയർകട്ട് + ബിയേഡ്",
    description: "The full refresh.",
    price: 280,
    durationMin: 40,
    addonIds: [],
    popular: true,
  },
  {
    id: "svs_kids",
    branchIds: [SOLO_BRANCH.id],
    category: "kids",
    name: "Kids Haircut",
    nameMl: "കുട്ടികളുടെ ഹെയർകട്ട്",
    description: "Quick and patient cuts for kids.",
    price: 150,
    durationMin: 20,
    addonIds: [],
  },
  {
    id: "svs_shave",
    branchIds: [SOLO_BRANCH.id],
    category: "beard",
    name: "Clean Shave",
    nameMl: "ഷേവ്",
    description: "Hot towel clean shave.",
    price: 80,
    durationMin: 15,
    addonIds: [],
  },
  {
    id: "svs_facial",
    branchIds: [SOLO_BRANCH.id],
    category: "spa",
    name: "Facial",
    nameMl: "ഫേഷ്യൽ",
    description: "Simple brightening facial.",
    price: 350,
    durationMin: 40,
    addonIds: [],
  },
];

const soloWeek = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  day,
  start: "09:00",
  end: day === 0 ? "13:00" : "20:30",
  off: day === 1,
}));

/** Danish — the owner who is also the only barber. */
export const SOLO_OWNER_STAFF: Staff = {
  id: "sts_danish",
  userId: "user_sts_danish",
  branchId: SOLO_BRANCH.id,
  name: "Danish",
  role: "senior-barber",
  title: "Owner · Barber",
  phone: "+91 9744 88 1102",
  avatarTone: "amber",
  experienceYears: 9,
  serviceIds: SOLO_SERVICES.map((s) => s.id),
  rating: 4.9,
  ratingCount: 214,
  workingHours: soloWeek,
  commissionRules: [{ serviceCategory: "default", rate: 1 }],
  color: "amber",
  bio: "Runs the studio single-handed. Known for clean fades and zero waiting when you call ahead.",
  joinedAt: "2024-06-01T00:00:00.000Z",
  employmentType: "permanent",
  accessType: "app_user",
};

export const SOLO_CONFIG: ShopConfig = {
  bookingMode: "staff_only",
  staffSelection: "shop",
  advance: "none",
  ownerWorksAsStaff: true,
  remoteQueueJoin: true,
};

// ---------------------------------------------------------------------------
// SMALL — Brothers Hair Point, Perumbavoor. Owner+barber, one permanent
// barber, one temporary barber for the Onam rush.
// ---------------------------------------------------------------------------

export const SMALL_BUSINESS: Business = {
  id: "biz_brothers",
  name: "Brothers Hair Point",
  slug: "brothers-hair-point",
  tagline: "Perumbavoor's trusted family barbershop",
  logoInitial: "B",
  languages: ["en", "ml"],
  plan: "pro",
  createdAt: "2021-02-15T00:00:00.000Z",
  ratingAverage: 4.7,
  ratingCount: 486,
};

export const SMALL_BRANCH: Branch = {
  id: "br_perumbavoor",
  businessId: SMALL_BUSINESS.id,
  name: "Perumbavoor",
  slug: "perumbavoor",
  address: {
    line1: "AM Road, opposite private bus stand",
    locality: "Perumbavoor",
    city: "Ernakulam",
    state: "Kerala",
    pincode: "683542",
  },
  phone: "+91 9895 66 2210",
  whatsapp: "+91 9895 66 2210",
  hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    open: "09:00",
    close: "21:00",
    closed: false,
  })),
  resourceIds: [],
  heroImageTone: "emerald",
  isPrimary: true,
};

export const SMALL_SERVICES: Service[] = [
  {
    id: "svb_haircut",
    branchIds: [SMALL_BRANCH.id],
    category: "hair",
    name: "Haircut",
    nameMl: "ഹെയർകട്ട്",
    description: "Classic or trending styles.",
    price: 220,
    durationMin: 25,
    addonIds: [],
    popular: true,
  },
  {
    id: "svb_beard",
    branchIds: [SMALL_BRANCH.id],
    category: "beard",
    name: "Beard Trim",
    nameMl: "ബിയേഡ് ട്രിം",
    description: "Shape-up with razor lines.",
    price: 120,
    durationMin: 15,
    addonIds: [],
  },
  {
    id: "svb_cutbeard",
    branchIds: [SMALL_BRANCH.id],
    category: "hair",
    name: "Haircut + Beard",
    nameMl: "ഹെയർകട്ട് + ബിയേഡ്",
    description: "Most popular combo.",
    price: 300,
    durationMin: 40,
    addonIds: [],
    popular: true,
  },
  {
    id: "svb_kids",
    branchIds: [SMALL_BRANCH.id],
    category: "kids",
    name: "Kids Haircut",
    nameMl: "കുട്ടികളുടെ ഹെയർകട്ട്",
    description: "For the little ones.",
    price: 160,
    durationMin: 20,
    addonIds: [],
  },
  {
    id: "svb_colour",
    branchIds: [SMALL_BRANCH.id],
    category: "color",
    name: "Hair Colour",
    nameMl: "ഹെയർ കളർ",
    description: "Grey coverage, natural black or brown.",
    price: 600,
    durationMin: 60,
    addonIds: [],
  },
  {
    id: "svb_facial",
    branchIds: [SMALL_BRANCH.id],
    category: "spa",
    name: "Facial",
    nameMl: "ഫേഷ്യൽ",
    description: "Clean-up and glow facial.",
    price: 400,
    durationMin: 40,
    addonIds: [],
  },
];

const smallWeek = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  day,
  start: "09:00",
  end: "21:00",
  off: false,
}));

export const SMALL_STAFF: Staff[] = [
  {
    id: "stb_danish",
    userId: "user_stb_danish",
    branchId: SMALL_BRANCH.id,
    name: "Danish",
    role: "senior-barber",
    title: "Owner · Barber",
    phone: "+91 9895 66 2210",
    avatarTone: "amber",
    experienceYears: 12,
    serviceIds: SMALL_SERVICES.map((s) => s.id),
    rating: 4.8,
    ratingCount: 290,
    workingHours: smallWeek.map((w) => ({ ...w, off: w.day === 2 })),
    commissionRules: [{ serviceCategory: "default", rate: 1 }],
    color: "amber",
    bio: "Founder. Behind the first chair since 2013.",
    joinedAt: "2021-02-15T00:00:00.000Z",
    employmentType: "permanent",
    accessType: "app_user",
  },
  {
    id: "stb_sameer",
    userId: "user_stb_sameer",
    branchId: SMALL_BRANCH.id,
    name: "Sameer",
    role: "barber",
    title: "Barber",
    phone: "+91 9895 66 2211",
    avatarTone: "emerald",
    experienceYears: 5,
    serviceIds: ["svb_haircut", "svb_beard", "svb_cutbeard", "svb_kids"],
    rating: 4.6,
    ratingCount: 152,
    workingHours: smallWeek.map((w) => ({ ...w, off: w.day === 4 })),
    commissionRules: [{ serviceCategory: "default", rate: 0.4 }],
    color: "emerald",
    joinedAt: "2022-08-01T00:00:00.000Z",
    employmentType: "permanent",
    accessType: "app_user",
  },
  // Nabeel — the seasonal barber for the Onam rush. Managed by the owner,
  // no app login. Active window is stamped relative to "now" by the seed
  // builder (seed-small.ts) so the demo always shows a live contract.
  {
    id: "stb_nabeel",
    userId: "user_stb_nabeel",
    branchId: SMALL_BRANCH.id,
    name: "Nabeel",
    role: "barber",
    title: "Temporary Barber",
    phone: "+91 9895 66 2212",
    avatarTone: "sage",
    experienceYears: 3,
    serviceIds: ["svb_haircut", "svb_beard", "svb_kids"],
    rating: 4.5,
    ratingCount: 34,
    workingHours: smallWeek,
    commissionRules: [{ serviceCategory: "default", rate: 0.45 }],
    color: "sage",
    joinedAt: "2026-08-01T00:00:00.000Z",
    employmentType: "temporary",
    accessType: "managed_by_shop",
    // activeFrom/activeUntil stamped in seed-small.ts
  },
];

export const SMALL_CONFIG: ShopConfig = {
  bookingMode: "staff_only",
  staffSelection: "any",
  advance: "none",
  ownerWorksAsStaff: true,
  remoteQueueJoin: false,
};
