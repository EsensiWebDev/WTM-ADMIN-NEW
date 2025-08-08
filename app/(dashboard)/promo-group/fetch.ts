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
];

// Mock members
const members: Member[] = [
  { id: "1", name: "Alice", company: "Esensi Digital" },
  { id: "2", name: "Bob", company: "Vevo" },
  { id: "3", name: "Charlie", company: "88 Rising" },
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
