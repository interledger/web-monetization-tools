import type { Router } from "express"
import { getDefault, saveUserConfig } from "@controllers/tools"

const userRoutes = (router: Router) => {
  router.get("/tools/default", getDefault)
  router.post("/tools/:id", saveUserConfig)

  return router
}

export default userRoutes
