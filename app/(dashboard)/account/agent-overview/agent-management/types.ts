import { SearchParams } from "@/types";

export interface Agent {
  id: number;
  name: string;
  agent_company_name: string;
  promo_group_id: number;
  promo_group_name: string;
  email: string;
  kakao_talk_id: string;
  phone_number: string;
  status: string;
  photo_selfie?: string; // url link photo agent selfie
  photo_id_card?: string; // url link photo agent id card
  certificate?: string; // url link photo agent certificate
  name_card?: string; // url link photo agent name card
}

export interface AgentTableResponse {
  success: boolean;
  data: Agent[];
  pageCount: number;
}

export interface AgentPageProps {
  searchParams: Promise<SearchParams>;
}
