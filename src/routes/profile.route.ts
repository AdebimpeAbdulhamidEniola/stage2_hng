import { Router } from "express";
import {
  createUserProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile,
} from "../controller/profile.controller";

const router = Router();

router.post("/", createUserProfile);
router.get("/", getAllProfiles);
router.get("/:id", getProfileById);
router.delete("/:id", deleteProfile);

export default router;