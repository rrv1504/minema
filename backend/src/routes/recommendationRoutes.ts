import { Router } from "express";
import { recommend } from "../controllers/recommendationController.js";
import { requireAuth } from "../middleware/auth.js";

export const recommendationRoutes = Router();
recommendationRoutes.post("/", requireAuth, recommend);
