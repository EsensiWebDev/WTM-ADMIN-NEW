import { SearchParams } from "@/types";
import { Option } from "@/types/data-table";
import { Promo } from "../promo/types";
import { Member, PromoGroup, PromoGroupTableResponse } from "./types";

// Mock promos
const promos: Promo[] = [
  {
    id: "p1",
    code: "SUMMER2024",
    name: "Summer Sale Promo",
    duration: 30,
    start_date: "2024-06-01T00:00:00.000Z",
    end_date: "2024-06-30T23:59:59.000Z",
    status: true,
  },
  {
    id: "p2",
    code: "WINTER2024",
    name: "Winter Special Promo",
    duration: 45,
    start_date: "2024-12-01T00:00:00.000Z",
    end_date: "2025-01-15T23:59:59.000Z",
    status: false,
  },
  {
    id: "p3",
    code: "SPRING2024",
    name: "Spring Discount Promo",
    duration: 20,
    start_date: "2024-03-01T00:00:00.000Z",
    end_date: "2024-03-20T23:59:59.000Z",
    status: true,
  },
  {
    id: "p4",
    code: "AUTUMN2024",
    name: "Autumn Sale Promo",
    duration: 15,
    start_date: "2024-10-01T00:00:00.000Z",
    end_date: "2024-10-15T23:59:59.000Z",
    status: true,
  },
  {
    id: "p5",
    code: "SUMMER2025",
    name: "Summer Sale Promo",
    duration: 30,
    start_date: "2025-06-01T00:00:00.000Z",
    end_date: "2025-06-30T23:59:59.000Z",
    status: true,
  },
  {
    id: "p6",
    code: "WINTER2025",
    name: "Winter Special Promo",
    duration: 45,
    start_date: "2025-12-01T00:00:00.000Z",
    end_date: "2026-01-15T23:59:59.000Z",
    status: false,
  },
  {
    id: "p7",
    code: "SPRING2025",
    name: "Spring Discount Promo",
    duration: 20,
    start_date: "2025-03-01T00:00:00.000Z",
    end_date: "2025-03-20T23:59:59.000Z",
    status: true,
  },
  {
    id: "p8",
    code: "AUTUMN2025",
    name: "Autumn Sale Promo",
    duration: 15,
    start_date: "2025-10-01T00:00:00.000Z",
    end_date: "2025-10-15T23:59:59.000Z",
    status: true,
  },
  {
    id: "p9",
    code: "SUMMER2026",
    name: "Summer Sale Promo",
    duration: 30,
    start_date: "2026-06-01T00:00:00.000Z",
    end_date: "2026-06-30T23:59:59.000Z",
    status: true,
  },
  {
    id: "p10",
    code: "WINTER2026",
    name: "Winter Special Promo",
    duration: 45,
    start_date: "2026-12-01T00:00:00.000Z",
    end_date: "2027-01-15T23:59:59.000Z",
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
