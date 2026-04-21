import { Router } from "express";
import { getAllProfiles, searchProfiles } from "../controller/profile.controller";

const router = Router();

router.get("/", getAllProfiles);
router.get("/search", searchProfiles);


export default router;