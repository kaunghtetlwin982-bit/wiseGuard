import { Request, Response, NextFunction } from "express";
import ResponseStatus from "../helper/responseStatus";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if user is authenticated (should be set by authenticateToken middleware)
    if (!req.user) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Authentication required")
      );
      return;
    }

    // Check if user has admin/owner role
    const allowedRoles = ["developer"]; // Adjust based on your role system

    if (!allowedRoles.includes(req.user.roleId)) {
      res.status(403).json(
        ResponseStatus.PERMISSION_DENIED("Admin access required")
      );
      return;
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Authorization failed")
    );
  }
};

export const requireOwner = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Authentication required")
      );
      return;
    }
    console.log("userData : ", req.user)

    // Check if user has owner role specifically
    if (req.user.roleId !== "owner")  {
      res.status(403).json(
        ResponseStatus.PERMISSION_DENIED("Owner access required")
      );
      return;
    }

    next();
  } catch (error) {
    console.error("Owner authorization error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Authorization failed")
    );
  }
};

export const requireOwnerAndDeveloper= (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json(
        ResponseStatus.UNAUTHENTICATED("Authentication required")
      );
      return;
    }
    console.log("userData : ", req.user)

    // Check if user has owner role specifically
    if (req.user.roleId === "agent")   {
      res.status(403).json(
        ResponseStatus.PERMISSION_DENIED("Owner and Develoepr access required")
      );
      return;
    }

    next();
  } catch (error) {
    console.error("Owner authorization error:", error);
    res.status(500).json(
      ResponseStatus.UNKNOWN("Authorization failed")
    );
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json(
          ResponseStatus.UNAUTHENTICATED("Authentication required")
        );
        return;
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(req.user.roleId)) {
        res.status(403).json(
          ResponseStatus.PERMISSION_DENIED(`One of the following roles required: ${allowedRoles.join(", ")}`)
        );
        return;
      }

      next();
    } catch (error) {
      console.error("Role authorization error:", error);
      res.status(500).json(
        ResponseStatus.UNKNOWN("Authorization failed")
      );
    }
  };
};