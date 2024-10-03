import "module-alias/register"
import https from "https"
import fs from "fs"
import express, { Express } from "express"
import routes from "./routes/index"

const router: Express = express()

// SSL certificate
const privateKey = fs.readFileSync('../certs/key.pem', 'utf8');
const certificate = fs.readFileSync('../certs/cert.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate };

router.use(express.urlencoded({ extended: true }))
router.use(express.json())

router.use((req, res, next) => {
  // set the CORS policy
  res.header("Access-Control-Allow-Origin", "*")
  // set the CORS headers
  res.header(
    "Access-Control-Allow-Headers",
    "origin,X-Requested-With,Content-Type,Accept,Authorization"
  )
  
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE")
    return res.status(200).json({})
  }
  next()
})

router.use("/", routes)

/** Error handling */
router.use((_, res) => {
  const error = new Error("not found")
  return res.status(404).json({
    message: error.message
  })
})

// Start that server
const httpsServer = https.createServer(credentials, router);
const PORT: string | number = process.env.PORT ?? 5101
httpsServer.listen(PORT, () => console.log(`Https API server started on port ${PORT}`))
