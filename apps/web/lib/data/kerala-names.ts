export const MALE_NAMES = [
  "Akhil", "Nikhil", "Rahul", "Amal", "Arjun", "Sarath", "Vishnu", "Sreejith",
  "Anoop", "Vipin", "Manu", "Karthik", "Aravind", "Shafi", "Neeraj", "Deepak",
  "Bibin", "Jithin", "Midhun", "Sooraj", "Alex", "Nithin", "Rohan", "Sandeep",
  "Vinod", "Praveen", "Ajay", "Vivek", "Naveen", "Sujith", "Renjith", "Hari",
  "Anand", "Rajesh", "Sabari", "Mithun", "Gokul", "Vishal", "Adithyan", "Farhan",
];

export const FEMALE_NAMES = [
  "Fathima", "Anjali", "Nayana", "Devika", "Meera", "Aiswarya", "Anagha", "Riya",
  "Neha", "Sreelakshmi", "Athira", "Haritha", "Divya", "Parvathy", "Amritha",
  "Kavya", "Nandana", "Reshma", "Sona", "Lakshmi", "Sruthi", "Gayathri", "Malavika",
  "Nimisha", "Aleena", "Shifana", "Anitha", "Soumya", "Vaishnavi", "Deepthi",
];

export const LAST_NAMES = [
  "Nair", "Menon", "Pillai", "Kurup", "Varma", "Panicker", "Warrier", "Namboothiri",
  "Thomas", "Jose", "Varghese", "Mathew", "Kutty", "Raj", "Krishnan",
  "Iqbal", "Rahman", "Basheer", "Salim", "Haneefa", "Kutty",
];

export const KERALA_LOCALITIES: Record<string, string[]> = {
  Kakkanad: ["Infopark Rd", "Seaport-Airport Rd", "Kakkanad Junction", "Civil Line Rd", "Thrikkakara"],
  Edappally: ["NH Bypass", "Changampuzha Nagar", "Edappally Toll", "Palarivattom Rd"],
  "Panampilly Nagar": ["Panampilly Ave", "Ravipuram Rd", "Chittoor Rd", "Marine Drive"],
  Thiruvananthapuram: ["MG Road", "Vazhuthacaud", "Kowdiar", "Pattom", "Sasthamangalam"],
};

export function keralaPhone(seedNum: number) {
  const prefixes = ["9847", "9846", "9895", "9544", "8281", "7025", "9961"];
  const p = prefixes[seedNum % prefixes.length];
  const rest = String(100000 + ((seedNum * 7919) % 900000)).slice(0, 6);
  return `+91 ${p}${rest.slice(0, 2)} ${rest.slice(2)}`;
}

export function fullName(seedNum: number, femaleRatio = 0.35) {
  const isFemale = seedNum % 100 < femaleRatio * 100;
  const first = isFemale
    ? FEMALE_NAMES[seedNum % FEMALE_NAMES.length]
    : MALE_NAMES[seedNum % MALE_NAMES.length];
  const last = LAST_NAMES[(seedNum * 3 + 1) % LAST_NAMES.length];
  return `${first} ${last}`;
}

export const AVATAR_TONES = [
  "amber", "emerald", "clay", "ink", "gold", "sage", "rose", "slate",
];

export function avatarTone(seedNum: number) {
  return AVATAR_TONES[seedNum % AVATAR_TONES.length];
}
