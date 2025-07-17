import { Option } from "@/types/data-table";
import { Promo, PromoTableResponse } from "./types";

import { SearchParams } from "@/types";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<PromoTableResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      id: "1",
      code: "SUMMER2024",
      name: "Summer Sale Promo",
      duration: 30,
      start_date: "2024-06-01T00:00:00.000Z",
      end_date: "2024-06-30T23:59:59.000Z",
      status: true,
    },
    {
      id: "2",
      code: "WINTER2024",
      name: "Winter Special Promo",
      duration: 45,
      start_date: "2024-12-01T00:00:00.000Z",
      end_date: "2025-01-15T23:59:59.000Z",
      status: false,
    },
    {
      id: "3",
      code: "SPRING2024",
      name: "Spring Discount Promo",
      duration: 20,
      start_date: "2024-03-01T00:00:00.000Z",
      end_date: "2024-03-20T23:59:59.000Z",
      status: true,
    },
  ] as Promo[];

  return {
    success: true,
    data,
    pageCount: 2,
  };
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
