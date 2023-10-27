import { Response } from "express";
import { AdvancedResults } from "./src/types/advancedResults";

declare global {
  namespace Express {
    interface Response {
      advancedResults?: AdvancedResults;
    }
  }
}
