import { Router } from "express";
import { getAllProfiles, searchProfiles } from "../controllers/profile.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { apiRateLimiter } from "@/middlewares/ratelimit.middleware";
import { requireApiVersion } from "@/middlewares/apiversion.middleware";

const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);
router.use(requireApiVersion);

router.get("/", getAllProfiles);
router.get("/search", searchProfiles);


export default router;