import { SearchParams } from "@/types";

export interface ReportSummary {
  summary_data: {
    confirmed_booking: {
      count: number;
      percent: number;
      message: string;
    };
    cancellation_booking: {
      count: number;
      percent: number;
      message: string;
    };
    new_customer: {
      count: number;
      percent: number;
      message: string;
    };
  };
  graphic_data: { date: string; count: number }[] | null;
}

export interface ReportAgent {
  agent_name: string;
  agent_company: string;
  hotel_name: string;
  confirmed_booking: number;
  cancelled_booking: number;
}

export interface ReportAgentDetail {
  additional: string;
  capacity: string;
  date_in: string;
  date_out: string;
  guest_name: string;
  room_type: string;
  status_booking: string;
}

export interface ReportPageProps {
  searchParams: Promise<SearchParams>;
}
