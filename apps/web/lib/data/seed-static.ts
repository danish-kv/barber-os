import type {
  Business,
  Branch,
  ResourceItem,
  Service,
  ServiceAddon,
  Staff,
  MembershipPlan,
  SubscriptionPlanDef,
  Vendor,
  PlatformShop,
} from "@/lib/types";

import {
  SMALL_BRANCH,
  SMALL_BUSINESS,
  SMALL_SERVICES,
  SMALL_STAFF,
  SOLO_BRANCH,
  SOLO_BUSINESS,
  SOLO_OWNER_STAFF,
  SOLO_SERVICES,
} from "./seed-scenarios";


export const BUSINESS: Business = {
  id: "biz_royalcuts",
  name: "Royal Cuts",
  slug: "royal-cuts",
  tagline: "Kerala's grooming, reimagined",
  logoInitial: "R",
  languages: ["en", "ml"],
  plan: "business",
  createdAt: "2022-03-14T00:00:00.000Z",
  ratingAverage: 4.8,
  ratingCount: 1284,
};

const HOURS_STD = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
  day,
  open: day === 0 ? "10:00" : "10:00",
  close: day === 0 ? "18:00" : "20:00",
}));

export const BRANCHES: Branch[] = [
  {
    id: "br_kakkanad",
    businessId: BUSINESS.id,
    name: "Kakkanad",
    slug: "kakkanad",
    address: {
      line1: "2nd Floor, Infopark Rd",
      locality: "Kakkanad",
      city: "Kochi",
      state: "Kerala",
      pincode: "682030",
      lat: 10.0159,
      lng: 76.3419,
    },
    phone: "+91 9847 12 3401",
    whatsapp: "+91 9847 12 3401",
    hours: HOURS_STD,
    resourceIds: [],
    heroImageTone: "amber",
    isPrimary: true,
  },
  {
    id: "br_edappally",
    businessId: BUSINESS.id,
    name: "Edappally",
    slug: "edappally",
    address: {
      line1: "NH Bypass, Near Lulu Mall",
      locality: "Edappally",
      city: "Kochi",
      state: "Kerala",
      pincode: "682024",
      lat: 10.0261,
      lng: 76.3086,
    },
    phone: "+91 9847 12 3402",
    whatsapp: "+91 9847 12 3402",
    hours: HOURS_STD,
    resourceIds: [],
    heroImageTone: "emerald",
  },
  {
    id: "br_panampilly",
    businessId: BUSINESS.id,
    name: "Panampilly Nagar",
    slug: "panampilly-nagar",
    address: {
      line1: "Panampilly Avenue",
      locality: "Panampilly Nagar",
      city: "Kochi",
      state: "Kerala",
      pincode: "682036",
      lat: 9.9633,
      lng: 76.2999,
    },
    phone: "+91 9847 12 3403",
    whatsapp: "+91 9847 12 3403",
    hours: HOURS_STD,
    resourceIds: [],
    heroImageTone: "clay",
  },
  {
    id: "br_tvm",
    businessId: BUSINESS.id,
    name: "Thiruvananthapuram",
    slug: "thiruvananthapuram",
    address: {
      line1: "MG Road, Near Ayurveda College Jn",
      locality: "Vazhuthacaud",
      city: "Thiruvananthapuram",
      state: "Kerala",
      pincode: "695014",
      lat: 8.5074,
      lng: 76.9569,
    },
    phone: "+91 9847 12 3404",
    whatsapp: "+91 9847 12 3404",
    hours: HOURS_STD,
    resourceIds: [],
    heroImageTone: "ink",
  },
];

export const RESOURCES: ResourceItem[] = BRANCHES.flatMap((b) => [
  { id: `${b.id}_chair1`, branchId: b.id, name: "Barber Chair 1", type: "chair" as const, status: "available" as const },
  { id: `${b.id}_chair2`, branchId: b.id, name: "Barber Chair 2", type: "chair" as const, status: "available" as const },
  { id: `${b.id}_chair3`, branchId: b.id, name: "Barber Chair 3", type: "chair" as const, status: "available" as const },
  { id: `${b.id}_facial`, branchId: b.id, name: "Facial Room", type: "room" as const, status: "available" as const },
  { id: `${b.id}_wash`, branchId: b.id, name: "Hair Wash Station", type: "station" as const, status: "available" as const },
]);

