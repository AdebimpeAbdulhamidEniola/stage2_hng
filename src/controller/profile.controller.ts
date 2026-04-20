import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../utils/response.utils";
import { getGenderData } from "../services/genderize.service";
import { getAgeData } from "../services/agify.service";
import { getNationData } from "../services/nationalize.service";
import { uuidv7 } from "uuidv7";
import { findProfileByName, createProfile, findProfileById, findAllProfiles, deleteProfileById } from "../model/profile.model";


export const createUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { name } = req.body

    if (name === undefined) {
      return sendError(res, 400, "Missing name");
    }

    if (Array.isArray(name) || typeof name !== "string") {
      return sendError(res, 422, "Invalid type");
    }

    if (name.trim() === "") {
      return sendError(res, 400, "Empty name");
    }

    if (/^\d+$/.test(name.trim())) {
      return sendError(res, 422, "Invalid type");
    }

    //idempotency rule
    const existingProfile = await findProfileByName(name)
    if (existingProfile) {
      return res.status(200).json({
        "status": "success",
        "message": "Profile already exists",
        "data": existingProfile
      })
    }

    //Call the 3 API service at once to reduce response time
    const [genderData, ageData, nationData] = await Promise.all([
      getGenderData(name),
      getAgeData(name),
      getNationData(name),
    ]);

    const newProfile = await createProfile({
      id: uuidv7(),
      name,
      gender: genderData.gender,
      gender_probability: genderData.gender_probability,
      sample_size: genderData.sample_size,
      age: ageData.age,
      age_group: ageData.age_group,
      country_id: nationData.country_id,
      country_probability: nationData.country_probability,
    });
    sendSuccess(res, 201, newProfile)
  }
  catch (error) {
    next(error)
  }
} 



export const getProfileById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const userProfile = await findProfileById(id);

    if (!userProfile) {
      return sendError(res, 404, "Profile not found");
    }

    return sendSuccess(res, 200,  userProfile);
  } catch (error) {
    next(error);
  }
};




export const getAllProfiles = async (req: Request, res: Response, next: NextFunction) => {
  const { gender, country_id, age_group } = req.query;

  try {
    const profiles = await findAllProfiles({
      gender: typeof gender === "string" ? gender : undefined,
      country_id: typeof country_id === "string" ? country_id : undefined,
      age_group: typeof age_group === "string" ? age_group : undefined,
    });

    return res.status(200).json({
      status: "success",
      count: profiles.length,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteProfile = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const userProfile = await findProfileById(id);

    if (!userProfile) {
      return sendError(res, 404, "Profile not found");
    }

    await deleteProfileById(id);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};