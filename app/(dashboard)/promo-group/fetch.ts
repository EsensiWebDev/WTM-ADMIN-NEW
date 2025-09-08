import { SearchParams } from "@/types";
import { Option } from "@/types/data-table";
import { Promo } from "../promo/types";
import { Member, PromoGroup, PromoGroupTableResponse } from "./types";

// Mock promos
const promos: Promo[] = [
  {
    id: "p1",
    name: "Summer Sale Promo",
    type: "discount",
    discount_percentage: 25,
    code: "SUMMER2024",
    description: "Get 25% off on all summer bookings",
    start_date: "2024-06-01T00:00:00.000Z",
    end_date: "2024-06-30T23:59:59.000Z",
    hotel_name: "Grand Hotel",
    room_type: "Deluxe",
    bed_type: "King",
    nights: 3,
    status: true,
  },
  {
    id: "p2",
    name: "Winter Special Promo",
    type: "fixed_price",
    price_discount: 100,
    code: "WINTER2024",
    description: "Fixed $100 discount on winter stays",
    start_date: "2024-12-01T00:00:00.000Z",
    end_date: "2025-01-15T23:59:59.000Z",
    hotel_name: "Mountain Resort",
    room_type: "Suite",
    bed_type: "Queen",
    nights: 2,
    status: false,
  },
  {
    id: "p3",
    name: "Spring Discount Promo",
    type: "discount",
    discount_percentage: 15,
    code: "SPRING2024",
    description: "Spring special 15% off",
    start_date: "2024-03-01T00:00:00.000Z",
    end_date: "2024-03-20T23:59:59.000Z",
    hotel_name: "City Center Hotel",
    room_type: "Standard",
    bed_type: "Twin",
    nights: 1,
    status: true,
  },
  {
    id: "p4",
    name: "Autumn Sale Promo",
    type: "room_upgrade",
    room_upgrade_to: "Premium Suite",
    code: "AUTUMN2024",
    description: "Free room upgrade to Premium Suite",
    start_date: "2024-10-01T00:00:00.000Z",
    end_date: "2024-10-15T23:59:59.000Z",
    hotel_name: "Luxury Resort",
    room_type: "Standard",
    bed_type: "King",
    nights: 2,
    status: true,
  },
  {
    id: "p5",
    name: "Summer Sale Promo",
    type: "benefits",
    benefits: "Free breakfast and spa access",
    code: "SUMMER2025",
    description: "Enjoy complimentary breakfast and spa",
    start_date: "2025-06-01T00:00:00.000Z",
    end_date: "2025-06-30T23:59:59.000Z",
    hotel_name: "Beach Resort",
    room_type: "Ocean View",
    bed_type: "King",
    nights: 4,
    status: true,
  },
  {
    id: "p6",
    name: "Winter Special Promo",
    type: "discount",
    discount_percentage: 30,
    code: "WINTER2025",
    description: "Winter wonderland 30% discount",
    start_date: "2025-12-01T00:00:00.000Z",
    end_date: "2026-01-15T23:59:59.000Z",
    hotel_name: "Snow Lodge",
    room_type: "Cabin",
    bed_type: "Queen",
    nights: 5,
    status: false,
  },
  {
    id: "p7",
    name: "Spring Discount Promo",
    type: "fixed_price",
    price_discount: 50,
    code: "SPRING2025",
    description: "Spring savings $50 off",
    start_date: "2025-03-01T00:00:00.000Z",
    end_date: "2025-03-20T23:59:59.000Z",
    hotel_name: "Garden Hotel",
    room_type: "Garden View",
    bed_type: "Twin",
    nights: 2,
    status: true,
  },
  {
    id: "p8",
    name: "Autumn Sale Promo",
    type: "discount",
    discount_percentage: 20,
    code: "AUTUMN2025",
    description: "Autumn colors 20% discount",
    start_date: "2025-10-01T00:00:00.000Z",
    end_date: "2025-10-15T23:59:59.000Z",
    hotel_name: "Forest Inn",
    room_type: "Forest View",
    bed_type: "King",
    nights: 3,
    status: true,
  },
  {
    id: "p9",
    name: "Summer Sale Promo",
    type: "benefits",
    benefits: "Free airport shuttle and late checkout",
    code: "SUMMER2026",
    description: "Summer convenience package",
    start_date: "2026-06-01T00:00:00.000Z",
    end_date: "2026-06-30T23:59:59.000Z",
    hotel_name: "Airport Hotel",
    room_type: "Business",
    bed_type: "King",
    nights: 1,
    status: true,
  },
  {
    id: "p10",
    name: "Winter Special Promo",
    type: "room_upgrade",
    room_upgrade_to: "Presidential Suite",
    code: "WINTER2026",
    description: "Ultimate luxury upgrade",
    start_date: "2026-12-01T00:00:00.000Z",
    end_date: "2027-01-15T23:59:59.000Z",
    hotel_name: "Presidential Hotel",
    room_type: "Deluxe",
    bed_type: "King",
    nights: 7,
    status: false,
  },
];

// Mock members
const members: Member[] = [
  { id: "1", name: "Alice", company: "Esensi Digital" },
  { id: "2", name: "Bob", company: "Vevo" },
  { id: "3", name: "Charlie", company: "88 Rising" },
  { id: "4", name: "Diana", company: "Esensi Digital" },
  { id: "5", name: "Evan", company: "Vevo" },
];

// Mock promo groups
const promoGroups: PromoGroup[] = [
  {
    id: "1",
    name: "Group A",
    members: [members[0], members[1]],
    promos: [promos[0], promos[1]],
  },
  {
    id: "2",
    name: "Group B",
    members: [members[2]],
    promos: [promos[2]],
  },
];

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<PromoGroupTableResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    data: promoGroups,
    pageCount: 1,
  };
};

export const getPromoGroup = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return promoGroups.find((group) => group.id === id);
};

export const getCompanyOptions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const data = [
    {
      label: "Esensi Digital",
      value: "1",
    },
    {
      label: "Vevo",
      value: "2",
    },
    {
      label: "88 Rising",
      value: "3",
    },
  ] as Option[];

  return data;
};

// Return Member[] optionally filtered by company label
export const getMembers = async (companyLabel?: string): Promise<Member[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!companyLabel) return members;
  return members.filter((m) => m.company === companyLabel);
};

// Return member options (id as value, name as label) optionally filtered by company label
export const getMemberOptions = async (
  companyLabel?: string
): Promise<Option[]> => {
  const list = await getMembers(companyLabel);
  return list.map((m) => ({ label: m.name, value: m.id }));
};

// Get all available promos
export const getAllPromos = async (): Promise<Promo[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return promos;
};

// Search promos with query (for AsyncSelect)
export const searchPromos = async (query?: string): Promise<Promo[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300)); // Shorter delay for search

  if (!query) {
    return promos;
  }

  const searchQuery = query.toLowerCase();
  return promos.filter(
    (promo) =>
      promo.name.toLowerCase().includes(searchQuery) ||
      promo.code.toLowerCase().includes(searchQuery)
  );
};
