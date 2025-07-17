import { SearchParams } from "@/types";
import { Option } from "@/types/data-table";
import { EmailLog, EmailLogTableResponse } from "./types";

export const getData = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<EmailLogTableResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      date: "2024-06-01T10:00:00Z",
      hotel_name: "Grand Hotel Jakarta",
      status: "success",
      notes: "Email sent successfully.",
    },
    {
      date: "2024-06-02T11:30:00Z",
      hotel_name: "Mercure Hotel Bandung",
      status: "failed",
      notes: "SMTP error.",
    },
    {
      date: "2024-06-03T09:15:00Z",
      hotel_name: "Novotel Surabaya",
      status: "success",
      notes: "",
    },
  ] as EmailLog[];

  return {
    success: true,
    data,
    page_count: 3,
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