BRANCHES.forEach((b) => {
  b.resourceIds = RESOURCES.filter((r) => r.branchId === b.id).map((r) => r.id);
});

const ALL_BRANCH_IDS = BRANCHES.map((b) => b.id);

export const ADDONS: ServiceAddon[] = [
  { id: "ad_beardoil", name: "Beard Oil Finish", price: 99, durationMin: 10 },
  { id: "ad_hottowel", name: "Hot Towel Shave Finish", price: 149, durationMin: 10 },
  { id: "ad_hairwash", name: "Hair Wash", price: 99, durationMin: 10 },
  { id: "ad_scalp", name: "Scalp Massage Add-on", price: 149, durationMin: 15 },
];

export const SERVICES: Service[] = [
  {
    id: "sv_haircut",
    branchIds: ALL_BRANCH_IDS,
    category: "hair",
    name: "Haircut",
    nameMl: "ഹെയർകട്ട്",
    description: "Precision cut tailored to your face shape and style.",
    price: 250,
    durationMin: 30,
    addonIds: ["ad_hairwash", "ad_scalp"],
    popular: true,
  },
  {
    id: "sv_beardtrim",
    branchIds: ALL_BRANCH_IDS,
    category: "beard",
    name: "Beard Trim",
    nameMl: "ബിയേഡ് ട്രിം",
    description: "Sharp shape-up with hot towel finish.",
    price: 150,
    durationMin: 20,
    addonIds: ["ad_beardoil", "ad_hottowel"],
  },
  {
    id: "sv_haircutbeard",
    branchIds: ALL_BRANCH_IDS,
    category: "hair",
    name: "Haircut + Beard",
    nameMl: "ഹെയർകട്ട് + ബിയേഡ്",
    description: "Our most popular combo — full grooming reset.",
    price: 350,
    durationMin: 45,
    addonIds: ["ad_beardoil", "ad_hottowel", "ad_hairwash"],
    popular: true,
  },
  {
    id: "sv_premiumhaircut",
    branchIds: ALL_BRANCH_IDS,
    category: "hair",
    name: "Premium Haircut",
    nameMl: "പ്രീമിയം ഹെയർകട്ട്",
    description: "Senior stylist, styling consult, premium finish.",
    price: 450,
    durationMin: 45,
    addonIds: ["ad_hairwash", "ad_scalp"],
  },
  {
    id: "sv_facial",
    branchIds: ALL_BRANCH_IDS,
    category: "spa",
    name: "Facial",
    nameMl: "ഫേഷ്യൽ",
    description: "Deep cleanse, brighten and de-stress facial.",
    price: 500,
    durationMin: 45,
    requiresResourceType: "room",
    addonIds: [],
  },
  {
    id: "sv_haircolour",
    branchIds: ALL_BRANCH_IDS,
    category: "color",
    name: "Hair Colour",
    nameMl: "ഹെയർ കളർ",
    description: "Global or grey-coverage colour with ammonia-free options.",
    price: 1200,
    durationMin: 90,
    addonIds: ["ad_hairwash"],
  },
  {
    id: "sv_headmassage",
    branchIds: ALL_BRANCH_IDS,
    category: "spa",
    name: "Head Massage",
    nameMl: "ഹെഡ് മസാജ്",
    description: "Warm oil champi massage to relieve tension.",
    price: 300,
    durationMin: 30,
    addonIds: [],
    popular: true,
  },
  {
    id: "sv_kidshaircut",
    branchIds: ALL_BRANCH_IDS,
    category: "kids",
    name: "Kids Haircut",
    nameMl: "കുട്ടികളുടെ ഹെയർകട്ട്",
    description: "Patient, playful cuts for ages 10 and under.",
    price: 200,
    durationMin: 25,
    addonIds: [],
  },
];

