import { Request, Response, NextFunction } from "express";
import { PrismaClient, SystemRole } from "@prisma/client";
import { SUPER_USER_ONLY_ACTIONS } from "../constants/actions";

const prisma = new PrismaClient();

/**
 * Middleware to check if user has required system role (SUPER_USER only)
 */
export const requireSystemRole = (role: SystemRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req?.user?.systemRole !== role) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }
    next();
  };
};

/**
 * Middleware to check if user has required action permission
 * @param requiredAction - The action to check (e.g., "users.create", "assessments.read")
 */
export const checkPermission = (requiredAction: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ message: "Unauthorized: Authentication required" });
      return;
    }

    // SuperUser has all permissions
    if (req.user?.systemRole === SystemRole.SUPER_USER) {
      next();
      return;
    }

    // ORG_ADMIN can bypass permission checks for all actions
    // EXCEPT for SUPER_USER only actions (system/API/global action management)
    if (req.user?.systemRole === SystemRole.ORG_ADMIN) {
      // Check if this is a SUPER_USER only action
      if (SUPER_USER_ONLY_ACTIONS.includes(requiredAction)) {
        res.status(403).json({ 
          message: "Access denied: Insufficient permissions"
        });
        return;
      }

      // ORG_ADMIN can bypass all other actions
      // Still require organisation context for scoped access
      const organisationId = req.headers["x-organisation-id"] as string || 
                            req.params.organisationId || 
                            req.body.organisationId ||
                            req.query.organisationId as string;

      if (!organisationId) {
        res.status(400).json({ 
          message: "Bad Request: Organisation context required"
        });
        return;
      }

      // Attach organisation context to request
      req.organisationId = organisationId;
      next();
      return;
    }

    // Try to get organisation context from multiple sources
    const organisationId = req.headers["x-organisation-id"] as string || 
                          req.params.organisationId || 
                          req.body.organisationId ||
                          req.query.organisationId as string;

    if (!organisationId) {
      res.status(400).json({ 
        message: "Bad Request: Organisation context required"
      });
      return;
    }

    try {
      // Check if user has the required action
      const hasPermission = await userHasAction(userId, organisationId, requiredAction);
      
      if (!hasPermission) {
        res.status(403).json({ 
          message: "Access denied: Insufficient permissions"
        });
        return;
      }

      // Attach organisation context to request
      req.organisationId = organisationId;
      
      next();
    } catch (error) {
      console.error("RBAC Error:", error);
      res.status(500).json({ 
        message: "Internal Server Error"
      });
      return;
    }
  };
};

/**
 * Helper function to check if user has specific action in an organisation
 */
async function userHasAction(userId: string, organisationId: string, action: string): Promise<boolean> {
  try {
    const orgUser = await prisma.orgUser.findFirst({
      where: {
        userId: userId,
        organisationId: organisationId
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: {
                  include: {
                    permissionActions: {
                      include: {
                        action: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!orgUser?.role) {
      return false;
    }

    // Check if any of the user's permissions include the required action
    for (const rolePermission of orgUser.role.rolePermissions) {
      for (const permissionAction of rolePermission.permission.permissionActions) {
        if (permissionAction.action.name === action) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking user action:", error);
    return false;
  }
}

/**
 * Utility function to get all user actions in an organisation (for use in controllers if needed)
 */
export async function getUserActions(userId: string, organisationId: string): Promise<string[]> {
  try {
    const orgUser = await prisma.orgUser.findFirst({
      where: {
        userId: userId,
        organisationId: organisationId
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: {
                  include: {
                    permissionActions: {
                      include: {
                        action: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!orgUser?.role) {
      return [];
    }

    // Extract all actions from the user's role
    const actions: string[] = [];
    
    orgUser.role.rolePermissions.forEach(rolePermission => {
      rolePermission.permission.permissionActions.forEach(permissionAction => {
        actions.push(permissionAction.action.name);
      });
    });

    // Remove duplicates and return
    return [...new Set(actions)];
  } catch (error) {
    console.error("Error getting user actions:", error);
    return [];
  }
}