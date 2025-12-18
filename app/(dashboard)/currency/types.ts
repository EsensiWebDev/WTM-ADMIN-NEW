export interface Currency {
  id: string | number; // Backend returns number, frontend converts to string
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CurrencyPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
  }>;
}

