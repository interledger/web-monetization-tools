import https from 'https'
import http from 'http'
import fs from 'fs'
import type { Express } from 'express';
import express from 'express'
import session from 'express-session'
import routes from './routes/index.js'
import { SESSION_COOKIE_SECRET_KEY } from './services/session.js'

const router: Express = express()

const isDevelopment = process.env.NODE_ENV === 'development'

// SSL certificate (development only)
let credentials: { key: string; cert: string } | undefined

if (isDevelopment) {
  const privateKey = fs.readFileSync('../certs/key.pem', 'utf8')
  const certificate = fs.readFileSync('../certs/cert.pem', 'utf8')

  credentials = { key: privateKey, cert: certificate }
}

router.use(express.urlencoded({ extended: true }))
router.use(express.json())

// Session middleware
router.use(
  session({
    secret: SESSION_COOKIE_SECRET_KEY,
    resave: false,
    saveUninitialized: true, // Only save the session if it is modified
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    }
  })
)

router.use((req, res, next) => {
  // set the CORS policy
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Headers',
    'origin,X-Requested-With,Content-Type,Accept,Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    return res.status(200).json({})
  }
  next()
})

router.use('/', routes)

/** Error handling */
router.use((_, res) => {
  const error = new Error('not found')
  return res.status(404).json({
    message: error.message
  })
})

// Start that server
const PORT: string | number = process.env.PORT ?? 5101
if (isDevelopment && credentials) {
  const httpsServer = https.createServer(credentials, router)
  httpsServer.listen(PORT, () =>
    console.log(`Https API server started on port ${PORT}`)
  )
} else {
  const httpServer = http.createServer(router)
  httpServer.listen(PORT, () =>
    console.log(`HTTP API server started on port ${PORT}`)
  )
}
