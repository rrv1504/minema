import { Router } from "express";
import { listOperatingHours, updateOperatingHours } from "../controllers/operatingHoursController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const operatingHoursRoutes = Router();
operatingHoursRoutes.get("/", listOperatingHours);
operatingHoursRoutes.put("/:date", requireAuth, requireAdmin, updateOperatingHours);
