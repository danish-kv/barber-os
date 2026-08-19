import type { Language } from "@/lib/types";

// Lightweight dictionary-based localization for customer-facing surfaces.
// Business logic never branches on language — only labels do.
const DICT = {
  // Booking flow
  "book.title": { en: "Book an appointment", ml: "അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുക" },
  "book.chooseServices": { en: "Choose services", ml: "സേവനങ്ങൾ തിരഞ്ഞെടുക്കുക" },
  "book.chooseBarber": { en: "Choose barber", ml: "ബാർബറെ തിരഞ്ഞെടുക്കുക" },
  "book.chooseTime": { en: "Choose time", ml: "സമയം തിരഞ്ഞെടുക്കുക" },
  "book.review": { en: "Review", ml: "അവലോകനം" },
  "book.payment": { en: "Payment", ml: "പേയ്മെന്റ്" },
  "book.anyBarber": { en: "Any Available Barber", ml: "ലഭ്യമായ ഏത് ബാർബറും" },
  "book.fastest": { en: "Fastest availability", ml: "ഏറ്റവും വേഗത്തിലുള്ള ലഭ്യത" },
  "book.continue": { en: "Continue", ml: "തുടരുക" },
  "book.back": { en: "Back", ml: "പിന്നോട്ട്" },
  "book.add": { en: "Add", ml: "ചേർക്കുക" },
  "book.added": { en: "Added", ml: "ചേർത്തു" },
  "book.morning": { en: "Morning", ml: "രാവിലെ" },
  "book.afternoon": { en: "Afternoon", ml: "ഉച്ചയ്ക്ക്" },
  "book.evening": { en: "Evening", ml: "വൈകുന്നേരം" },
  "book.payAdvance": { en: "Pay ₹100 advance", ml: "₹100 അഡ്വാൻസ് അടയ്ക്കുക" },
  "book.payFull": { en: "Pay full amount", ml: "മുഴുവൻ തുകയും അടയ്ക്കുക" },
  "book.payAtShop": { en: "Pay at shop", ml: "കടയിൽ അടയ്ക്കുക" },
  "book.confirm": { en: "Confirm booking", ml: "ബുക്കിംഗ് സ്ഥിരീകരിക്കുക" },
  "book.confirmed": { en: "Booking Confirmed", ml: "ബുക്കിംഗ് സ്ഥിരീകരിച്ചു" },
  "book.advancePaid": { en: "Advance Paid", ml: "അഡ്വാൻസ് അടച്ചു" },
  "book.balanceAtShop": { en: "Balance at shop", ml: "ബാക്കി കടയിൽ" },
  "book.viewBooking": { en: "View Booking", ml: "ബുക്കിംഗ് കാണുക" },
  "book.addToCalendar": { en: "Add to Calendar", ml: "കലണ്ടറിൽ ചേർക്കുക" },
  "book.getDirections": { en: "Get Directions", ml: "വഴി കാണുക" },
  "book.share": { en: "Share", ml: "പങ്കിടുക" },
  "book.joinWaitlist": { en: "Join Waitlist", ml: "വെയിറ്റ്‌ലിസ്റ്റിൽ ചേരുക" },
  "book.noSlots": { en: "No slots available", ml: "സ്ലോട്ടുകൾ ലഭ്യമല്ല" },
  "book.available": { en: "Available", ml: "ലഭ്യമാണ്" },
  "book.popular": { en: "Popular", ml: "ജനപ്രിയം" },
  "book.almostFull": { en: "Almost Full", ml: "ഏതാണ്ട് നിറഞ്ഞു" },
  "book.services": { en: "services", ml: "സേവനങ്ങൾ" },
  "book.min": { en: "min", ml: "മിനിറ്റ്" },

  // Customer home
  "home.greetingMorning": { en: "Good morning", ml: "സുപ്രഭാതം" },
  "home.greetingAfternoon": { en: "Good afternoon", ml: "ശുഭ ഉച്ച" },
  "home.greetingEvening": { en: "Good evening", ml: "ശുഭ സന്ധ്യ" },
  "home.nextAppointment": { en: "Next appointment", ml: "അടുത്ത അപ്പോയിന്റ്മെന്റ്" },
  "home.bookAgain": { en: "Book Again", ml: "വീണ്ടും ബുക്ക് ചെയ്യുക" },
  "home.joinQueue": { en: "Join Queue", ml: "ക്യൂവിൽ ചേരുക" },
  "home.explore": { en: "Explore", ml: "കണ്ടെത്തുക" },
  "home.offers": { en: "Offers", ml: "ഓഫറുകൾ" },
  "home.loyalty": { en: "Rewards", ml: "റിവാർഡുകൾ" },
  "home.bookings": { en: "Bookings", ml: "ബുക്കിംഗുകൾ" },
  "home.profile": { en: "Profile", ml: "പ്രൊഫൈൽ" },
  "home.home": { en: "Home", ml: "ഹോം" },
  "home.membership": { en: "Membership", ml: "മെമ്പർഷിപ്പ്" },

  // Queue
  "queue.youreInQueue": { en: "You're in the queue", ml: "നിങ്ങൾ ക്യൂവിലാണ്" },
  "queue.estimatedWait": { en: "Estimated wait", ml: "പ്രതീക്ഷിക്കുന്ന കാത്തിരിപ്പ്" },
  "queue.ahead": { en: "customers ahead of you", ml: "പേർ നിങ്ങളുടെ മുന്നിലുണ്ട്" },
  "queue.checkedIn": { en: "Checked In", ml: "ചെക്ക്-ഇൻ ചെയ്തു" },
  "queue.waiting": { en: "Waiting", ml: "കാത്തിരിക്കുന്നു" },
  "queue.next": { en: "You're Next", ml: "അടുത്തത് നിങ്ങളാണ്" },
  "queue.inService": { en: "In Service", ml: "സേവനത്തിലാണ്" },
  "queue.complete": { en: "Complete", ml: "പൂർത്തിയായി" },

  // Appointment reminder preview
  "reminder.title": { en: "Appointment reminder", ml: "അപ്പോയിന്റ്മെന്റ് ഓർമ്മപ്പെടുത്തൽ" },
  "reminder.body": {
    en: "Your appointment at Royal Cuts is tomorrow at {time}. Reply R to reschedule.",
    ml: "റോയൽ കട്ട്സിലെ നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് നാളെ {time}-ന് ആണ്. മാറ്റാൻ R എന്ന് മറുപടി നൽകുക.",
  },

  // Shop page
  "shop.services": { en: "Services", ml: "സേവനങ്ങൾ" },
  "shop.staff": { en: "Our Team", ml: "ഞങ്ങളുടെ ടീം" },
  "shop.reviews": { en: "Reviews", ml: "അവലോകനങ്ങൾ" },
  "shop.bookNow": { en: "Book Now", ml: "ഇപ്പോൾ ബുക്ക് ചെയ്യുക" },
  "shop.openToday": { en: "Open today", ml: "ഇന്ന് തുറന്നിരിക്കുന്നു" },
  "shop.experience": { en: "years experience", ml: "വർഷത്തെ പരിചയം" },
} as const;

export type I18nKey = keyof typeof DICT;

export function t(key: I18nKey, lang: Language, vars?: Record<string, string>) {
  let s: string = DICT[key][lang] ?? DICT[key].en;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, v);
    }
  }
  return s;
}
