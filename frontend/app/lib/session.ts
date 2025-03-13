import { createCookieSessionStorage } from '@remix-run/node'

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'wmtools-session',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      secrets: [
        process.env.SESSION_COOKIE_SECRET_KEY || 'supersecretilpaystring'
      ],
      maxAge: 300
    }
  })

export { getSession, commitSession, destroySession }
