import { createCookieSessionStorage } from '@remix-run/node'

export const SESSION_COOKIE_SECRET_KEY =
  process.env.SESSION_COOKIE_SECRET_KEY || 'supersecretilpaystring'

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: 'wmtools-session',
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      secrets: [SESSION_COOKIE_SECRET_KEY]
    }
  })

export { getSession, commitSession, destroySession }
