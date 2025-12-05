import { SearchParams } from "@/types";

export interface ReportSummary {
  summary_data: {
    confirmed_booking: {
      count: number;
      percent: number;
      message: string;
    };
    cancelled_booking: {
      count: number;
      percent: number;
      message: string;
    };
    rejected_booking: {
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
  rejected_booking: number;
  agent_id: number;
  hotel_id: number;
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
