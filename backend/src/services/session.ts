//import { createCookieSessionStorage } from "@remix-run/node";
import type { Request, Response } from 'express'

type CookieType = {
  name: string,
  keys: string,
  maxAge: number
  httpOnly: boolean,
  secure: string
  sameSite: string
}
const buildSession = {
  name: 'ilpay-session',
  keys: [process.env.SESSION_COOKIE_SECRET_KEY || 'supersecretilpaystring'],
  maxAge: 300 * 1000, // 300 seconds or 5 minutes
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Secure only in production
  sameSite: 'none', // Ensures the cookie is sent in cross-site requests
  
}
const getSession = (req: Request) => req.session;
const commitSession = (req: Request, res: Response, cookie: CookieType) => {
  req.session.Cookie = cookie; 
  res.cookie("ilpay-session", cookie);
  res.send('Session committed');
};
const destroySession = (req: Request, res: Response) => {
  req.session = null; // Invalidate the session
  res.clearCookie('ilpay-session'); // Clear the session cookie
  res.send('Session destroyed');
};

// const { getSession, commitSession, destroySession } =
//   createCookieSessionStorage({
//     cookie: {
//       name: "ilpay-session",
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production" ? true : false,
//       sameSite: "none",
//       secrets: [
//         process.env.SESSION_COOKIE_SECRET_KEY || "supersecretilpaystring",
//       ],
//       maxAge: 300,
//     },
//   });

export { buildSession, getSession, commitSession, destroySession };
