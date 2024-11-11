import type { Router } from "express"
import { getQuote, initializePayment } from "../controllers/open-payments"

const opRoutes = (router: Router) => {
  router.post("/op/getQuote", getQuote)
  router.post("/op/initializePayment", initializePayment)
  
  return router
}

export default opRoutes