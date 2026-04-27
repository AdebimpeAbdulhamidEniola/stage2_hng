import { Router } from "express";
import { getAllProfiles, searchProfiles , getProfileById, createUserProfile, exportProfiles } from "../controllers/profile.controller";
import { authenticate, requireRole } from "../middlewares/auth.middleware";
import { apiRateLimiter } from "../middlewares/ratelimit.middleware";
import { requireApiVersion } from "../middlewares/apiversion.middleware";



const router = Router();

router.use(authenticate);
router.use(apiRateLimiter);
router.use(requireApiVersion);

router.get("/", getAllProfiles);
router.get("/search", searchProfiles);
router.get("/export", exportProfiles);
router.get("/:id", getProfileById);
router.post("/", requireRole("admin"), createUserProfile);


export default router;