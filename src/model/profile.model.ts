// src/model/profile.model.ts
import { prisma } from "../lib/prisma.js";


// find profile by name — used for idempotency check
export const findProfileByName = async (name: string) => {
  return await prisma.profile.findUnique({
    where: { name },
  });
};

// find profile by id — used for GET /api/profiles/:id
export const findProfileById = async (id: string) => {
  return await prisma.profile.findUnique({
    where: { id },
  });
};

// create a new profile — used for POST /api/profiles
export const createProfile = async (data: {
  id: string;
  name: string;
  gender: string;
  gender_probability: number;
  sample_size: number;
  age: number;
  age_group: string;
  country_id: string;
  country_probability: number;
}) => {
  return await prisma.profile.create({ data });
};

// find all profiles with optional filters — used for GET /api/profiles
export const findAllProfiles = async (filters: {
  gender?: string;
  country_id?: string;
  age_group?: string;
}) => {
  return await prisma.profile.findMany({
    where: {
      ...(filters.gender && {
        gender: { equals: filters.gender, mode: "insensitive" },
      }),
      ...(filters.country_id && {
        country_id: { equals: filters.country_id, mode: "insensitive" },
      }),
      ...(filters.age_group && {
        age_group: { equals: filters.age_group, mode: "insensitive" },
      }),
    },
    select: {
      id: true,
      name: true,
      gender: true,
      age: true,
      age_group: true,
      country_id: true
    }
  });
};

// delete profile by id — used for DELETE /api/profiles/:id
export const deleteProfileById = async (id: string) => {
  return await prisma.profile.delete({
    where: { id },
  });
};