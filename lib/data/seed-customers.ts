import { subDays } from "date-fns";
import type { Customer } from "@/lib/types";
import { Rng } from "./rng";
import { fullName, keralaPhone, avatarTone } from "./kerala-names";
import { BRANCHES } from "./seed-static";

export interface HeroCustomerIds {
  danish: string;
  shafi: string;
  arjun: string;
  neeraj: string;
  fathimaCustomer: string;
}

const PREFERENCE_BANK = [
  "Low fade", "Skin fade", "Keep top length", "Beard 2mm", "Beard 3mm",
  "No razor on neckline", "Scissor cut only", "Light on the sides",
  "Round off edges", "Minimal styling product", "Extra hot towel",
  "Trim eyebrows too",
];

const NOTE_BANK = [
  "Prefers minimal styling product.",
  "Runs a little late — call 10 min before.",
  "Sensitive scalp, ask before massage.",
  "Likes to chat about football.",
  "Bring own comb, allergic to talc.",
  "Regular customer, always tips well.",
  "",
  "",
];

export function buildCustomers(rng: Rng, now: Date) {
  const customers: Customer[] = [];

  // ---- Hero / named customers referenced throughout the demo storyline ----
  const danish: Customer = {
    id: "cu_danish",
    userId: "user_cu_danish",
    name: "Danish",
    phone: "+91 9895 44 1090",
    email: "danish@example.com",
    avatarTone: "amber",
    homeBranchId: "br_kakkanad",
    preferredStaffId: "st_akhil",
    preferences: ["Low fade", "Beard 2mm", "Keep top length"],
    notes: "Prefers minimal styling product.",
    tags: ["vip", "loyal"],
    joinedAt: subDays(now, 420).toISOString(),
    favoriteBranchIds: ["br_kakkanad"],
    favoriteServiceIds: ["sv_haircutbeard"],
    language: "en",
  };
  customers.push(danish);

  const shafi: Customer = {
    id: "cu_shafi",
    userId: "user_cu_shafi",
    name: "Shafi",
    phone: "+91 8281 33 7712",
    avatarTone: "clay",
    homeBranchId: "br_kakkanad",
    preferences: ["Scissor cut only"],
    notes: "",
    tags: ["loyal"],
    joinedAt: subDays(now, 260).toISOString(),
    favoriteBranchIds: ["br_kakkanad"],
    favoriteServiceIds: ["sv_haircut"],
    language: "ml",
  };
  customers.push(shafi);

  const arjun: Customer = {
    id: "cu_arjun",
    userId: "user_cu_arjun",
    name: "Arjun Nair",
    phone: "+91 9544 88 2245",
    avatarTone: "gold",
    homeBranchId: "br_kakkanad",
    preferredStaffId: "st_akhil",
    preferences: ["Skin fade", "Extra hot towel"],
    notes: "Regular customer, always tips well.",
    tags: ["vip", "loyal"],
    joinedAt: subDays(now, 500).toISOString(),
    favoriteBranchIds: ["br_kakkanad"],
    favoriteServiceIds: ["sv_premiumhaircut"],
    language: "en",
  };
  customers.push(arjun);

  const neeraj: Customer = {
    id: "cu_neeraj",
    userId: "user_cu_neeraj",
    name: "Neeraj",
    phone: "+91 7025 61 9081",
    avatarTone: "slate",
    homeBranchId: "br_kakkanad",
    preferredStaffId: "st_nikhil",
    preferences: [],
    notes: "",
    tags: ["new"],
    joinedAt: subDays(now, 12).toISOString(),
    favoriteBranchIds: ["br_kakkanad"],
    favoriteServiceIds: ["sv_haircut"],
    language: "en",
  };
  customers.push(neeraj);

  const fathimaCustomer: Customer = {
    id: "cu_fathimaparam",
    userId: "user_cu_fathimaparam",
    name: "Fathima Rasheed",
    phone: "+91 9961 22 5540",
    avatarTone: "rose",
    homeBranchId: "br_edappally",
    preferredStaffId: "st_fathima",
    preferences: ["Round off edges"],
    notes: "Sensitive scalp, ask before massage.",
    tags: ["vip", "loyal"],
    joinedAt: subDays(now, 610).toISOString(),
    favoriteBranchIds: ["br_edappally"],
    favoriteServiceIds: ["sv_haircolour"],
    language: "ml",
  };
  customers.push(fathimaCustomer);

  const heroIds: HeroCustomerIds = {
    danish: danish.id,
    shafi: shafi.id,
    arjun: arjun.id,
    neeraj: neeraj.id,
    fathimaCustomer: fathimaCustomer.id,
  };

  // ---- Procedural customer pool per branch ----
  const targetPerBranch: Record<string, number> = {
    br_kakkanad: 58,
    br_edappally: 34,
    br_panampilly: 30,
    br_tvm: 32,
  };

  let seedCounter = 100;
  for (const branch of BRANCHES) {
    const count = targetPerBranch[branch.id] ?? 30;
    for (let i = 0; i < count; i++) {
      seedCounter += 1;
      const n = seedCounter;
      const name = fullName(n);
      const joinedDaysAgo = rng.int(3, 640);
      const tagsPool: Customer["tags"] = [];
      if (joinedDaysAgo < 20) tagsPool.push("new");
      if (rng.bool(0.12)) tagsPool.push("vip");
      if (rng.bool(0.1) && joinedDaysAgo > 60) tagsPool.push("at-risk");
      if (rng.bool(0.35)) tagsPool.push("loyal");

      const favService = rng.pick([
        "sv_haircut", "sv_haircutbeard", "sv_premiumhaircut", "sv_beardtrim",
        "sv_headmassage", "sv_haircolour", "sv_facial",
      ]);

      const c: Customer = {
        id: `cu_${String(n).padStart(4, "0")}`,
        userId: `user_cu_${String(n).padStart(4, "0")}`,
        name,
        phone: keralaPhone(n),
        avatarTone: avatarTone(n),
        homeBranchId: branch.id,
        preferredStaffId: undefined,
        preferences: rng.bool(0.55)
          ? [rng.pick(PREFERENCE_BANK), ...(rng.bool(0.4) ? [rng.pick(PREFERENCE_BANK)] : [])]
          : [],
        notes: rng.pick(NOTE_BANK),
        tags: tagsPool,
        joinedAt: subDays(now, joinedDaysAgo).toISOString(),
        favoriteBranchIds: [branch.id],
        favoriteServiceIds: [favService],
        language: rng.bool(0.3) ? "ml" : "en",
      };
      customers.push(c);
    }
  }

  return { customers, heroIds };
}
