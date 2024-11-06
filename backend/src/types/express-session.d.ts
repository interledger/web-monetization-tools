import session from 'cookie-session';

declare module 'express' {
  interface Request {
    session?: session.SessionData
  }
}