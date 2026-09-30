import { Router } from "express";
import { halls, movies, snacks } from "../controllers/catalogController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

function createCatalogRoutes(controller: typeof movies) {
  const router = Router();
  router.get("/", controller.list);
  router.get("/:id", controller.getOne);
  router.post("/", requireAuth, requireAdmin, controller.create);
  router.put("/:id", requireAuth, requireAdmin, controller.update);
  router.delete("/:id", requireAuth, requireAdmin, controller.remove);
  return router;
}

export const movieRoutes = createCatalogRoutes(movies);
export const hallRoutes = createCatalogRoutes(halls);
export const snackRoutes = createCatalogRoutes(snacks);