function commission(role: Staff["role"]) {
  switch (role) {
    case "senior-barber":
      return [
        { serviceCategory: "hair" as const, rate: 0.3 },
        { serviceCategory: "beard" as const, rate: 0.3 },
        { serviceCategory: "color" as const, rate: 0.35 },
        { serviceCategory: "spa" as const, rate: 0.3 },
        { serviceCategory: "product" as const, rate: 0.12 },
        { serviceCategory: "default" as const, rate: 0.28 },
      ];
    case "stylist":
      return [
        { serviceCategory: "hair" as const, rate: 0.28 },
        { serviceCategory: "color" as const, rate: 0.35 },
        { serviceCategory: "spa" as const, rate: 0.3 },
        { serviceCategory: "product" as const, rate: 0.12 },
        { serviceCategory: "default" as const, rate: 0.26 },
      ];
    case "barber":
      return [
        { serviceCategory: "hair" as const, rate: 0.25 },
        { serviceCategory: "beard" as const, rate: 0.25 },
        { serviceCategory: "spa" as const, rate: 0.22 },
        { serviceCategory: "product" as const, rate: 0.1 },
        { serviceCategory: "default" as const, rate: 0.22 },
      ];
    case "trainee":
    default:
      return [
        { serviceCategory: "product" as const, rate: 0.08 },
        { serviceCategory: "default" as const, rate: 0.15 },
      ];
  }
}

function stdHours(offDay: number, sundayOff = false): Staff["workingHours"] {
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    start: day === 0 ? "10:00" : "10:00",
    end: day === 0 ? "18:00" : "20:00",
    off: day === offDay || (sundayOff && day === 0),
  }));
}

const allServiceIds = SERVICES.map((s) => s.id);
const noColor = allServiceIds.filter((id) => id !== "sv_haircolour");
const barberCore = ["sv_haircut", "sv_beardtrim", "sv_haircutbeard", "sv_headmassage", "sv_kidshaircut"];

