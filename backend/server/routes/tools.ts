import type { Router } from "express"
import { getDefault, getUserConfig, saveUserConfig } from "@controllers/tools"

const userRoutes = (router: Router) => {
  router.get("/tools/default", getDefault)
  router.get("/tools/:id", getUserConfig)
  router.post("/tools", saveUserConfig)

  return router
}

export default userRoutes
