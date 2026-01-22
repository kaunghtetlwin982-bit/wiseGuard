import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { User } from "../models/userModel";
import ResponseStatus from "../helper/responseStatus";
import config from "../config/config";

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Access token is required")
      );
      return;
    }
    console.log('token : ',token);
    console.log("config.JWT_SECRET : ", config.JWT_SECRET)

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT_SECRET || "your-secret-key") as any;
    console.log("decoded : ", decoded)


    // Check if user exists and is active
    const user = await User.findById(decoded.userId);
    console.log("user : ",user)
    if (!user) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("User not found")
      );
      return;
    }

    if (user.status !== "active") {
      res.status(403).json(
        ResponseStatus.PERMISSION_DENIED("Account is not active")
      );
      return;
    }

    // Attach user to request object
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Invalid token")
      );
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Token expired")
      );
      return;
    }

    res.status(500).json(
      ResponseStatus.UNKNOWN("Authentication failed")
    );
  }
};