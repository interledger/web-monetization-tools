import 'dotenv/config'
import express from "express"

// Import individual route profiles from controllers
import toolsRoute from "@routes/tools"

const router = express.Router()

// Pass our router instance to controllers
router.use("/tools", toolsRoute(router))

export default router
