import type { Router } from "express"
import { getQuote } from "../controllers/open-payments"

const opRoutes = (router: Router) => {
  router.post("/op/getQuote", getQuote)
  //router.post("/op/payment", getPaymentETC)
  
  return router
}

export default opRoutes