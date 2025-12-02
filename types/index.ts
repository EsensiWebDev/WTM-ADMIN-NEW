export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type EmptyProps<T extends React.ElementType> = Omit<
  React.ComponentProps<T>,
  keyof React.ComponentProps<T>
>;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export type ApiResponse<TData> = {
  status: number;
  message: string;
  data: TData;
  error?: string;
  pagination?: {
    limit: number;
    page?: number;
    total: number;
    total_pages: number;
    next_cursor?: string;
    prev_cursor?: string;
  };
};
