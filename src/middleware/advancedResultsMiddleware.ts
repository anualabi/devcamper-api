import { Document, Model } from "mongoose";
import { Request, Response, NextFunction } from "express";

import { AdvancedResults } from "../types/advancedResults";

const advancedResults =
  <T extends Document>(model: Model<T>, populate?: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select && typeof req.query.select === "string") {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort Fields
    if (req.query.sort && typeof req.query.sort === "string") {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);
    if (populate) {
      query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination: any = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    const advancedResults: AdvancedResults<T> = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    res.advancedResults = advancedResults;
    next();
  };

export default advancedResults;