export const STAFF: Staff[] = [
  {
    id: "st_akhil",
    userId: "user_st_akhil",
    branchId: "br_kakkanad",
    name: "Akhil",
    role: "senior-barber",
    title: "Senior Barber",
    phone: "+91 9847 20 1101",
    avatarTone: "amber",
    experienceYears: 8,
    serviceIds: noColor,
    rating: 4.9,
    ratingCount: 412,
    workingHours: stdHours(2),
    commissionRules: commission("senior-barber"),
    color: "amber",
    bio: "Fade specialist. Known for precision line-ups and a calm chair-side manner.",
    joinedAt: "2018-06-01T00:00:00.000Z",
  },
  {
    id: "st_nikhil",
    userId: "user_st_nikhil",
    branchId: "br_kakkanad",
    name: "Nikhil",
    role: "barber",
    title: "Barber",
    phone: "+91 9847 20 1102",
    avatarTone: "emerald",
    experienceYears: 4,
    serviceIds: barberCore,
    rating: 4.7,
    ratingCount: 208,
    workingHours: stdHours(3),
    commissionRules: commission("barber"),
    color: "emerald",
    joinedAt: "2021-01-10T00:00:00.000Z",
  },
  {
    id: "st_rahul",
    userId: "user_st_rahul",
    branchId: "br_kakkanad",
    name: "Rahul",
    role: "barber",
    title: "Barber",
    phone: "+91 9847 20 1103",
    avatarTone: "slate",
    experienceYears: 3,
    serviceIds: barberCore,
    rating: 4.6,
    ratingCount: 156,
    workingHours: stdHours(4),
    commissionRules: commission("barber"),
    color: "slate",
    joinedAt: "2022-02-14T00:00:00.000Z",
  },
  {
    id: "st_amal",
    userId: "user_st_amal",
    branchId: "br_kakkanad",
    name: "Amal",
    role: "trainee",
    title: "Trainee",
    phone: "+91 9847 20 1104",
    avatarTone: "sage",
    experienceYears: 1,
    serviceIds: ["sv_haircut", "sv_beardtrim", "sv_kidshaircut"],
    rating: 4.4,
    ratingCount: 38,
    workingHours: stdHours(1),
    commissionRules: commission("trainee"),
    color: "sage",
    joinedAt: "2024-05-01T00:00:00.000Z",
  },
  {
    id: "st_fathima",
    userId: "user_st_fathima",
    branchId: "br_edappally",
    name: "Fathima",
    role: "stylist",
    title: "Stylist",
    phone: "+91 9847 20 1201",
    avatarTone: "rose",
    experienceYears: 6,
    serviceIds: allServiceIds,
    rating: 4.9,
    ratingCount: 301,
    workingHours: stdHours(1),
    commissionRules: commission("stylist"),
    color: "rose",
    bio: "Colour specialist with a background in editorial styling.",
    joinedAt: "2019-09-01T00:00:00.000Z",
  },
  {
    id: "st_sarath",
    userId: "user_st_sarath",
    branchId: "br_edappally",
    name: "Sarath",
    role: "barber",
    title: "Barber",
    phone: "+91 9847 20 1202",
    avatarTone: "clay",
    experienceYears: 5,
    serviceIds: barberCore,
    rating: 4.7,
    ratingCount: 190,
    workingHours: stdHours(2),
    commissionRules: commission("barber"),
    color: "clay",
    joinedAt: "2020-03-20T00:00:00.000Z",
  },
  {
    id: "st_anjali",
    userId: "user_st_anjali",
    branchId: "br_edappally",
    name: "Anjali",
    role: "stylist",
    title: "Stylist",
    phone: "+91 9847 20 1203",
    avatarTone: "gold",
    experienceYears: 3,
    serviceIds: allServiceIds,
    rating: 4.8,
    ratingCount: 122,
    workingHours: stdHours(3),
    commissionRules: commission("stylist"),
    color: "gold",
    joinedAt: "2022-08-11T00:00:00.000Z",
  },
  {
    id: "st_vishnu",
    userId: "user_st_vishnu",
    branchId: "br_panampilly",
    name: "Vishnu",
    role: "senior-barber",
    title: "Senior Barber",
    phone: "+91 9847 20 1301",
    avatarTone: "ink",
    experienceYears: 9,
    serviceIds: noColor,
    rating: 4.9,
    ratingCount: 388,
    workingHours: stdHours(4),
    commissionRules: commission("senior-barber"),
    color: "ink",
    joinedAt: "2017-11-05T00:00:00.000Z",
  },
  {
    id: "st_devika",
    userId: "user_st_devika",
    branchId: "br_panampilly",
    name: "Devika",
    role: "stylist",
    title: "Stylist",
    phone: "+91 9847 20 1302",
    avatarTone: "rose",
    experienceYears: 5,
    serviceIds: allServiceIds,
    rating: 4.8,
    ratingCount: 210,
    workingHours: stdHours(5),
    commissionRules: commission("stylist"),
    color: "rose",
    joinedAt: "2020-01-15T00:00:00.000Z",
  },
  {
    id: "st_midhun",
    userId: "user_st_midhun",
    branchId: "br_panampilly",
    name: "Midhun",
    role: "barber",
    title: "Barber",
    phone: "+91 9847 20 1303",
    avatarTone: "emerald",
    experienceYears: 2,
    serviceIds: barberCore,
    rating: 4.5,
    ratingCount: 94,
    workingHours: stdHours(1),
    commissionRules: commission("barber"),
    color: "emerald",
    joinedAt: "2023-06-19T00:00:00.000Z",
  },
  {
    id: "st_sreejith",
    userId: "user_st_sreejith",
    branchId: "br_tvm",
    name: "Sreejith",
    role: "senior-barber",
    title: "Senior Barber",
    phone: "+91 9847 20 1401",
    avatarTone: "amber",
    experienceYears: 10,
    serviceIds: noColor,
    rating: 4.9,
    ratingCount: 455,
    workingHours: stdHours(2),
    commissionRules: commission("senior-barber"),
    color: "amber",
    joinedAt: "2016-04-01T00:00:00.000Z",
  },
  {
    id: "st_haritha",
    userId: "user_st_haritha",
    branchId: "br_tvm",
    name: "Haritha",
    role: "stylist",
    title: "Stylist",
    phone: "+91 9847 20 1402",
    avatarTone: "gold",
    experienceYears: 4,
    serviceIds: allServiceIds,
    rating: 4.8,
    ratingCount: 176,
    workingHours: stdHours(3),
    commissionRules: commission("stylist"),
    color: "gold",
    joinedAt: "2021-07-22T00:00:00.000Z",
  },
  {
    id: "st_bibin",
    userId: "user_st_bibin",
    branchId: "br_tvm",
    name: "Bibin",
    role: "barber",
    title: "Barber",
    phone: "+91 9847 20 1403",
    avatarTone: "slate",
    experienceYears: 3,
    serviceIds: barberCore,
    rating: 4.6,
    ratingCount: 133,
    workingHours: stdHours(4),
    commissionRules: commission("barber"),
    color: "slate",
    joinedAt: "2022-09-09T00:00:00.000Z",
  },
  {
    id: "st_farhan",
    userId: "user_st_farhan",
    branchId: "br_tvm",
    name: "Farhan",
    role: "trainee",
    title: "Trainee",
    phone: "+91 9847 20 1404",
    avatarTone: "sage",
    experienceYears: 1,
    serviceIds: ["sv_haircut", "sv_beardtrim", "sv_kidshaircut"],
    rating: 4.3,
    ratingCount: 21,
    workingHours: stdHours(1),
    commissionRules: commission("trainee"),
    color: "sage",
    joinedAt: "2025-01-06T00:00:00.000Z",
  },
];

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "mp_royal",
    name: "Royal Grooming Membership",
    pricePerMonth: 999,
    perks: ["4 Haircuts", "4 Beard Trims", "Priority booking", "10% product discount"],
    includedServices: [
      { serviceId: "sv_haircut", qty: 4 },
      { serviceId: "sv_beardtrim", qty: 4 },
    ],
    discountPercent: 10,
  },
  {
    id: "mp_royal_plus",
    name: "Royal Grooming Plus",
    pricePerMonth: 1799,
    perks: [
      "4 Haircut + Beard combos",
      "2 Facials",
      "Priority booking",
      "15% product discount",
      "Free head massage monthly",
    ],
    includedServices: [
      { serviceId: "sv_haircutbeard", qty: 4 },
      { serviceId: "sv_facial", qty: 2 },
      { serviceId: "sv_headmassage", qty: 1 },
    ],
    discountPercent: 15,
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlanDef[] = [
  {
    id: "free",
    name: "Free",
    pricePerMonth: 0,
    features: ["1 barber", "Basic booking", "Customer database"],
  },
  {
    id: "solo",
    name: "Solo",
    pricePerMonth: 399,
    features: [
      "One working barber",
      "Appointments & walk-ins",
      "Live queue",
      "Customer history",
      "Basic POS & daily revenue",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    pricePerMonth: 799,
    features: [
      "Unlimited bookings",
      "Multiple staff",
      "Walk-in queue",
      "Payments",
      "WhatsApp concepts",
      "Analytics",
    ],
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    pricePerMonth: 1499,
    features: [
      "Loyalty & rewards",
      "Memberships",
      "Inventory management",
      "Staff commissions",
      "Advanced reports",
      "Marketing campaigns",
    ],
  },
  {
    id: "multi-branch",
    name: "Multi-Branch",
    pricePerMonth: 2999,
    priceSuffix: "+",
    features: [
      "Multiple locations",
      "Centralized analytics",
      "Branch management",
      "Advanced permissions",
      "Priority support",
    ],
  },
];

export const VENDORS: Vendor[] = [
  { id: "vd_keralagrooming", name: "Kerala Grooming Supplies Co.", contactName: "Sunil Kumar", phone: "+91 9744 55 2201", itemIds: [], leadTimeDays: 3 },
  { id: "vd_southcoast", name: "South Coast Salon Distributors", contactName: "Priya Menon", phone: "+91 9744 55 2202", itemIds: [], leadTimeDays: 5 },
  { id: "vd_cochinmart", name: "Cochin Barber Mart", contactName: "Thomas Jacob", phone: "+91 9744 55 2203", itemIds: [], leadTimeDays: 2 },
];

export const PRODUCT_TEMPLATES: Array<{
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  sellPrice?: number;
  sellable: boolean;
  vendorId: string;
  minQuantity: number;
  baseQty: number;
  consumedPerService?: Record<string, number>;
}> = [
  { name: "Hair Wax", category: "Styling", unit: "jar", costPrice: 180, sellPrice: 349, sellable: true, vendorId: "vd_keralagrooming", minQuantity: 6, baseQty: 4 },
  { name: "Disposable Blades", category: "Consumables", unit: "box", costPrice: 90, sellable: false, vendorId: "vd_cochinmart", minQuantity: 5, baseQty: 4, consumedPerService: { sv_beardtrim: 0.1, sv_haircutbeard: 0.1 } },
  { name: "Shampoo", category: "Hair Care", unit: "bottle", costPrice: 220, sellPrice: 399, sellable: true, vendorId: "vd_southcoast", minQuantity: 6, baseQty: 9 },
  { name: "Beard Oil", category: "Beard Care", unit: "bottle", costPrice: 260, sellPrice: 499, sellable: true, vendorId: "vd_keralagrooming", minQuantity: 6, baseQty: 3 },
  { name: "Hair Colour Tube", category: "Colour", unit: "tube", costPrice: 340, sellable: false, vendorId: "vd_southcoast", minQuantity: 8, baseQty: 14, consumedPerService: { sv_haircolour: 1 } },
  { name: "Shaving Cream", category: "Consumables", unit: "tub", costPrice: 150, sellable: false, vendorId: "vd_cochinmart", minQuantity: 4, baseQty: 7 },
  { name: "Aftershave Lotion", category: "Beard Care", unit: "bottle", costPrice: 190, sellPrice: 349, sellable: true, vendorId: "vd_keralagrooming", minQuantity: 5, baseQty: 8 },
  { name: "Towels", category: "Supplies", unit: "pcs", costPrice: 60, sellable: false, vendorId: "vd_cochinmart", minQuantity: 20, baseQty: 34 },
  { name: "Facial Kit", category: "Spa", unit: "kit", costPrice: 280, sellable: false, vendorId: "vd_southcoast", minQuantity: 5, baseQty: 9, consumedPerService: { sv_facial: 1 } },
  { name: "Hair Gel", category: "Styling", unit: "jar", costPrice: 140, sellPrice: 299, sellable: true, vendorId: "vd_keralagrooming", minQuantity: 6, baseQty: 11 },
];

export const OTHER_PLATFORM_SHOPS: PlatformShop[] = [
  { id: "shop_trendcutz", businessId: "biz_trendcutz", ownerName: "Manoj K.", plan: "pro", status: "active", branchCount: 2, mrr: 799, createdAt: "2024-11-02T00:00:00.000Z", city: "Kochi", supportOpenTickets: 0 },
  { id: "shop_gentlemans", businessId: "biz_gentlemans", ownerName: "Rizwan A.", plan: "business", status: "active", branchCount: 1, mrr: 1499, createdAt: "2024-06-18T00:00:00.000Z", city: "Kozhikode", supportOpenTickets: 1 },
  { id: "shop_salondekerala", businessId: "biz_salondekerala", ownerName: "Nisha T.", plan: "multi-branch", status: "active", branchCount: 5, mrr: 3499, createdAt: "2023-02-27T00:00:00.000Z", city: "Kochi", supportOpenTickets: 0 },
  { id: "shop_fadefactory", businessId: "biz_fadefactory", ownerName: "Aju Simon", plan: "free", status: "trial", branchCount: 1, mrr: 0, createdAt: "2026-08-02T00:00:00.000Z", city: "Thrissur", supportOpenTickets: 2 },
  { id: "shop_classicclippers", businessId: "biz_classicclippers", ownerName: "Suresh Babu", plan: "pro", status: "past-due", branchCount: 1, mrr: 799, createdAt: "2024-01-11T00:00:00.000Z", city: "Thiruvananthapuram", supportOpenTickets: 1 },
  { id: "shop_glowstudio", businessId: "biz_glowstudio", ownerName: "Meera Pillai", plan: "business", status: "active", branchCount: 2, mrr: 1499, createdAt: "2023-09-30T00:00:00.000Z", city: "Kozhikode", supportOpenTickets: 0 },
  { id: "shop_urbanbarber", businessId: "biz_urbanbarber", ownerName: "Vishal Menon", plan: "pro", status: "active", branchCount: 1, mrr: 799, createdAt: "2025-03-15T00:00:00.000Z", city: "Kochi", supportOpenTickets: 0 },
  { id: "shop_stylecircle", businessId: "biz_stylecircle", ownerName: "Anitha Raj", plan: "free", status: "churned", branchCount: 1, mrr: 0, createdAt: "2024-08-04T00:00:00.000Z", city: "Kollam", supportOpenTickets: 0 },
];


// ---------------------------------------------------------------------------
// Demo V1.1 — scenario registries. Royal Cuts exports above stay exactly as
// they were (the premium storyline depends on them); these unions let shared
// lookups resolve entities from every demo business.

export const ALL_BUSINESSES: Business[] = [
  BUSINESS,
  SOLO_BUSINESS,
  SMALL_BUSINESS,
];

export const ALL_BRANCHES: Branch[] = [...BRANCHES, SOLO_BRANCH, SMALL_BRANCH];

export const ALL_SERVICES: Service[] = [
  ...SERVICES,
  ...SOLO_SERVICES,
  ...SMALL_SERVICES,
];

/** Every seed-defined staff member across scenarios. Runtime-added staff
 * (temporary hires created in the demo) live in DemoData.extraStaff. */
export const SEED_STAFF: Staff[] = [...STAFF, SOLO_OWNER_STAFF, ...SMALL_STAFF];
