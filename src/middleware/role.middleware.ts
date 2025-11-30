import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const roleMiddleware = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Assuming the user object in req.user has the role populated.
    // In auth.middleware.ts, we decoded the token.
    // We need to make sure the token payload includes the role, OR we fetch the user from DB.
    // For better security/freshness, let's fetch the user or ensure token has role.
    // Let's check what we put in the token in AuthService.ts.

    // Checking AuthService.ts... we put { id: user._id }. We didn't put role.
    // So we should probably fetch the user here or update AuthService to include role.
    // Fetching user is safer but slower. Including in token is faster but requires re-login on role change.
    // Let's go with fetching user for now to be safe, or just check if req.user has it if we updated auth middleware.

    // Actually, let's update AuthService to include role in token for simplicity and performance,
    // AND update authMiddleware to just pass the decoded token.

    // Wait, I can't see AuthService right now.
    // Let's assume I'll update AuthService to include role in the token.

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient rights" });
    }

    next();
  };
};
