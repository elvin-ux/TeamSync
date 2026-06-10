import type { ApiResponse } from "../types/common";
import type { SearchResponse } from "../types/search";
import { api } from "./api";

export const searchService = {
  searchAll: async (query: string): Promise<SearchResponse> => {
    const response = await api.get<ApiResponse<SearchResponse>>(`/search?q=${encodeURIComponent(query)}`);
    return response.data.data;
  },
};
