import { Router } from "express";
import { getAllProfiles } from "../controller/profile.controller";

const router = Router();

router.get("/", getAllProfiles);


export default router;