import { Router } from "express";
import { cancelBooking, createBooking, getBooking, listBookings, myBookings } from "../controllers/bookingController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const bookingRoutes = Router();
bookingRoutes.post("/", requireAuth, createBooking);
bookingRoutes.get("/my", requireAuth, myBookings);
bookingRoutes.get("/", requireAuth, requireAdmin, listBookings);
bookingRoutes.get("/:id", requireAuth, getBooking);
bookingRoutes.patch("/:id/cancel", requireAuth, cancelBooking);
