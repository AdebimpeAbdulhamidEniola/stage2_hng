import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";
import { findAllProfiles } from "../model/profile.model";

const VALID_GENDERS = ["male", "female"];
const VALID_AGE_GROUPS = ["child", "teenager", "adult", "senior"];
const VALID_SORT_BY = ["age", "created_at", "gender_probability"];
const VALID_ORDER = ["asc", "desc"];

export const getAllProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by,
      order,
      page,
      limit,
    } = req.query;

    if (gender !== undefined && !VALID_GENDERS.includes(gender as string)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (age_group !== undefined && !VALID_AGE_GROUPS.includes(age_group as string)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (sort_by !== undefined && !VALID_SORT_BY.includes(sort_by as string)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (order !== undefined && !VALID_ORDER.includes(order as string)) {
      return sendError(res, 422, "Invalid query parameters");
    }

    const parsedMinAge = min_age ? Number(min_age) : undefined;
    const parsedMaxAge = max_age ? Number(max_age) : undefined;
    const parsedMinGenderProb = min_gender_probability ? Number(min_gender_probability) : undefined;
    const parsedMinCountryProb = min_country_probability ? Number(min_country_probability) : undefined;
    const parsedPage = page ? Number(page) : undefined;
    const parsedLimit = limit ? Number(limit) : undefined;

    if (parsedMinAge !== undefined && isNaN(parsedMinAge)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (parsedMaxAge !== undefined && isNaN(parsedMaxAge)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (parsedMinGenderProb !== undefined && isNaN(parsedMinGenderProb)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (parsedMinCountryProb !== undefined && isNaN(parsedMinCountryProb)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (parsedPage !== undefined && (isNaN(parsedPage) || parsedPage < 1)) {
      return sendError(res, 422, "Invalid query parameters");
    }
    if (parsedLimit !== undefined && (isNaN(parsedLimit) || parsedLimit < 1)) {
      return sendError(res, 422, "Invalid query parameters");
    }

    const result = await findAllProfiles({
      gender: typeof gender === "string" ? gender : undefined,
      age_group: typeof age_group === "string" ? age_group : undefined,
      country_id: typeof country_id === "string" ? country_id : undefined,
      min_age: parsedMinAge,
      max_age: parsedMaxAge,
      min_gender_probability: parsedMinGenderProb,
      min_country_probability: parsedMinCountryProb,
      sort_by: sort_by as "age" | "created_at" | "gender_probability" | undefined,
      order: order as "asc" | "desc" | undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    return res.status(200).json({
      status: "success",
      page: result.page,
      limit: result.limit,
      total: result.total,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};