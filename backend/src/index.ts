import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { availability } from "./controllers/availabilityController.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bookingRoutes } from "./routes/bookingRoutes.js";
import { hallRoutes, movieRoutes, snackRoutes } from "./routes/catalogRoutes.js";
import { operatingHoursRoutes } from "./routes/operatingHoursRoutes.js";
import { recommendationRoutes } from "./routes/recommendationRoutes.js";

for (const key of ["MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "ML_SERVICE_URL"]) {
  if (!process.env[key]) throw new Error(key + " is required. Copy .env.example to .env and configure it.");
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/snacks", snackRoutes);
app.use("/api/bookings", bookingRoutes);
app.get("/api/availability", availability);
app.use("/api/operating-hours", operatingHoursRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
mongoose.connect(process.env.MONGODB_URI!).then(() => {
  app.listen(port, () => console.log("Minema API listening on http://localhost:" + port));
}).catch((error) => {
  console.error("MongoDB connection failed", error);
  process.exit(1);
});
