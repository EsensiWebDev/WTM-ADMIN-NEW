import { SearchParams } from "@/types";

export interface AgentControl {
  agent_company_name: string;
  certificate: string;
  email: string;
  id: number;
  id_card: string;
  kakao_talk_id: string;
  name: string;
  name_card: string;
  phone_number: string;
  photo: string;
  promo_group_id: number;
  promo_group_name: string;
  status: string;
}

export interface AgentControlPageProps {
  searchParams: Promise<SearchParams>;
}
