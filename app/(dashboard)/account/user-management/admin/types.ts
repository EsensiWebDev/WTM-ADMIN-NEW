import { SearchParams } from "@/types";

export interface Admin {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  status: string;
  promo_group_id: number;
  promo_group_name: string;
  agent_company_name: string;
  kakao_talk_id: string;
  username: string;
}

export interface AdminPageProps {
  searchParams: Promise<SearchParams>;
}
