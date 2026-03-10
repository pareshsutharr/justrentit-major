import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { JwtPayload } from "../types.js";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.auth = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
