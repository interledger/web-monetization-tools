import "dotenv/config"
import express from "express"

// Import individual route profiles from controllers
import toolsRoute from "./tools"
import opRoutes from './open-payments'
const router: express.Router = express.Router()

// Pass our router instance to controllers
router.use("/tools", toolsRoute(router))
router.use("/op", opRoutes(router))
export default router
