import { Document } from "mongoose";

export interface AdvancedResults<T extends Document> {
  success: boolean;
  count: number;
  pagination: {
    prev?: {
      page: number;
      limit: number;
    };
    next?: {
      page: number;
      limit: number;
    };
  };
  data: T[];
}
