import { SearchParams } from "@/types";

export interface AgentControlTableResponse {
  id: string;
  name: string;
  company: string;
  email: string;
  phone_number: string;
  status: string;
}

export interface AgentControlPageProps {
  searchParams: Promise<SearchParams>;
}
