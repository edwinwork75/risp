import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid"; // Add this import for generating unique codes
import { hashPassword } from "../services/auth.service"; // Add this import
import { SUPER_USER_ONLY_ACTIONS } from "../constants/actions"; // Add this import
import { getUserActions } from "../middleware/rbac.middleware"; // Add this import


const prisma = new PrismaClient();

/**
 * Create an organisation with an admin user
 */
export const createOrganisation = async (req: Request, res: Response) => {
  try {
    const { name, description, adminEmail, adminPassword, adminName } = req.body;
    const userId = req?.user?.id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (!adminEmail || !adminPassword || !adminName) {
      res.status(400).json({ 
        message: "Admin email, password, and name are required" 
      });
      return;
    }

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingUser) {
      res.status(400).json({ 
        message: "User with this email already exists" 
      });
      return;
    }

    // Create the organization
    const organisation = await prisma.organisation.create({
      data: {
        name,
        description,
        ownerId: userId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Hash the admin password
    const hashedPassword = await hashPassword(adminPassword);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        systemRole: "ORG_ADMIN",
        createdBy: userId,
        updatedBy: userId,
      },
    });

    // Create UserToken for the admin user
    await prisma.userToken.create({
      data: {
        userId: adminUser.id,
        isVerified: true, // Admin users are pre-verified
      },
    });

    // Create a default "Admin" role for the organization
    const adminRole = await prisma.role.create({
      data: {
        name: "Admin",
        description: "Organization administrator with full access",
        organisationId: organisation.id,
        isSystemRole: false,
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
    });

    // Add the admin user to the organization with the Admin role
    await prisma.orgUser.create({
      data: {
        organisationId: organisation.id,
        userId: adminUser.id,
        roleId: adminRole.id, // Assign the proper admin role instead of null
      },
    });

    res.status(201).json({ 
      message: "Organisation and admin user created successfully", 
      organisation,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        systemRole: adminUser.systemRole
      },
      adminRole: {
        id: adminRole.id,
        name: adminRole.name,
        description: adminRole.description
      }
    });
  } catch (error) {
    console.error("Error creating organisation:", error);
    res.status(500).json({ message: "Error creating organisation", error });
  }
};

/**
 * List all organisations the user is part of
 */
export const listOrganisations = async (req: Request, res: Response) => {
  try {
    const userId = req?.user?.id;
    const userSystemRole = req?.user?.systemRole;

    let organisations;

    // SuperAdmin can see all organizations
    if (userSystemRole === 'SUPER_USER') {
      organisations = await prisma.organisation.findMany({
        include: {
          orgUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    } else {
      // Regular users only see organizations they're part of
      organisations = await prisma.organisation.findMany({
        where: { orgUsers: { some: { userId } } },
        include: {
          orgUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
    }

    res.status(200).json({ organisations });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving organisations", error });
  }
};

/**
 * Get organisation details
 */
export const getOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      include: { orgUsers: { include: { user: true, role: true } } },
    });

    if (!organisation) {
      res.status(404).json({ message: "Organisation not found" });
      return;
    }

    res.status(200).json({ organisation });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving organisation", error });
  }
};

/**
 * Update an organisation
 */
export const updateOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { name, description } = req.body;
    const userId = req?.user?.id;

    const organisation = await prisma.organisation.update({
      where: { id: organisationId },
      data: { name, description, updatedBy: userId },
    });

    res.status(200).json({ message: "Organisation updated successfully", organisation });
  } catch (error) {
    res.status(500).json({ message: "Error updating organisation", error });
  }
};

/**
 * Delete an organisation
 */
export const deleteOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    await prisma.organisation.delete({ where: { id: organisationId } });
    res.status(200).json({ message: "Organisation deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting organisation", error });
  }
};

/**
 * Add a user to an organisation
 */
export const addUserToOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { userId, roleId } = req.body;

    const existingUser = await prisma.orgUser.findFirst({
      where: {
        organisationId,
        userId,
      },
      select: { id: true },
    });

    if (existingUser) {
      res.status(400).json({ message: "User is already a member of this organisation" });
      return;
    }

    const newOrgUser = await prisma.orgUser.create({
      data: { organisationId, userId, roleId },
    });

    res.status(201).json({
      message: "User added to organisation successfully",
      orgUser: newOrgUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding user to organisation", error });
  }
};

/**
 * Remove a user from an organisation
 */
export const removeUserFromOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, userId } = req.params;

    const orgUser = await prisma.orgUser.findFirst({
      where: {
        organisationId,
        userId,
      },
    });
    if (!orgUser) {
      res.status(404).json({ message: "User is not a member of this organisation" });
      return;
    }

    await prisma.orgUser.delete({
      where: { id: orgUser.id },
    });

    res.status(200).json({ message: "User removed from organisation successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing user from organisation", error });
  }
};

/**
 * Get current user's permissions in an organisation
 */
export const getUserPermissionsInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const userId = req.user?.id;
    const userSystemRole = req.user?.systemRole;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Handle SUPER_USER - they have all actions
    if (userSystemRole === 'SUPER_USER') {
      const allActions = await prisma.action.findMany({
        select: { name: true }
      });
      
      res.status(200).json({
        actions: allActions.map(action => action.name),
        role: "SUPER_USER",
        systemRole: userSystemRole
      });
      return;
    }

    // Handle ORG_ADMIN - they have all actions except SUPER_USER_ONLY_ACTIONS
    if (userSystemRole === 'ORG_ADMIN') {
      const allActions = await prisma.action.findMany({
        select: { name: true }
      });
      
      // Filter out SUPER_USER_ONLY_ACTIONS
      const orgAdminActions = allActions
        .map(action => action.name)
        .filter(actionName => !SUPER_USER_ONLY_ACTIONS.includes(actionName));
      
      res.status(200).json({
        actions: orgAdminActions,
        role: "ORG_ADMIN",
        systemRole: userSystemRole
      });
      return;
    }

    // For regular users (ORG_USER), query their role-based permissions
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
      res.status(200).json({ 
        message: "User has no role in this organisation",
        actions: [],
        role: null,
        systemRole: userSystemRole
      });
      return;
    }

    // Extract all actions from the user's role
    const actions: string[] = [];
    
    orgUser.role.rolePermissions.forEach(rolePermission => {
      rolePermission.permission.permissionActions.forEach(permissionAction => {
        actions.push(permissionAction.action.name);
      });
    });

    // Remove duplicates
    const uniqueActions = [...new Set(actions)];

    res.status(200).json({
      actions: uniqueActions,
      role: orgUser.role.name,
      systemRole: userSystemRole
    });

  } catch (error) {
    console.error("Error fetching user permissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a role within an organisation
 */
export const createRoleInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { name, description } = req.body;
    const existingRole = await prisma.role.findFirst({
      where: { name, organisationId },
    });

    if (existingRole) {
      res.status(400).json({ message: "Role already exists in this organisation" });
      return;
    }

    const role = await prisma.role.create({
      data: { name, description, organisationId, createdBy: req?.user?.id ?? "unknown", updatedBy: req?.user?.id ?? "unknown" },
    });

    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Error creating role", error });
  }
};

/**
 * List roles within an organisation
 */
export const listRolesInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    const roles = await prisma.role.findMany({
      where: { organisationId },
    });

    res.status(200).json({ roles });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving roles", error });
  }
};

/**
 * Update a role within an organisation
 */
export const updateRoleInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, roleId } = req.params;
    const { name, description } = req.body;

    const role = await prisma.role.update({
      where: { id: roleId, organisationId },
      data: { name, description },
    });

    res.status(200).json({ message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error });
  }
};

/**
 * Delete a role within an organisation
 */
export const deleteRoleInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, roleId } = req.params;

    await prisma.role.delete({
      where: { id: roleId, organisationId },
    });

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting role", error });
  }
};

/**
 * Add permissions to a role within an organisation
 */
export const addPermissionsToRole = async (req: Request, res: Response) => {
  try {
    const { organisationId, roleId } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      res.status(400).json({ message: "Invalid permission IDs provided" });
      return;
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId, organisationId },
    });

    if (!role) {
      res.status(404).json({ message: "Role not found in organisation" });
      return;
    }

    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
        organisationId,
      })),
      skipDuplicates: true,
    });

    res.status(200).json({ message: "Permissions added to role successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding permissions to role", error });
  }
};

/**
 * Remove permissions from a role within an organisation
 */
export const removePermissionsFromRole = async (req: Request, res: Response) => {
  try {
    const { organisationId, roleId } = req.params;
    const { permissionIds } = req.body;

    if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
      res.status(400).json({ message: "Invalid permission IDs provided" });
      return;
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId, organisationId },
    });

    if (!role) {
      res.status(404).json({ message: "Role not found in organisation" });
      return;
    }

    await prisma.rolePermission.deleteMany({
      where: { roleId, permissionId: { in: permissionIds }, organisationId },
    });

    res.status(200).json({ message: "Permissions removed from role successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing permissions from role", error });
  }
};

/**
 * List permissions associated with a role within an organisation
 */
export const listPermissionsForRole = async (req: Request, res: Response) => {
  try {
    const { organisationId, roleId } = req.params;

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId, organisationId },
      select: { permissionId: true },
    });

    const permissionIds = rolePermissions.map((entry) => entry.permissionId);

    if (permissionIds.length === 0) {
      res.status(404).json({ message: "No permissions found for this role" });
      return;
    }

    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    res.status(200).json({ permissions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving permissions", error });
  }
};

/**
 * Create a project within an organisation
 */
export const createProjectInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { name, description } = req.body;

    const existingProject = await prisma.project.findFirst({
      where: { name, organisationId },
    });

    if (existingProject) {
      res.status(400).json({ message: "Project with this name already exists in the organisation" });
      return;
    }

    const project = await prisma.project.create({
      data: { name, description, organisationId, createdBy: req?.user?.id ?? "unknown ", updatedBy: req?.user?.id ?? "unknown" },
    });

    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

/**
 * List projects within an organisation
 */
export const listProjectsInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    const projects = await prisma.project.findMany({
      where: { organisationId },
    });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving projects", error });
  }
};

/**
 * Update a project within an organisation
 */
export const updateProjectInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;
    const { name, description } = req.body;

    const project = await prisma.project.update({
      where: { id: projectId, organisationId },
      data: { name, description, updatedBy: req?.user?.id ?? "unknown" },
    });

    res.status(200).json({ message: "Project updated successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
};

/**
 * Delete a project within an organisation
 */
export const deleteProjectInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;

    await prisma.project.delete({
      where: { id: projectId, organisationId },
    });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};

/**
 * Assign users to a project within an organisation
 */
export const assignUsersToProject = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;
    const { userIds, role } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: "Invalid user IDs provided" });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId, organisationId },
    });

    if (!project) {
      res.status(404).json({ message: "Project not found in organisation" });
      return;
    }

    await prisma.projectUser.createMany({
      data: userIds.map((userId) => ({
        orgUserId: userId,
        projectId,
        role: role,
      })),
      skipDuplicates: true,
    });

    res.status(200).json({ message: "Users assigned to project successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error assigning users to project", error });
  }
};




/**
 * List all organisations a user is part of
 */
export const listUserAllOrganisations = async (req: Request, res: Response) => {
  try {
    // const { userId } = req.params;  //! not needed, we get userId from req.user
    const userId = req.user?.id;
    // Step 1: Find all orgUser entries for this user
    const orgUserEntries = await prisma.orgUser.findMany({
      where: { userId },
      select: { organisationId: true },
    });

    const organisationIds = orgUserEntries.map((entry) => entry.organisationId);

    if (organisationIds.length === 0) {
      res.status(200).json({ organisations: [] });
      return;
    }

    // Step 2: Get all organizations where user is a member
    const organisations = await prisma.organisation.findMany({
      where: {
        id: { in: organisationIds },
      },
    });

    res.status(200).json({ organisations });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving organisations", error });
  }
};

/**
 * List all projects assigned to a user within an organisation
 */
export const listUserProjectsInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, userId } = req.params;

    const orgUserEntries = await prisma.orgUser.findMany({
      where: {
        userId,
        organisationId,
      },
      select: { id: true },
    });

    const orgUserIds = orgUserEntries.map((entry) => entry.id);

    if (orgUserIds.length === 0) {
      res.status(404).json({ message: "User not found in organisation" });
      return;
    }

    const projectUserEntries = await prisma.projectUser.findMany({
      where: { orgUserId: { in: orgUserIds } },
      select: { projectId: true },
    });

    const projectIds = projectUserEntries.map((entry) => entry.projectId);

    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        organisationId,
      },
    });

    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving projects", error });
  }
};

/**
 * Create a permission within an organisation
 */
export const createPermissionInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { name, description, createdBy, updatedBy } = req.body;

    const existingPermission = await prisma.permission.findFirst({
      where: { name, organisationId },
    });

    if (existingPermission) {
      res.status(400).json({ message: "Permission already exists in this organisation" });
      return;
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        organisationId,
        createdBy: req?.user?.id ?? "unknown",
        updatedBy: req?.user?.id ?? "unknown"
      },
    });

    res.status(201).json({ message: "Permission created successfully", permission });
  } catch (error) {
    res.status(500).json({ message: "Error creating permission", error });
  }
};

/**
 * List permissions within an organisation
 */
export const listPermissionsInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    const permissions = await prisma.permission.findMany({
      where: { organisationId },
    });

    res.status(200).json({ permissions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving permissions", error });
  }
};

/**
 * Update a permission within an organisation
 */
export const updatePermissionInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, permissionId } = req.params;
    const { name, description } = req.body;

    const permission = await prisma.permission.update({
      where: { id: permissionId, organisationId },
      data: { name, description, updatedBy: req?.user?.id ?? "unknown" },
    });

    res.status(200).json({ message: "Permission updated successfully", permission });
  } catch (error) {
    res.status(500).json({ message: "Error updating permission", error });
  }
};

/**
 * Delete a permission within an organisation
 */
export const deletePermissionInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, permissionId } = req.params;

    await prisma.permission.delete({
      where: { id: permissionId, organisationId },
    });

    res.status(200).json({ message: "Permission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting permission", error });
  }
};

/**
 * Add actions to a permission
 */
export const addActionToPermission = async (req: Request, res: Response) => {
  try {
    const { permissionId } = req.params;
    const { actionIds } = req.body;

    if (!Array.isArray(actionIds) || actionIds.length === 0) {
      res.status(400).json({ message: "Invalid action IDs provided" });
      return;
    }

    const existingActions = await prisma.permissionAction.findMany({
      where: { permissionId, actionId: { in: actionIds } },
      select: { actionId: true },
    });

    const existingActionIds = existingActions.map((action) => action.actionId);
    const newActionIds = actionIds.filter((actionId) => !existingActionIds.includes(actionId));

    if (newActionIds.length === 0) {
      res.status(400).json({ message: "All actions already exist for this permission" });
      return;
    }

    await prisma.permissionAction.createMany({
      data: newActionIds.map((actionId) => ({ permissionId, actionId })),
    });

    res.status(201).json({ message: "Actions added to permission successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding actions to permission", error });
  }
};

/**
 * Remove actions from a permission
 */
export const removeActionFromPermission = async (req: Request, res: Response) => {
  try {
    const { permissionId } = req.params;
    const { actionIds } = req.body;

    if (!Array.isArray(actionIds) || actionIds.length === 0) {
      res.status(400).json({ message: "Invalid action IDs provided" });
      return;
    }

    await prisma.permissionAction.deleteMany({
      where: { permissionId, actionId: { in: actionIds } },
    });

    res.status(200).json({ message: "Actions removed from permission successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing actions from permission", error });
  }
};

/**
 * Create an action within an organisation
 */
export const createActionInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { name, description, extras } = req.body;

    const existingAction = await prisma.action.findFirst({
      where: { name, organisationId },
    });

    if (existingAction) {
      res.status(400).json({ message: "Action already exists in this organisation" });
      return;
    }

    const action = await prisma.action.create({
      data: { name, description, extras, organisationId, createdBy: req?.user?.id ?? "unknown", updatedBy: req?.user?.id ?? "unknown" },
    });

    res.status(201).json({ message: "Action created successfully", action });
  } catch (error) {
    res.status(500).json({ message: "Error creating action", error });
  }
};

/**
 * ! List actions within an organisation as null for global actions
 */
export const listActionsInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const userSystemRole = req.user?.systemRole;

    // Handle privileged users (SUPER_USER and ORG_ADMIN) - they can see bypass actions
    if (userSystemRole === 'SUPER_USER' || userSystemRole === 'ORG_ADMIN') {
      // Privileged users can see all actions: organisation-specific and global (organisationId = null)
      const actions = await prisma.action.findMany({
        where: {
          OR: [
            { organisationId },
            { organisationId: null }
          ]
        },
        orderBy: { name: 'asc' },
      });

      res.status(200).json({ actions });
      return;
    }

    // For regular users (ORG_USER), return unauthorized
    res.status(403).json({ message: "Unauthorized: Insufficient permissions to view actions" });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving actions", error });
  }
};

/**
 * Update an action within an organisation
 */
export const updateActionInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, actionId } = req.params;
    const { name, description, extras } = req.body;

    const action = await prisma.action.update({
      where: { id: actionId, organisationId },
      data: { name, description, extras, updatedBy: req?.user?.id ?? "unknown" },
    });

    res.status(200).json({ message: "Action updated successfully", action });
  } catch (error) {
    res.status(500).json({ message: "Error updating action", error });
  }
};

/**
 * Delete an action within an organisation
 */
export const deleteActionInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId, actionId } = req.params;

    await prisma.action.delete({
      where: { id: actionId, organisationId },
    });

    res.status(200).json({ message: "Action deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting action", error });
  }
};

/**
 * List actions associated with a permission
 */
export const listActionsForPermission = async (req: Request, res: Response) => {
  try {
    const { organisationId, permissionId } = req.params;

    const permissionActions = await prisma.permissionAction.findMany({
      where: { permissionId },
      select: { actionId: true },
    });

    const actionIds = permissionActions.map((entry) => entry.actionId);

    if (actionIds.length === 0) {
      res.status(404).json({ message: "No actions found for this permission" });
      return;
    }

    const actions = await prisma.action.findMany({
      where: {
        id: { in: actionIds },
      },
    });

    res.status(200).json({ actions });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving actions", error });
  }
};

/**
 * Create an organisation user
 */
export const createOrganisationUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name, roleIds, extras } = req.body;
    const { organisationId } = req.params;

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      res.status(400).json({ message: "Invalid role IDs provided" });
      return;
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    let user;

    if (existingUser) {
      // User exists, check if they're already in this organization
      const existingOrgUser = await prisma.orgUser.findFirst({
        where: {
          organisationId: organisationId,
          userId: existingUser.id,
        },
      });

      if (existingOrgUser) {
        res.status(400).json({ message: "User is already a member of this organisation" });
        return;
      }

      // User exists but not in this org, use existing user
      user = existingUser;

      // Update user's extras if provided
      if (extras) {
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            extras,
            updatedBy: req?.user?.id ?? "unknown"
          },
        });
      }
    } else {
      // User doesn't exist, create new user
      if (!password || !name) {
        res.status(400).json({ message: "Password and name are required for new users" });
        return;
      }

      // Hash the password before storing
      const hashedPassword = await hashPassword(password);

      user = await prisma.user.create({
        data: { 
          email, 
          password: hashedPassword, 
          name,
          extras: extras || {},
          createdBy: req?.user?.id ?? "unknown" 
        },
      });

      // Create UserToken for the new user
      await prisma.userToken.create({
        data: {
          userId: user.id,
          isVerified: false, // Regular users start unverified
        },
      });
    }

    // Add user to organization with the specified roles
    const orgUsers = await prisma.orgUser.createMany({
      data: roleIds.map((roleId) => ({
        organisationId,
        userId: user.id,
        roleId,
      })),
    });

    res.status(201).json({
      message: existingUser 
        ? "Existing user added to organisation successfully"
        : "User created and added to organisation successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        extras: user.extras,
      },
      orgUsers,
      isNewUser: !existingUser,
    });
  } catch (error) {
    console.error("Error creating user or adding to organisation:", error);
    res.status(500).json({ error: "Error creating user or adding to organisation", details: error });
  }
};

/**
 * List all organisation users and their roles
 */
export const listOrganisationUsersAndRoles = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    const orgUsers = await prisma.orgUser.findMany({
      where: { organisationId },
      select: { userId: true, roleId: true },
    });

    if (orgUsers.length === 0) {
      res.status(404).json({ message: "No users found in this organisation" });
      return;
    }

    const userIds = [...new Set(orgUsers.map((entry) => entry.userId))];
    const roleIds = [...new Set(orgUsers.map((entry) => entry.roleId))];

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });

    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds.filter((roleId): roleId is string => roleId !== null) } },
    });

    const userRoles = orgUsers.map((orgUser) => {
      const user = users.find((u) => u.id === orgUser.userId);
      const role = roles.find((r) => r.id === orgUser.roleId);
      return { user, role };
    });

    res.status(200).json({ userRoles });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving organisation users and roles", error });
  }
};

/**
 * Delete a user's role in an organisation
 */
export const deleteUserRoleInOrganisation = async (req: Request, res: Response) => {
  try {
    const { userId, organisationId, roleId } = req.params;

    const orgUser = await prisma.orgUser.findFirst({
      where: { userId, organisationId, roleId },
    });

    if (!orgUser) {
      res.status(404).json({ message: "User role not found in organisation" });
      return;
    }

    await prisma.orgUser.delete({
      where: { id: orgUser.id },
    });

    res.status(200).json({ message: "User role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user role in organisation", error });
  }
};

/**
 * Delete a user and their roles in an organisation
 */
export const deleteUserAndRolesInOrganisation = async (req: Request, res: Response) => {
  try {
    const { userId, organisationId } = req.params;

    const orgUser = await prisma.orgUser.findFirst({
      where: { userId, organisationId },
    });

    if (!orgUser) {
      res.status(404).json({ message: "User not found in organisation" });
      return;
    }

    await prisma.orgUser.deleteMany({
      where: { userId, organisationId },
    });

    res.status(200).json({ message: "User and their roles deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user and their roles in organisation", error });
  }
};

/**
 * Update organisation user details and role
 */
export const updateOrganisationUser = async (req: Request, res: Response) => {
  try {
    const { userId, organisationId } = req.params;
    const { name, email, roleIds, extras } = req.body;

    if (!Array.isArray(roleIds) || roleIds.length === 0) {
      res.status(400).json({ message: "Invalid role IDs provided" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Prepare update data
    const updateData: { name?: string; email?: string; extras?: any } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (extras !== undefined) updateData.extras = extras;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const existingOrgUsers = await prisma.orgUser.findMany({
      where: { organisationId, userId },
    });

    const existingRoleIds = existingOrgUsers.map((orgUser) => orgUser.roleId);

    const newRoleIds = roleIds.filter((roleId) => !existingRoleIds.includes(roleId));
    if (newRoleIds.length > 0) {
      await prisma.orgUser.createMany({
        data: newRoleIds.map((roleId) => ({
          organisationId,
          userId,
          roleId,
        })),
      });
    }

    const rolesToRemove = existingOrgUsers.filter(
      (orgUser) => !roleIds.includes(orgUser.roleId)
    );
    if (rolesToRemove.length > 0) {
      await prisma.orgUser.deleteMany({
        where: {
          id: { in: rolesToRemove.map((orgUser) => orgUser.id) },
        },
      });
    }

    res.status(200).json({
      message: "User details and roles updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating user details", error });
  }
};

/**
 * Get a user assigned to a project within an organisation
 */
export const getUserInProject = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId, userId } = req.params;

  const user = await prisma.projectUser.findFirst({
    where: { projectId, id: userId },
    select: {
      id: true,
      role: true, // Include the role field from ProjectUser
      orgUser: {
        include: {
          user: {
            include: {
              alternateContacts: {
                include: {
                  contact: {
                    include: {
                      orgUsers: {
                        // or orgUser if it's a 1-1, but usually it's orgUsers (array)
                        where: { organisationId }, // filter for the current org
                        select: { roleId: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

    if (!user) {
      res.status(404).json({ message: "User not found in project" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user", error });
  }
};

/**
 * List all users assigned to a project within an organisation
 */

export const listUsersInProject = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;

    const users = await prisma.projectUser.findMany({
      where: { projectId },
      select: {
        id: true,
        role: true, // Include the role field from ProjectUser
        orgUser: {
          include: {
            user: true, // Removes the nested include for alternateContact
          },
        },
      },
    });


    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error });
  }
};


/**
 * Add a user to a project within an organisation
 * 
 * WARNING: This function creates users with a default password. 
 * In a production environment, consider implementing:
 * 1. Password generation and email notification
 * 2. Invitation-based user creation
 * 3. User creation in pending state with email verification
 */
export const addUserToProject = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;
    const { email, name, extras, roleId, roleIds } = req.body;
    const userId = req?.user?.id;

    // Handle both single roleId and multiple roleIds for backward compatibility
    const projectRoles = roleIds && Array.isArray(roleIds) && roleIds.length > 0 
      ? roleIds 
      : (roleId ? [roleId] : []);

    // Validate that at least one role is provided
    if (projectRoles.length === 0) {
      res.status(400).json({ message: "At least one role must be provided" });
      return;
    }

    // Use the first role for OrgUser (organization level role)
    const orgRoleId = projectRoles[0];

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    let user;
    let newOrgUser;
    let isNewUser = false;

    if (existingUser) {
      // User exists, check if they're in this organization
      const existingOrgUser = await prisma.orgUser.findFirst({
        where: {
          organisationId,
          userId: existingUser.id,
        },
      });

      if (existingOrgUser) {
        // User is already in the organization, use existing orgUser
        newOrgUser = existingOrgUser;
        user = existingUser;
      } else {
        // User exists but not in this organization, add them to org
        newOrgUser = await prisma.orgUser.create({
          data: { organisationId, userId: existingUser.id, roleId: orgRoleId },
        });
        user = existingUser;
      }
    } else {
      // User doesn't exist, create new user
      isNewUser = true;
      
      // Hash the default password - NOTE: In production, implement proper password generation/invitation flow
      const defaultPassword = "defaultPassword123";
      const hashedPassword = await hashPassword(defaultPassword);

      user = await prisma.user.create({
        data: {
          email,
          name,
          extras,
          password: hashedPassword,
          systemRole: "ORG_USER",
          createdBy: userId ?? "unknown",
          updatedBy: userId,
        },
      });

      // Create UserToken for the new user
      await prisma.userToken.create({
        data: {
          userId: user.id,
          isVerified: false, // User should verify their account
        },
      });

      // Create orgUser entry
      newOrgUser = await prisma.orgUser.create({
        data: { organisationId, userId: user.id, roleId: orgRoleId },
      });

    // await prisma.alternateContact.create({
    //   data: {
    //     userId: user.id,
    //     contactId: contactNo,
    //     relationship,
    //   },
    // });

    }

    // Check if user is already assigned to this project
    const existingProjectUser = await prisma.projectUser.findFirst({
      where: {
        orgUserId: newOrgUser.id,
        projectId,
      },
    });

    if (existingProjectUser) {
      res.status(200).json({ 
        message: "User is already assigned to this project", 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        projectUser: existingProjectUser,
      });
      return;
    }

    // Create project user assignment with multiple roles
    const projectUser = await prisma.projectUser.create({
      data: {
        orgUserId: newOrgUser.id,
        projectId,
        role: projectRoles, // Store array of roles in JSON field
      },
    });

    res.status(201).json({ 
      message: isNewUser 
        ? "User created and added to project successfully" 
        : "Existing user added to project successfully", 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      projectUser,
      isNewUser,
      note: isNewUser ? "User created with default password. In production, implement proper invitation flow." : undefined
    });
  } catch (error) {
    console.error("Error adding user to project:", error);
    res.status(500).json({ message: "Error adding user to project", error });
  }
};

/**
 * Update a user's details in a project within an organisation
 */
export const updateProjectUser = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId, Id } = req.params;
    const { name, email, extras, roleId, roleIds } = req.body;

    // Check if any updateable fields are provided
    if (!name && !email && !extras && !roleId && (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0)) {
      res.status(400).json({ message: "No valid fields provided for update" });
      return;
    }

    // Handle both single roleId and multiple roleIds for backward compatibility
    const projectRoles = roleIds && Array.isArray(roleIds) && roleIds.length > 0 
      ? roleIds 
      : (roleId ? [roleId] : undefined);

    // First update the project user with roles only (not extras)
    const updateData: any = {};

    if (projectRoles) {
      updateData.role = projectRoles; // Update roles if provided
    }

    const updatedProjectUser = await prisma.projectUser.update({
      where: { id: Id, projectId },
      data: updateData,
      include: { orgUser: true },
    });

    // Get the orgUser to find the actual user
    const orgUserId = updatedProjectUser.orgUserId;
    const orgUser = await prisma.orgUser.findUnique({
      where: { id: orgUserId },
    });

    if (!orgUser) {
      res.status(404).json({ message: "Organization user not found" });
      return;
    }

    const userId = orgUser.userId;

    // Update the user's basic info and extras
    await prisma.user.update({
      where: { id: userId },
      data: { 
        name, 
        email,
        extras, // Update the extras in the user table
        updatedAt: new Date(),
        updatedBy: req?.user?.id ?? "unknown"
      },
    });

    // Update the orgUser role if roleIds or roleId is provided
    if (projectRoles && projectRoles.length > 0) {
      // Use the first role for the organization role
      await prisma.orgUser.update({
        where: { id: orgUserId },
        data: { roleId: projectRoles[0] }
      });
    }

    res.status(200).json({ 
      message: "User updated successfully",
      user: {
        id: userId,
        name,
        email,
        extras
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error });
  }
};


/**
 * Remove a user from a project within an organisation
 */
export const removeProjectUser = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId, Id } = req.params;

    // Step 1: Fetch orgUserId from the projectUser using projectId and Id
    const projectUser = await prisma.projectUser.findUnique({
      where: { projectId, id: Id },
      select: { orgUserId: true },
    });

    if (!projectUser) {
      res.status(404).json({ message: "Project user not found" });
      return;
    }

    const orgUserId = projectUser.orgUserId;

    // Step 2: Delete the projectUser entry
    await prisma.projectUser.delete({
      where: { projectId, id: Id },
    });

    // Step 3: Fetch userId from the orgUser table using orgUserId
    const orgUser = await prisma.orgUser.findUnique({
      where: { id: orgUserId },
      select: { userId: true },
    });
    await prisma.orgUser.delete({
      where: { id: orgUserId },
    });


    if (orgUser) {
      const userId = orgUser.userId;
      const aCnct = await prisma.alternateContact.findMany({
        where: { userId: userId },
        select: { id: true },
      });
      console.log("aCnct", aCnct);

      // Step 5: Delete the entries from the alternateContact table
      await Promise.all(aCnct.map(contact =>
        prisma.alternateContact.delete({
          where: { id: contact.id },
        })
      ));

      // Step 4: Delete the user from the user table
      await prisma.user.delete({
        where: { id: userId },
      });


    }

    res.status(200).json({ message: "User removed from project and related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing user from project", error });
  }
};

/**
 * Unassign a user from a project (only removes project assignment, keeps user in org)
 */
export const unassignUserFromProject = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId, userId } = req.params;

    // Find the orgUser for this user in this organization
    const orgUser = await prisma.orgUser.findFirst({
      where: {
        organisationId,
        userId,
      },
    });

    if (!orgUser) {
      res.status(404).json({ message: "User not found in this organisation" });
      return;
    }

    // Find the project user assignment
    const projectUser = await prisma.projectUser.findFirst({
      where: {
        orgUserId: orgUser.id,
        projectId,
      },
    });

    if (!projectUser) {
      res.status(404).json({ message: "User is not assigned to this project" });
      return;
    }

    // Delete only the project user assignment (not the user or orgUser)
    await prisma.projectUser.delete({
      where: { id: projectUser.id },
    });

    res.status(200).json({ 
      message: "User unassigned from project successfully",
      removedAssignment: {
        userId,
        projectId,
        organisationId,
      }
    });
  } catch (error) {
    console.error("Error unassigning user from project:", error);
    res.status(500).json({ message: "Error unassigning user from project", error });
  }
};

/**
 * Create an assessment schedule with multiple recurring assessments
 */
export const createAssessment = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { 
      groupIds, // Multiple groups support
      questionnaireId, 
      dateRanges,
      title, 
      description 
    } = req.body;
    const userId = req?.user?.id;

    // Validate required fields
    if (!Array.isArray(groupIds) || groupIds.length === 0 || !questionnaireId || !Array.isArray(dateRanges) || dateRanges.length === 0) {
      res.status(400).json({ 
        message: "Group IDs (array), Questionnaire ID, and at least one date range are required" 
      });
      return;
    }

    // Validate that all groups exist
    const existingGroups = await prisma.assessmentGroup.findMany({
      where: { 
        id: { in: groupIds },
        projectId 
      },
      select: { id: true, name: true }
    });

    if (existingGroups.length !== groupIds.length) {
      const foundGroupIds = existingGroups.map(g => g.id);
      const missingGroupIds = groupIds.filter((id: string) => !foundGroupIds.includes(id));
      res.status(400).json({ 
        message: `Groups not found: ${missingGroupIds.join(', ')}` 
      });
      return;
    }

    // Get questionnaire details to check minSpanDays
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: questionnaireId },
      select: { id: true, slug: true, minSpanDays: true, title: true }
    });

    if (!questionnaire) {
      res.status(404).json({ message: "Questionnaire not found" });
      return;
    }

    // Validate each date range
    for (let i = 0; i < dateRanges.length; i++) {
      const range = dateRanges[i];
      
      if (!range || !range.startDate) {
        res.status(400).json({ 
          message: `startDate is required for date range at index ${i}` 
        });
        return;
      }
      
      // If endDate is provided, validate it
      if (range.endDate) {
        const startDate = new Date(range.startDate);
        const endDate = new Date(range.endDate);
        
        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          res.status(400).json({ 
            message: `Invalid date format for date range at index ${i}` 
          });
          return;
        }
        
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff < questionnaire.minSpanDays) {
          res.status(400).json({ 
            message: `End date must be at least ${questionnaire.minSpanDays} days after start date for range at index ${i}` 
          });
          return;
        }
      } else {
        // Check if startDate is valid when endDate is not provided
        const startDate = new Date(range.startDate);
        if (isNaN(startDate.getTime())) {
          res.status(400).json({ 
            message: `Invalid startDate format for date range at index ${i}` 
          });
          return;
        }
      }
    }

    // Create assessment schedule
    const assessmentSchedule = await prisma.assessmentSchedule.create({
      data: {
        questionnaireId,
        projectId,
        title: title || `${questionnaire.title} Schedule`,
        description: description || `Assessment schedule for ${questionnaire.title}`,
        createdBy: userId ?? "Unknown",
        updatedBy: userId ?? "Unknown",
      },
    });

    // Create assessment schedule assignments (link schedule to multiple groups)
    const scheduleAssignments = await prisma.assessmentScheduleAssignment.createMany({
      data: groupIds.map((groupId: string) => ({
        assessmentScheduleId: assessmentSchedule.id,
        userGroupId: groupId,
      })),
    });

    // Create multiple assessment instances based on date ranges
    const assessmentInstances = [];
    for (const range of dateRanges) {
      const startDate = new Date(range.startDate);
      const endDate = range.endDate 
        ? new Date(range.endDate)
        : new Date(startDate.getTime() + (questionnaire.minSpanDays * 24 * 60 * 60 * 1000));
      
      const assessment = await prisma.assessment.create({
        data: {
          assessmentScheduleId: assessmentSchedule.id,
          startDate: startDate,
          endDate: endDate,
          projectId,
        },
      });
      
      assessmentInstances.push(assessment);
    }

    res.status(201).json({ 
      message: "Assessment schedule created successfully", 
      assessmentSchedule,
      assessmentInstances: assessmentInstances.length,
      details: {
        groupIds: groupIds,
        questionnaireId,
        instancesCreated: assessmentInstances.length,
        groupsAssigned: scheduleAssignments.count
      }
    });
  } catch (error) {
    console.error("Error creating assessment schedule:", error);
    res.status(500).json({ message: "Error creating assessment schedule", error });
  }
};

/**
 * List all assessment schedules and their instances within a project with role-based filtering
 */
export const listAssessments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { organisationId } = req.params;
    const userId = req.user?.id;
    const systemRole = req.user?.systemRole;

    if (!userId) {
      res.status(401).json({ message: "User ID is required" });
      return;
    }

    let whereClause: any = { projectId };

    // Role-based access control
    if (systemRole === "SUPER_USER" || systemRole === "ORG_ADMIN") {
      // Super User/Org Admin: Can see all assessments in the organization
      // No additional filtering needed
    } else {
      // For regular users, check their specific permissions
      try {
        // Check user's permissions in the organization
        const userActions = await getUserActions(userId, organisationId as string);
        
        const requiredActions = ["assessments.delete", "assessments.list", "assessments.read", "assessments.update"];
        const hasAllPermissions = requiredActions.every(action => userActions.includes(action));

        if (hasAllPermissions) {
          // User has all required permissions, show all assessments
          // No additional filtering needed
        } else {
          // Check if user is a manager of any groups
          const managedGroups = await prisma.assessmentGroup.findMany({
            where: {
              managerId: userId,
              project: { organisationId: organisationId as string }
            }
          });

          if (managedGroups.length > 0) {
            // User is a group manager, show assessments for their managed groups only
            const managedGroupIds = managedGroups.map(group => group.id);
            
            whereClause.scheduleAssignments = {
              some: {
                userGroupId: { in: managedGroupIds }
              }
            };
          } else {
            // Regular users are not allowed to access assessments
            res.status(403).json({ message: "Access denied: Only managers and above can view assessments" });
            return;
          }
        }
      } catch (permissionError) {
        console.error("Error checking user permissions:", permissionError);
        res.status(500).json({ 
          message: "Error checking user permissions", 
          error: permissionError 
        });
        return;
      }
    }

    // Get assessment schedules based on role-based filtering
    const assessmentSchedules = await prisma.assessmentSchedule.findMany({
      where: whereClause,
      include: {
        questionnaire: {
          select: { id: true, slug: true, title: true, minSpanDays: true }
        },
        scheduleAssignments: {
          include: {
            userGroup: {
              select: { id: true, name: true, managerId: true }
            }
          }
        },
        assessments: {
          orderBy: { startDate: 'asc' },
          include: {
            assignments: {
              select: { id: true, status: true, userId: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format the response to include schedule and instance information
    const formattedSchedules = assessmentSchedules.map(schedule => ({
      id: schedule.id,
      title: schedule.title,
      description: schedule.description,
      questionnaire: schedule.questionnaire,
      groupIds: schedule.scheduleAssignments.map(sa => sa.userGroup.id), // Multiple groups
      groups: schedule.scheduleAssignments.map(sa => ({
        id: sa.userGroup.id,
        name: sa.userGroup.name
      })),
      assessmentInstances: schedule.assessments.map(assessment => ({
        id: assessment.id,
        startDate: assessment.startDate,
        endDate: assessment.endDate,
      })),
      totalInstances: schedule.assessments.length,
      createdAt: schedule.createdAt,
      updatedAt: schedule.updatedAt
    }));

    res.status(200).json({ 
      assessmentSchedules: formattedSchedules
    });
  } catch (error) {
    console.error("Error retrieving assessment schedules:", error);
    res.status(500).json({ message: "Error retrieving assessment schedules", error });
  }
};

/**
 * Get an assessment schedule by ID or assessment instance by ID
 */
export const getAssessment = async (req: Request, res: Response) => {
  try {
    const { projectId, assessmentId } = req.params;

    // First try to find it as an assessment schedule
    const assessmentSchedule = await prisma.assessmentSchedule.findFirst({
      where: { id: assessmentId, projectId },
      include: {
        questionnaire: {
          select: { id: true, slug: true, title: true, questionnaire: true, minSpanDays: true }
        },
        scheduleAssignments: {
          include: {
            userGroup: {
              select: { id: true, name: true, managerId: true }
            }
          }
        },
        assessments: {
          orderBy: { startDate: 'asc' },
          include: {
            assignments: {
              select: { id: true, status: true, userId: true, accessCode: true }
            }
          }
        }
      }
    });

    if (assessmentSchedule) {
      res.status(200).json({ 
        assessmentSchedule,
        totalInstances: assessmentSchedule.assessments.length
      });
      return;
    }

    res.status(404).json({ message: "Assessment schedule not found" });
  } catch (error) {
    console.error("Error retrieving assessment:", error);
    res.status(500).json({ message: "Error retrieving assessment", error });
  }
};

/**
 * Update an assessment schedule or assessment instance
 * - Can update schedule details (title, description, questionnaire, group assignments)
 * - Can update assessment instance dates (start/end dates) even if assignments exist
 * - Prevents deletion of assessment instances that have assignments
 * - Allows creation of new assessment instances within a schedule
 */
export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const { projectId, assessmentId } = req.params;
    const { organisationId } = req.body;
    const userId = req?.user?.id;

    // First try to update as assessment schedule
    const existingSchedule = await prisma.assessmentSchedule.findFirst({
      where: { id: assessmentId, projectId },
    });

    if (existingSchedule) {
      const { 
        title, 
        description, 
        questionnaireId, 
        groupIds, // Multiple groups
        dateRanges,
        recurrenceType,
        recurrenceSettings
      } = req.body;

      // If questionnaireId is provided, validate it exists and check for existing assignments
      if (questionnaireId) {
        const questionnaire = await prisma.questionnaire.findFirst({
          where: { id: questionnaireId },
        });

        if (!questionnaire) {
          res.status(404).json({ message: "Questionnaire not found" });
          return;
        }

        // Check if questionnaire is being changed
        if (questionnaireId !== existingSchedule.questionnaireId) {
          // Check if there are any existing assessment assignments for this schedule
          const existingAssignments = await prisma.assessmentAssignment.findFirst({
            where: {
              assessment: {
                assessmentScheduleId: assessmentId
              }
            }
          });

          if (existingAssignments) {
            res.status(400).json({ 
              message: "Cannot change questionnaire: Assessment assignments already exist for this schedule. Please delete all assignments first." 
            });
            return;
          }
        }
      }

      // Validate dateRanges if provided
      if (dateRanges) {
        if (!Array.isArray(dateRanges) || dateRanges.length === 0) {
          res.status(400).json({ 
            message: "dateRanges must be a non-empty array" 
          });
          return;
        }

        // Get questionnaire for validation
        const questionnaireForValidation = questionnaireId ? 
          await prisma.questionnaire.findFirst({
            where: { id: questionnaireId },
          }) :
          await prisma.questionnaire.findFirst({
            where: { id: existingSchedule.questionnaireId },
          });

        for (let i = 0; i < dateRanges.length; i++) {
          const range = dateRanges[i];
          if (!range.startDate) {
            res.status(400).json({ 
              message: `dateRange ${i + 1}: startDate is required` 
            });
            return;
          }

          const startDate = new Date(range.startDate);
          if (isNaN(startDate.getTime())) {
            res.status(400).json({ 
              message: `dateRange ${i + 1}: Invalid startDate format` 
            });
            return;
          }

          let endDate = range.endDate ? new Date(range.endDate) : null;
          
          if (!endDate && questionnaireForValidation?.minSpanDays) {
            // Auto-calculate end date
            endDate = new Date(startDate.getTime() + (24 * 60 * 60 * 1000 * questionnaireForValidation.minSpanDays));
            range.endDate = endDate.toISOString().split('T')[0];
          }

          if (endDate && isNaN(endDate.getTime())) {
            res.status(400).json({ 
              message: `dateRange ${i + 1}: Invalid endDate format` 
            });
            return;
          }

          if (endDate && endDate <= startDate) {
            res.status(400).json({ 
              message: `dateRange ${i + 1}: endDate must be after startDate` 
            });
            return;
          }

          // Validate minimum span days if questionnaire has requirement
          if (endDate && questionnaireForValidation?.minSpanDays) {
            const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
            if (daysDiff < questionnaireForValidation.minSpanDays) {
              res.status(400).json({ 
                message: `dateRange ${i + 1}: Assessment must span at least ${questionnaireForValidation.minSpanDays} days. Current span: ${daysDiff} days` 
              });
              return;
            }
          }
        }
      }

      const updatedSchedule = await prisma.assessmentSchedule.update({
        where: { id: assessmentId },
        data: { 
          title, 
          description, 
          questionnaireId,
          updatedBy: userId ?? "Unknown"
        },
      });

      // If groupIds provided, update schedule assignments
      if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
        // Validate that all groups exist
        const existingGroups = await prisma.assessmentGroup.findMany({
          where: { 
            id: { in: groupIds },
            projectId 
          },
          select: { id: true, name: true }
        });

        if (existingGroups.length !== groupIds.length) {
          const foundGroupIds = existingGroups.map(g => g.id);
          const missingGroupIds = groupIds.filter((id: string) => !foundGroupIds.includes(id));
          res.status(400).json({ 
            message: `Groups not found: ${missingGroupIds.join(', ')}` 
          });
          return;
        }

        // Get current group assignments for this schedule
        const currentAssignments = await prisma.assessmentScheduleAssignment.findMany({
          where: { assessmentScheduleId: assessmentId },
          select: { userGroupId: true }
        });
        
        const currentGroupIds = currentAssignments.map(a => a.userGroupId);
        const groupsToRemove = currentGroupIds.filter(groupId => !groupIds.includes(groupId));

        // Check if any of the groups being removed have existing student assignments
        if (groupsToRemove.length > 0) {
          const assignmentsInRemovedGroups = await prisma.assessmentAssignment.findMany({
            where: {
              assessment: {
                assessmentScheduleId: assessmentId
              },
              user: {
                members: {
                  some: {
                    groupId: { in: groupsToRemove }
                  }
                }
              }
            },
            include: {
              user: {
                include: {
                  members: {
                    where: {
                      groupId: { in: groupsToRemove }
                    },
                    include: {
                      group: {
                        select: { id: true, name: true }
                      }
                    }
                  }
                }
              }
            }
          });

          if (assignmentsInRemovedGroups.length > 0) {
            const affectedGroups = await prisma.assessmentGroup.findMany({
              where: { id: { in: groupsToRemove } },
              select: { id: true, name: true }
            });

            const groupNames = affectedGroups.map(g => g.name).join(', ');
            
            res.status(400).json({ 
              message: `Cannot remove groups with existing student assignments. Groups with assignments: ${groupNames}. Please remove all assignments for these groups first.`,
              code: "GROUPS_HAVE_ASSIGNMENTS",
              affectedGroups: affectedGroups,
              assignmentCount: assignmentsInRemovedGroups.length
            });
            return;
          }
        }

        // Delete existing assignments
        await prisma.assessmentScheduleAssignment.deleteMany({
          where: { assessmentScheduleId: assessmentId }
        });

        // Create new assignments (multiple groups)
        await prisma.assessmentScheduleAssignment.createMany({
          data: groupIds.map((groupId: string) => ({
            assessmentScheduleId: assessmentId,
            userGroupId: groupId,
          }))
        });
      }

      // If dateRanges provided, update assessment instances
      if (dateRanges) {
        // Get existing assessment instances for this schedule
        const existingAssessments = await prisma.assessment.findMany({
          where: { assessmentScheduleId: assessmentId },
          include: {
            assignments: {
              select: { id: true, status: true }
            }
          }
        });

        const existingAssessmentIds = existingAssessments.map(a => a.id);
        const providedInstanceIds = dateRanges
          .filter((range: any) => range.instanceId)
          .map((range: any) => range.instanceId);

        // Find assessments to delete (not in provided list)
        const assessmentsToDelete = existingAssessments.filter(
          assessment => !providedInstanceIds.includes(assessment.id)
        );

        // Only check for assignments when trying to delete assessments
        // Allow updating dates even if assignments exist
        const assessmentsWithAssignments = assessmentsToDelete.filter(
          assessment => assessment.assignments.length > 0
        );

        if (assessmentsWithAssignments.length > 0) {
          const assessmentTitles = assessmentsWithAssignments.map(a => 
            `${a.startDate.toISOString().split('T')[0]} to ${a.endDate.toISOString().split('T')[0]}`
          ).join(', ');
          
          res.status(400).json({ 
            message: `Cannot delete assessment instances with existing assignments. Instances with assignments: ${assessmentTitles}. You can still update their dates.`,
            conflictingAssessments: assessmentsWithAssignments.map(a => ({
              id: a.id,
              startDate: a.startDate,
              endDate: a.endDate,
              assignmentCount: a.assignments.length
            }))
          });
          return;
        }

        // Delete assessments without assignments
        if (assessmentsToDelete.length > 0) {
          await prisma.assessment.deleteMany({
            where: {
              id: { in: assessmentsToDelete.map(a => a.id) }
            }
          });
        }

        // Process each date range
        for (const range of dateRanges) {
          const startDate = new Date(range.startDate);
          const endDate = new Date(range.endDate);

          if (range.instanceId) {
            // Update existing assessment instance
            const existingAssessment = existingAssessments.find(a => a.id === range.instanceId);
            if (existingAssessment) {
              await prisma.assessment.update({
                where: { id: range.instanceId },
                data: {
                  startDate,
                  endDate
                }
              });
            } else {
              res.status(400).json({ 
                message: `Assessment instance with ID ${range.instanceId} not found` 
              });
              return;
            }
          } else {
            // Create new assessment instance
            await prisma.assessment.create({
              data: {
                assessmentScheduleId: assessmentId,
                startDate,
                endDate,
                projectId,
              },
            });
          }
        }
      }

      res.status(200).json({ 
        message: "Assessment schedule updated successfully", 
        assessmentSchedule: updatedSchedule 
      });
      return;
    }

    // If not a schedule, check if it's an assessment instance
    const existingInstance = await prisma.assessment.findFirst({
      where: { id: assessmentId, projectId },
      include: {
        assessmentSchedule: {
          include: {
            questionnaire: {
              select: { id: true, slug: true, title: true, minSpanDays: true }
            }
          }
        },
        assignments: {
          select: { id: true, status: true, userId: true }
        }
      }
    });

    if (existingInstance) {
      // For assessment instances, we can update dates even if assignments exist
      const { dateRange } = req.body;
      
      if (!dateRange || !dateRange.startDate) {
        res.status(400).json({ 
          message: "For assessment instances, dateRange with startDate is required" 
        });
        return;
      }

      const startDate = new Date(dateRange.startDate);
      const endDate = dateRange.endDate 
        ? new Date(dateRange.endDate) 
        : new Date(startDate.getTime() + (24 * 60 * 60 * 1000 * 15)); // Default 15 days if no endDate

      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(400).json({ 
          message: "Invalid date format in dateRange" 
        });
        return;
      }

      if (endDate <= startDate) {
        res.status(400).json({ 
          message: "endDate must be after startDate" 
        });
        return;
      }

      // Validate minimum span days if questionnaire has requirement
      const questionnaire = existingInstance.assessmentSchedule.questionnaire;
      if (questionnaire?.minSpanDays) {
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
        if (daysDiff < questionnaire.minSpanDays) {
          res.status(400).json({ 
            message: `Assessment must span at least ${questionnaire.minSpanDays} days. Current span: ${daysDiff} days` 
          });
          return;
        }
      }

      const updatedInstance = await prisma.assessment.update({
        where: { id: assessmentId },
        data: { 
          startDate, 
          endDate 
        },
      });

      res.status(200).json({ 
        message: `Assessment instance updated successfully${existingInstance.assignments.length > 0 ? ' (assignments preserved)' : ''}`, 
        assessment: updatedInstance,
        assignmentCount: existingInstance.assignments.length
      });
      return;
    }

    res.status(404).json({ message: "Assessment or assessment schedule not found" });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({ message: "Error updating assessment", error });
  }
};

/**
 * Delete an assessment schedule or assessment instance
 */
export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { projectId, assessmentId } = req.params;

    // First try to delete as assessment schedule
    const existingSchedule = await prisma.assessmentSchedule.findFirst({
      where: { id: assessmentId, projectId },
    });

    if (existingSchedule) {
      // Check if any assignments exist for this schedule's assessments
      const existingAssignments = await prisma.assessmentAssignment.count({
        where: {
          assessment: {
            assessmentScheduleId: assessmentId
          }
        }
      });

      if (existingAssignments > 0) {
        res.status(400).json({ 
          message: "Cannot delete assessment schedule - assignments exist for this assessment. Please remove all assignments first.",
          code: "ASSIGNMENTS_EXIST"
        });
        return ;
      }

      // Delete all related data in correct order to avoid foreign key constraints
      
      // 1. Delete all assessment instances (no assignments exist at this point)
      await prisma.assessment.deleteMany({
        where: { assessmentScheduleId: assessmentId }
      });

      // 2. Delete schedule assignments
      await prisma.assessmentScheduleAssignment.deleteMany({
        where: { assessmentScheduleId: assessmentId }
      });

      // 3. Finally delete the schedule itself
      await prisma.assessmentSchedule.delete({
        where: { id: assessmentId }
      });

      res.status(200).json({ 
        message: "Assessment schedule and all related instances deleted successfully" 
      });
      return;
    }

    // If not a schedule, try to delete as assessment instance
    const existingInstance = await prisma.assessment.findFirst({
      where: { id: assessmentId, projectId },
    });

    if (existingInstance) {
      // Check if any assignments exist for this assessment instance
      const existingAssignments = await prisma.assessmentAssignment.count({
        where: { assessmentId: assessmentId }
      });

      if (existingAssignments > 0) {
        res.status(400).json({ 
          message: "Cannot delete assessment instance - assignments exist for this assessment. Please remove all assignments first.",
          code: "ASSIGNMENTS_EXIST"
        });
        return;
      }

      // Delete the assessment instance (no assignments exist)
      await prisma.assessment.delete({
        where: { id: assessmentId }
      });

      res.status(200).json({ 
        message: "Assessment instance deleted successfully" 
      });
      return;
    }

    res.status(404).json({ message: "Assessment or assessment schedule not found" });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({ message: "Error deleting assessment", error });
  }
};

/**
 * Get available assessments for a user based on their group memberships
 */
export const getAvailableAssessments = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req?.user?.id;

    if (!userId) {
      res.status(401).json({ message: "User authentication required" });
      return;
    }

    // Get user's groups in this project
    const userGroups = await prisma.groupMember.findMany({
      where: { 
        userId,
        group: { projectId }
      },
      include: {
        group: {
          include: {
            scheduleAssignments: {
              include: {
                assessmentSchedule: {
                  include: {
                    questionnaire: {
                      select: { id: true, slug: true, title: true, questionnaire: true }
                    },
                    assessments: {
                      where: {
                        startDate: { lte: new Date() }, // Only show assessments that have started
                        endDate: { gte: new Date() }    // And haven't ended yet
                      },
                      include: {
                        assignments: {
                          where: { userId },
                          select: { id: true, status: true, userId: true }
                        }
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

    // Format available assessments
    const availableAssessments = [];
    
    for (const userGroup of userGroups) {
      for (const scheduleAssignment of userGroup.group.scheduleAssignments) {
        const schedule = scheduleAssignment.assessmentSchedule;
        
        for (const assessment of schedule.assessments) {
          // Check if user already has an assignment for this assessment
          const existingAssignment = assessment.assignments.find(a => a.userId === userId);
          
          if (!existingAssignment) {
            // This assessment is available for the user to start
            availableAssessments.push({
              assessmentId: assessment.id,
              scheduleId: schedule.id,
              scheduleTitle: schedule.title,
              questionnaire: schedule.questionnaire,
              startDate: assessment.startDate,
              endDate: assessment.endDate,
              groupId: userGroup.group.id,
              groupName: userGroup.group.name,
              status: 'AVAILABLE'
            });
          } else if (existingAssignment.status === 'PENDING') {
            // User has started but not completed this assessment
            availableAssessments.push({
              assessmentId: assessment.id,
              scheduleId: schedule.id,
              scheduleTitle: schedule.title,
              questionnaire: schedule.questionnaire,
              startDate: assessment.startDate,
              endDate: assessment.endDate,
              groupId: userGroup.group.id,
              groupName: userGroup.group.name,
              assignmentId: existingAssignment.id,
              status: 'PENDING'
            });
          }
        }
      }
    }

    res.status(200).json({
      availableAssessments,
      totalCount: availableAssessments.length
    });
  } catch (error) {
    console.error("Error fetching available assessments:", error);
    res.status(500).json({ message: "Error fetching available assessments", error });
  }
};

/**
 * Start an assessment (creates AssessmentAssignment)
 * Can be started by the student themselves or by their alternate contact users
 */
export const startAssessment = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;
    const { assessmentInstanceId, userId: targetUserId } = req.body;
    const currentUserId = req?.user?.id;

    if (!currentUserId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!assessmentInstanceId) {
      res.status(400).json({ message: "Assessment instance ID is required" });
      return;
    }

    // Determine the target user (either self or someone they're an alternate contact for)
    // let actualUserId = targetUserId || currentUserId;

    // // If targetUserId is provided and different from current user, verify alternate contact relationship
    // if (targetUserId && targetUserId !== currentUserId) {
    //   const alternateContactRelation = await prisma.alternateContact.findFirst({
    //     where: {
    //       userId: targetUserId,
    //       contactId: currentUserId
    //     }
    //   });

    //   if (!alternateContactRelation) {
    //     res.status(403).json({ 
    //       message: "You are not authorized to start assessments for this user" 
    //     });
    //     return;
    //   }
    // }

    // Get assessment details
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentInstanceId, projectId },
      include: {
        assessmentSchedule: {
          include: {
            scheduleAssignments: {
              include: {
                userGroup: {
                  include: {
                    members: {
                      where: { userId: targetUserId }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!assessment) {
      res.status(404).json({ message: "Assessment not found" });
      return;
    }

    // Verify target user is in a group assigned to this assessment schedule
    // const userInGroup = assessment.assessmentSchedule.scheduleAssignments.some(
    //   assignment => assignment.userGroup.members.length > 0
    // );

    // if (!userInGroup) {
    //   res.status(403).json({ message: "User not authorized for this assessment" });
    //   return;
    // }

    // Check if target user already has an assignment for this assessment
    const existingAssignment = await prisma.assessmentAssignment.findUnique({
      where: { 
        userId_assessmentId: {
          userId: targetUserId,
          assessmentId: assessmentInstanceId
        }
      }
    });

    if (existingAssignment) {
      res.status(200).json({ 
        message: "Assessment already started",
        assignment: existingAssignment
      });
      return;
    }

    // Generate access codes
    const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const accessSecret = Math.random().toString(36).substring(2, 15);

    // Create assessment assignment
    const assignment = await prisma.assessmentAssignment.create({
      data: {
        organisationId,
        projectId: assessment.projectId,
        userId: targetUserId,
        assessmentId: assessmentInstanceId,
        assignedBy: currentUserId, // Who initiated the start
        status: 'PENDING',
        accessCode,
        accessSecret
      }
    });

    res.status(201).json({
      message: "Assessment started successfully",
      assignment: {
        id: assignment.id,
        accessCode: assignment.accessCode,
        accessSecret: assignment.accessSecret,
        status: assignment.status,
        userId: targetUserId
      }
    });
  } catch (error) {
    console.error("Error starting assessment:", error);
    res.status(500).json({ message: "Error starting assessment", error });
  }
};

/**
 * Create an assessment group
 */
export const createAssessmentGroup = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { name, projectId, managerId } = req.body;

    const group = await prisma.assessmentGroup.create({
      data: { name, projectId, managerId },
    });

    res.status(201).json({ message: "Assessment group created successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error creating assessment group", error });
  }
};

/**
 * List all assessment groups within an organisation
 */
export const listAssessmentGroups = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const userId = req.user?.id;
    const userSystemRole = req.user?.systemRole;

    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Check if user has admin-level permissions for groups
    let hasGroupManagementPermissions = false;

    // SUPER_USER and ORG_ADMIN have all permissions
    if (userSystemRole === 'SUPER_USER' || userSystemRole === 'ORG_ADMIN') {
      hasGroupManagementPermissions = true;
    } else {
      // For ORG_USER, check their specific permissions
      const orgUser = await prisma.orgUser.findFirst({
        where: { userId: userId, organisationId: organisationId },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: {
                    include: {
                      permissionActions: {
                        include: { action: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (orgUser?.role) {
        // Get all user actions
        const userActions: string[] = [];
        orgUser.role.rolePermissions.forEach(rolePermission => {
          rolePermission.permission.permissionActions.forEach(permissionAction => {
            userActions.push(permissionAction.action.name);
          });
        });

        // Check if user has groups management permissions
        const requiredActions = ['groups.update', 'groups.delete', 'groups.create'];
        hasGroupManagementPermissions = requiredActions.every(action => userActions.includes(action));
      }
    }

    // Build query based on permissions
    const whereClause = hasGroupManagementPermissions 
      ? { project: { organisationId } } // Show all groups
      : { project: { organisationId }, managerId: userId }; // Show only groups where user is manager

    const groups = await prisma.assessmentGroup.findMany({
      where: whereClause,
      include: {
        manager: {
          select: { id: true, name: true }
        }
      }
    });

    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await prisma.groupMember.findMany({
          where: { groupId: group.id },
          include: { user: true },
        });
        return { ...group, members };
      })
    );

    res.status(200).json({ groups: groupsWithMembers });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving assessment groups", error });
  }
};

/**
 * Get an assessment group by ID
 */
export const getAssessmentGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const group = await prisma.assessmentGroup.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      res.status(404).json({ message: "Assessment group not found" });
      return;
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    });

    res.status(200).json({ group, members });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving assessment group", error });
  }
};

/**
 * Update an assessment group
 */
export const updateAssessmentGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { name, managerId } = req.body;

    const group = await prisma.assessmentGroup.update({
      where: { id: groupId },
      data: { name, managerId },
    });

    res.status(200).json({ message: "Assessment group updated successfully", group });
  } catch (error) {
    res.status(500).json({ message: "Error updating assessment group", error });
  }
};

/**
 * Delete an assessment group
 */
export const deleteAssessmentGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    await prisma.assessmentGroup.delete({
      where: { id: groupId },
    });

    res.status(200).json({ message: "Assessment group deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assessment group", error });
  }
};

/**
 * Add multiple users to an assessment group
 */
export const addUsersToGroup = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: "Invalid user IDs provided" });
      return;
    }

    // Check if the group exists
    const group = await prisma.assessmentGroup.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Check if all user IDs exist in the User table
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true }
    });

    const existingUserIds = existingUsers.map(user => user.id);
    const invalidUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      res.status(400).json({ 
        message: "Some user IDs do not exist", 
        invalidUserIds 
      });
      return;
    }

    // Check which users are already members of the group
    const existingMembers = await prisma.groupMember.findMany({
      where: { 
        groupId,
        userId: { in: userIds }
      },
      select: { userId: true }
    });

    const existingMemberIds = existingMembers.map(member => member.userId);
    const newUserIds = userIds.filter(id => !existingMemberIds.includes(id));

    if (newUserIds.length === 0) {
      res.status(200).json({ 
        message: "All users are already members of this group",
        alreadyMembers: existingMemberIds
      });
      return;
    }

    // Add only new users to the group
    await prisma.groupMember.createMany({
      data: newUserIds.map((userId) => ({ groupId, userId })),
    });

    res.status(201).json({ 
      message: `${newUserIds.length} user(s) added to group successfully`,
      addedUsers: newUserIds,
      alreadyMembers: existingMemberIds.length > 0 ? existingMemberIds : undefined
    });
  } catch (error) {
    console.error("Error adding users to group:", error);
    res.status(500).json({ message: "Error adding users to group", error });
  }
};

/**
 * Remove a user from an assessment group
 */
export const removeUserFromGroup = async (req: Request, res: Response) => {
  try {
    const { groupId, memberId } = req.params;

    await prisma.groupMember.delete({
      where: { id: memberId },
    });

    res.status(200).json({ message: "User removed from group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing user from group", error });
  }
};

/**
 * Create an assessment assignment
 */
export const createAssessmentAssignment = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const {
      groupId,
      userId,
      submittedBy,
      status,
      responses,
      report,
      assessmentId,
      startDate,
      endDate,
    } = req.body;
    // Generate unique 5-character alphanumeric codes
    const accessCode = nanoid(5);
    const accessSecret = nanoid(5);
    const assignedBy = req?.user?.id;
    if (groupId) {
      // Fetch userIds from groupMember table using groupId
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId },
        select: { userId: true },
      });
      console.log("groupMembers", groupMembers);
      const userIds = groupMembers.map((member) => member.userId);
      console.log("userIds", userIds);
      // Create assessment assignments for each userId
      const assignments = await prisma.assessmentAssignment.createMany({
        data: userIds.map((userId) => ({
          userId,
          organisationId,
          userGroupId: groupId,
          assignedBy: assignedBy ?? "unknown",
          submittedBy,
          submittedAt: null,
          status,
          responses,
          report,
          assessmentId,
          accessCode: nanoid(5), // Generate unique codes for each assignment
          accessSecret: nanoid(5),
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        })),
      });

      res.status(201).json({ message: "Assessment assignments created successfully", assignments });
    } else if (userId) {
      // Create a single assessment assignment when userId is provided without groupId
      const assignment = await prisma.assessmentAssignment.create({
        data: {
          userId,
          organisationId,
          assignedBy: assignedBy ?? "unknown",
          submittedBy,
          submittedAt: null,
          status,
          responses,
          report,
          assessmentId,
          accessCode,
          accessSecret,
          ...(startDate && { startDate: new Date(startDate) }),
          ...(endDate && { endDate: new Date(endDate) }),
        },
      });

      res.status(201).json({ message: "Assessment assignment created successfully", assignment });
    } else {
      res.status(400).json({ message: "Either groupId or userId must be provided" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error creating assessment assignment", error });
  }
};

/**
 * List all assessment assignments - simplified version without complex RBAC
 * Shows all users who are part of groups assigned to assessments,
 * regardless of whether they've started the assessment or not
 */
export const listAssessmentAssignments = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { groupId, assessmentId, userId: queryUserId } = req.query;

    if (!assessmentId) {
      res.status(400).json({
        error: "Assessment ID is required to list assignments"
      });
      return;
    }

    // Get all users in the group assigned to that assessment
    if (assessmentId) {
      // Get the assessment with its schedule and group assignments
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId as string },
        include: {
          assessmentSchedule: {
            include: {
              questionnaire: {
                select: {
                  id: true,
                  slug: true,
                  title: true
                }
              },
              scheduleAssignments: {
                include: {
                  userGroup: {
                    include: {
                      members: {
                        include: {
                          user: {
                            select: {
                              id: true,
                              name: true,
                              email: true
                            }
                          }
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

      if (!assessment) {
        res.status(404).json({ message: "Assessment not found" });
        return;
      }

      // Get all users from the groups assigned to this assessment
      const allUsersInGroups: any[] = [];
      assessment.assessmentSchedule.scheduleAssignments.forEach(scheduleAssignment => {
        scheduleAssignment.userGroup.members.forEach(member => {
          allUsersInGroups.push({
            userId: member.user.id,
            userName: member.user.name,
            userEmail: member.user.email,
            groupId: scheduleAssignment.userGroup.id,
            groupName: scheduleAssignment.userGroup.name
          });
        });
      });

      // Get existing assignments for this assessment
      const existingAssignments = await prisma.assessmentAssignment.findMany({
        where: {
          assessmentId: assessmentId as string,
          organisationId
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create a map of existing assignments by userId
      const assignmentMap = new Map();
      existingAssignments.forEach(assignment => {
        assignmentMap.set(assignment.userId, assignment);
      });

      // Build the final list combining all group users with their assignment status
      const formattedAssignments = allUsersInGroups.map(userInGroup => {
        const existingAssignment = assignmentMap.get(userInGroup.userId);
        
        if (existingAssignment) {
          // User has started the assessment
          return {
            id: existingAssignment.id,
            userName: userInGroup.userName,
            assessmentName: assessment.assessmentSchedule.title,
            questionnaire: {
              id: assessment.assessmentSchedule.questionnaire.id,
              slug: assessment.assessmentSchedule.questionnaire.slug,
              title: assessment.assessmentSchedule.questionnaire.title
            },
            status: existingAssignment.status,
            responses: existingAssignment.responses,
            accessSecret: existingAssignment.accessSecret,
            accessCode: existingAssignment.accessCode,
            userId: userInGroup.userId,
            assessmentId: assessment.id,
            groupId: userInGroup.groupId,
            groupName: userInGroup.groupName,
            startDate: assessment.startDate,
            endDate: assessment.endDate,
            submittedAt: existingAssignment.submittedAt,
            hasStarted: true
          };
        } else {
          // User hasn't started the assessment yet
          return {
            id: null,
            userName: userInGroup.userName,
            assessmentName: assessment.assessmentSchedule.title,
            questionnaire: {
              id: assessment.assessmentSchedule.questionnaire.id,
              slug: assessment.assessmentSchedule.questionnaire.slug,
              title: assessment.assessmentSchedule.questionnaire.title
            },
            status: "NOT_STARTED",
            responses: null,
            accessSecret: null,
            accessCode: null,
            userId: userInGroup.userId,
            assessmentId: assessment.id,
            groupId: userInGroup.groupId,
            groupName: userInGroup.groupName,
            startDate: assessment.startDate,
            endDate: assessment.endDate,
            submittedAt: null,
            hasStarted: false
          };
        }
      });

      res.status(200).json({ assignments: formattedAssignments });
    }

  } catch (error) {
    console.error("Error retrieving assessment assignments:", error);
    res.status(500).json({ message: "Error retrieving assessment assignments", error });
  }
};

/**
 * Get group level report - all assignments for a specific group across all their assessments
 * This shows completed, pending, and not started assignments for reporting purposes
 */
export const getGroupAssignmentReport = async (req: Request, res: Response) => {
  try {
    const { organisationId, groupId } = req.params;

    if (!groupId) {
      res.status(400).json({
        error: "Group ID is required to generate group report"
      });
      return;
    }

    // Get the group details
    const group = await prisma.assessmentGroup.findUnique({
      where: { id: groupId },
      select: { id: true, name: true }
    });

    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    // Get all assessment schedules assigned to this group
    const scheduleAssignments = await prisma.assessmentScheduleAssignment.findMany({
      where: { userGroupId: groupId },
      include: {
        assessmentSchedule: {
          include: {
            questionnaire: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            },
            assessments: {
              where: {
                // Include assessments that have started (including expired ones)
                startDate: { lte: new Date() }
              },
              orderBy: { startDate: 'asc' },
              include: {
                assignments: {
                  where: { organisationId },
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
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

    // Get all group members
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const allAssignments: any[] = [];

    // Process each assessment schedule
    scheduleAssignments.forEach(scheduleAssignment => {
      const schedule = scheduleAssignment.assessmentSchedule;
      
      // Process each assessment instance in the schedule
      schedule.assessments.forEach(assessment => {
        // Create a map of existing assignments by userId for this assessment
        const assignmentMap = new Map();
        assessment.assignments.forEach(assignment => {
          assignmentMap.set(assignment.userId, assignment);
        });

        // For each group member, create an assignment record
        groupMembers.forEach(member => {
          const existingAssignment = assignmentMap.get(member.user.id);

          if (existingAssignment) {
            // User has started this assessment
            allAssignments.push({
              id: existingAssignment.id,
              userName: member.user.name,
              assessmentName: schedule.title,
              questionnaire: {
                id: schedule.questionnaire.id,
                slug: schedule.questionnaire.slug,
                title: schedule.questionnaire.title
              },
              status: existingAssignment.status,
              responses: existingAssignment.responses,
              accessSecret: existingAssignment.accessSecret,
              accessCode: existingAssignment.accessCode,
              userId: member.user.id,
              assessmentId: assessment.id,
              groupId: group.id,
              groupName: group.name,
              startDate: assessment.startDate,
              endDate: assessment.endDate,
              submittedAt: existingAssignment.submittedAt,
              hasStarted: true
            });
          } else {
            // User hasn't started this assessment yet
            allAssignments.push({
              id: null,
              userName: member.user.name,
              assessmentName: schedule.title,
              questionnaire: {
                id: schedule.questionnaire.id,
                slug: schedule.questionnaire.slug,
                title: schedule.questionnaire.title
              },
              status: "NOT_STARTED",
              responses: null,
              accessSecret: null,
              accessCode: null,
              userId: member.user.id,
              assessmentId: assessment.id,
              groupId: group.id,
              groupName: group.name,
              startDate: assessment.startDate,
              endDate: assessment.endDate,
              submittedAt: null,
              hasStarted: false
            });
          }
        });
      });
    });

    // Sort assignments by startDate and then by userName
    allAssignments.sort((a, b) => {
      const dateCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.userName.localeCompare(b.userName);
    });

    // Extract questionnaire info (same for all assignments in the group)
    const questionnaire = scheduleAssignments.length > 0 ? {
      id: scheduleAssignments[0].assessmentSchedule.questionnaire.id,
      slug: scheduleAssignments[0].assessmentSchedule.questionnaire.slug,
      title: scheduleAssignments[0].assessmentSchedule.questionnaire.title
    } : null;

    // Remove questionnaire from each assignment since it's now at the top level
    const cleanedAssignments = allAssignments.map(assignment => {
      const { questionnaire, ...assignmentWithoutQuestionnaire } = assignment;
      return assignmentWithoutQuestionnaire;
    });

    res.status(200).json({ 
      assignments: cleanedAssignments,
      questionnaire: questionnaire
    });

  } catch (error) {
    console.error("Error retrieving group assignment report:", error);
    res.status(500).json({ message: "Error retrieving group assignment report", error });
  }
};

/**
 * Get school level assignment report - all assignments for all groups in a project
 * Similar to group level report but covers the entire school/project
 */
export const getSchoolAssignmentReport = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;

    if (!projectId) {
      res.status(400).json({
        error: "Project ID is required to generate school report"
      });
      return;
    }

    // Get all groups in the project
    const allGroups = await prisma.assessmentGroup.findMany({
      where: { projectId },
      select: { id: true, name: true }
    });

    if (allGroups.length === 0) {
      res.status(200).json({ 
        assignments: [],
        questionnaire: null
      });
      return;
    }

    // Get all assessment schedules assigned to any group in this project
    const scheduleAssignments = await prisma.assessmentScheduleAssignment.findMany({
      where: { 
        userGroup: {
          projectId: projectId
        }
      },
      include: {
        userGroup: {
          select: { id: true, name: true }
        },
        assessmentSchedule: {
          include: {
            questionnaire: {
              select: {
                id: true,
                slug: true,
                title: true
              }
            },
            assessments: {
              where: {
                // Include assessments that have started (including expired ones)
                startDate: { lte: new Date() }
              },
              orderBy: { startDate: 'asc' },
              include: {
                assignments: {
                  where: { organisationId },
                  include: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true
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

    // Get all group members across all groups
    const allGroupMembers = await prisma.groupMember.findMany({
      where: { 
        groupId: { in: allGroups.map(g => g.id) }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    const allAssignments: any[] = [];

    // Process each assessment schedule
    scheduleAssignments.forEach(scheduleAssignment => {
      const schedule = scheduleAssignment.assessmentSchedule;
      const groupId = scheduleAssignment.userGroup.id;
      const groupName = scheduleAssignment.userGroup.name;
      
      // Get members for this specific group
      const groupMembers = allGroupMembers.filter(member => member.groupId === groupId);
      
      // Process each assessment instance in the schedule
      schedule.assessments.forEach(assessment => {
        // Create a map of existing assignments by userId for this assessment
        const assignmentMap = new Map();
        assessment.assignments.forEach(assignment => {
          assignmentMap.set(assignment.userId, assignment);
        });

        // For each group member, create an assignment record
        groupMembers.forEach(member => {
          const existingAssignment = assignmentMap.get(member.user.id);

          if (existingAssignment) {
            // User has started the assessment
            allAssignments.push({
              id: existingAssignment.id,
              userName: member.user.name,
              assessmentName: schedule.title,
              questionnaire: {
                id: schedule.questionnaire.id,
                slug: schedule.questionnaire.slug,
                title: schedule.questionnaire.title
              },
              status: existingAssignment.status,
              responses: existingAssignment.responses,
              accessSecret: existingAssignment.accessSecret,
              accessCode: existingAssignment.accessCode,
              userId: member.user.id,
              assessmentId: assessment.id,
              groupId: groupId,
              groupName: groupName,
              startDate: assessment.startDate,
              endDate: assessment.endDate,
              submittedAt: existingAssignment.submittedAt,
              hasStarted: true
            });
          } else {
            // User hasn't started the assessment yet
            allAssignments.push({
              id: null,
              userName: member.user.name,
              assessmentName: schedule.title,
              questionnaire: {
                id: schedule.questionnaire.id,
                slug: schedule.questionnaire.slug,
                title: schedule.questionnaire.title
              },
              status: "NOT_STARTED",
              responses: null,
              accessSecret: null,
              accessCode: null,
              userId: member.user.id,
              assessmentId: assessment.id,
              groupId: groupId,
              groupName: groupName,
              startDate: assessment.startDate,
              endDate: assessment.endDate,
              submittedAt: null,
              hasStarted: false
            });
          }
        });
      });
    });

    // Sort assignments by group name, then startDate, then by userName
    allAssignments.sort((a, b) => {
      const groupCompare = a.groupName.localeCompare(b.groupName);
      if (groupCompare !== 0) return groupCompare;
      const dateCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.userName.localeCompare(b.userName);
    });

    // Extract questionnaire info (should be consistent across the project)
    const questionnaire = scheduleAssignments.length > 0 ? {
      id: scheduleAssignments[0].assessmentSchedule.questionnaire.id,
      slug: scheduleAssignments[0].assessmentSchedule.questionnaire.slug,
      title: scheduleAssignments[0].assessmentSchedule.questionnaire.title
    } : null;

    // Remove questionnaire from each assignment since it's now at the top level
    const cleanedAssignments = allAssignments.map(assignment => {
      const { questionnaire, ...assignmentWithoutQuestionnaire } = assignment;
      return assignmentWithoutQuestionnaire;
    });

    res.status(200).json({ 
      assignments: cleanedAssignments,
      questionnaire: questionnaire
    });

  } catch (error) {
    console.error("Error retrieving school assignment report:", error);
    res.status(500).json({ message: "Error retrieving school assignment report", error });
  }
};

/**
 * List all assignments for the current user or their alternate contacts
 */
export const listMyAssignments = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!projectId) {
      res.status(400).json({ message: "Project ID is required" });
      return;
    }

    // Find users for whom the current user is an alternate contact
    const alternateContactFor = await prisma.alternateContact.findMany({
      where: { contactId: currentUserId },
      select: { userId: true },
    });

    const relatedUserIds = alternateContactFor.map(contact => contact.userId);
    const allUserIds = [...new Set([currentUserId, ...relatedUserIds])];

    // 1. Get started assignments (from AssessmentAssignment table)
    const startedAssignments = await prisma.assessmentAssignment.findMany({
      where: {
        organisationId,
        assessment: {
          projectId: projectId,
        },
        userId: {
          in: allUserIds,
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        assessment: {
          include: {
            assessmentSchedule: {
              include: {
                questionnaire: {
                  select: { id: true, title: true, slug: true }
                }
              }
            }
          }
        },
      },
    });

    // 2. Get user's groups to find group names for started assignments
    const userGroupsForStarted = await prisma.groupMember.findMany({
      where: { 
        userId: { in: startedAssignments.map(sa => sa.userId) },
        group: {
          scheduleAssignments: {
            some: {
              assessmentSchedule: {
                assessments: {
                  some: {
                    id: { in: startedAssignments.map(sa => sa.assessmentId) }
                  }
                }
              }
            }
          }
        }
      },
      include: {
        group: {
          select: { id: true, name: true }
        }
      }
    });

    // Create a map of userId+assessmentId to group name
    const userAssessmentGroupMap = new Map();
    for (const userGroup of userGroupsForStarted) {
      const key = `${userGroup.userId}`;
      if (!userAssessmentGroupMap.has(key)) {
        userAssessmentGroupMap.set(key, userGroup.group.name);
      }
    }

    // 3. Get user's groups for available assessments
    const userGroups = await prisma.groupMember.findMany({
      where: { userId: { in: allUserIds } },
      include: {
        group: {
          include: {
            scheduleAssignments: {
              include: {
                assessmentSchedule: {
                  include: {
                    questionnaire: {
                      select: { id: true, title: true, slug: true }
                    },
                    assessments: {
                      where: {
                        projectId: projectId,
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() }
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

    // 4. Get all available assessment instances and filter out already started ones
    const availableAssessments: any[] = [];
    const startedAssessmentIds = new Set(startedAssignments.map(sa => sa.assessmentId));

    // Get user details for all users we're checking
    const allUsers = await prisma.user.findMany({
      where: { id: { in: allUserIds } },
      select: { id: true, name: true, email: true }
    });
    const userDetailsMap = new Map(allUsers.map(user => [user.id, user]));

    userGroups.forEach(userGroup => {
      userGroup.group.scheduleAssignments.forEach(scheduleAssignment => {
        scheduleAssignment.assessmentSchedule.assessments.forEach(assessmentInstance => {
          // Only include if user hasn't started this assessment yet
          if (!startedAssessmentIds.has(assessmentInstance.id)) {
            const userDetails = userDetailsMap.get(userGroup.userId);
            availableAssessments.push({
              assessmentInstanceId: assessmentInstance.id,
              assessmentName: scheduleAssignment.assessmentSchedule.title,
              questionnaire: scheduleAssignment.assessmentSchedule.questionnaire,
              groupName: userGroup.group.name,
              groupId: userGroup.group.id,
              startDate: assessmentInstance.startDate,
              endDate: assessmentInstance.endDate,
              status: "AVAILABLE",
              type: "AVAILABLE",
              userId: userGroup.userId,
              userName: userDetails?.name || 'Unknown User',
              userEmail: userDetails?.email || 'Unknown Email'
            });
          }
        });
      });
    });

    // 5. Format started assignments
    const formattedStartedAssignments = startedAssignments.map(assignment => ({
      id: assignment.id,
      userName: assignment.user.name,
      userEmail: assignment.user.email,
      assessmentName: assignment.assessment.assessmentSchedule.title,
      questionnaire: assignment.assessment.assessmentSchedule.questionnaire,
      groupName: userAssessmentGroupMap.get(assignment.userId) || 'Unknown Group',
      status: assignment.status,
      responses: assignment.responses,
      accessSecret: assignment.accessSecret,
      accessCode: assignment.accessCode,
      userId: assignment.userId,
      assessmentId: assignment.assessmentId,
      startDate: assignment.assessment.startDate,
      endDate: assignment.assessment.endDate,
      submittedAt: assignment.submittedAt,
      type: "STARTED"
    }));

    // 6. Combine all assignments
    const allAssignments = [
      ...formattedStartedAssignments,
      ...availableAssessments
    ];

    res.status(200).json({ assignments: allAssignments });
  } catch (error) {
    console.error("Error retrieving user assignments:", error);
    res.status(500).json({ message: "Error retrieving user assignments", error });
  }
};

/**
 * Get an assessment assignment by ID
 */
export const getAssessmentAssignment = async (req: Request, res: Response) => {
  try {
    const { organisationId, assignmentId } = req.params;

    const assignment = await prisma.assessmentAssignment.findFirst({
      where: { id: assignmentId },
    });

    if (!assignment) {
      res.status(404).json({ message: "Assessment assignment not found" });
      return;
    }

    res.status(200).json({ assignment });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving assessment assignment", error });
  }
};

/**
 * Update an assessment assignment
 */
export const updateAssessmentAssignment = async (req: Request, res: Response) => {
  try {
    const { organisationId, assignmentId } = req.params;
    const data = req.body;

    // Process date fields if they exist
    const updateData = { ...data };
    if (data.startDate) {
      updateData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    const assignment = await prisma.assessmentAssignment.update({
      where: { id: assignmentId },
      data: updateData,
    });

    res.status(200).json({ message: "Assessment assignment updated successfully", assignment });
  } catch (error) {
    console.error("Error updating assessment assignment:", error); // Debug log
    res.status(500).json({ message: "Error updating assessment assignment", error });
  }
};

/**
 * Delete an assessment assignment
 */
export const deleteAssessmentAssignment = async (req: Request, res: Response) => {
  try {
    const { organisationId, assignmentId } = req.params;

    await prisma.assessmentAssignment.delete({
      where: { id: assignmentId },
    });

    res.status(200).json({ message: "Assessment assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting assessment assignment", error });
  }
};

/**
 * Verify accessCode and accessSecret for an assessment assignment
 */
export const verifyAssessmentAssignment = async (req: Request, res: Response) => {
  try {
    const { accessCode, accessSecret } = req.body;

    if (!accessCode || !accessSecret) {
      res.status(400).json({ message: "Both accessCode and accessSecret are required" });
      return;
    }

    const assignment = await prisma.assessmentAssignment.findFirst({
      where: { accessCode, accessSecret },
      include: {
        assessment: {
          include: {
            assessmentSchedule: {
              include: {
                questionnaire: {
                  select: {
                    slug: true,
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!assignment) {
      res.status(404).json({ message: "Invalid accessCode or accessSecret" });
      return;
    }

    // Check assignment date restrictions
    const currentDate = new Date();
    let accessStatus = "accessible";
    let statusMessage = "";

    // Check if assignment has not started yet
    if (assignment.assessment.startDate && currentDate < assignment.assessment.startDate) {
      accessStatus = "not_started";
      statusMessage = "Assignment has not started yet";
      res.status(403).json({ 
        message: statusMessage,
        status: accessStatus,
        startDate: assignment.assessment.startDate,
        currentDate: currentDate
      });
      return;
    }

    // Check if assignment has expired
    if (assignment.assessment.endDate && currentDate > assignment.assessment.endDate) {
      accessStatus = "expired";
      statusMessage = "Assignment has expired";
      res.status(403).json({ 
        message: statusMessage,
        status: accessStatus,
        endDate: assignment.assessment.endDate,
        currentDate: currentDate
      });
      return;
    }

    res.status(200).json({ 
      assignment, 
      slug: assignment.assessment.assessmentSchedule.questionnaire.slug,
      title: assignment.assessment.assessmentSchedule.questionnaire.title,
      status: accessStatus,
      message: "Assignment is accessible"
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying assessment assignment", error });
  }
};

/**
 * update the responses of an assessment assignment
 */
export const updateAssessmentAssignmentResponses = async (req: Request, res: Response) => {
  try {
    const { organisationId, assignmentId } = req.params;
    const { responses } = req.body;

    if (!responses) {
      res.status(400).json({ message: "Responses are required" });
    }

    // Check if the assignment exists and belongs to the organisation
    const assignment = await prisma.assessmentAssignment.findFirst({
      where: { id: assignmentId, organisationId },
    });

    if (!assignment) {
      res.status(404).json({ message: "Assignment not found for this organisation" });
    }

    const updatedAssignment = await prisma.assessmentAssignment.update({
      where: { id: assignmentId },
      data: { 
        responses,
        status: "COMPLETED",
        submittedAt: new Date(),
      },
    });

    res.status(200).json({ message: "Responses updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating responses", error });
  }
};

/**
 * Fetch all Group Admins in an organisation
 */
export const getGroupAdminsInOrganisation = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    // Fetch all roles in the organisation
    const roles = await prisma.role.findMany({
      where: { organisationId },
      select: { id: true, name: true },
    });

    // Filter roles with the name "Group Admin"
    const groupAdminRoleIds = roles
      .filter((role) => role.name == "Group Admin")
      .map((role) => role.id);

    // Fetch userIds from orgUser table for the Group Admin roles
    const orgUsers = await prisma.orgUser.findMany({
      where: {
        organisationId,
        roleId: { in: groupAdminRoleIds },
      },
      select: { userId: true },
    });

    const userIds = orgUsers.map((orgUser) => orgUser.userId);



    // Fetch user details from user table
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Group Admins", error });
  }
};

/**
 * Fetch user IDs and names for an organisation
 */
export const getProjectGroupUsers = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    // Fetch user IDs from orgUser table
    const orgUsers = await prisma.orgUser.findMany({
      where: { organisationId },
      select: { userId: true },
    });

    const userIds = orgUsers.map((orgUser) => orgUser.userId);

    if (userIds.length === 0) {
      res.status(404).json({ message: "No users found" });
      return;
    }

    // Fetch user names from user table
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

/**
 * Add an alternate contact for a user in a project
 */
export const addAlternateContact = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { contactId, relationship } = req.body;

    const existingContact = await prisma.alternateContact.findFirst({
      where: { userId, contactId },
    });

    if (existingContact) {
      res.status(400).json({ message: "Alternate contact already exists" });
      return;
    }

    const alternateContact = await prisma.alternateContact.create({
      data: { userId, contactId, relationship },
    });
    console.log("alternateContact", alternateContact);
    res.status(201).json({ message: "Alternate contact added successfully", alternateContact });
  } catch (error) {
    res.status(500).json({ message: "Error adding alternate contact", error });
  }
};

/**
 * Remove an alternate contact for a user in a project
 */
export const removeAlternateContact = async (req: Request, res: Response) => {
  try {
    const { organisationId, projectId, alternateContactId } = req.params;

    const alternateContact = await prisma.alternateContact.findFirst({
      where: { id: alternateContactId },
    });

    if (!alternateContact) {
      res.status(404).json({ message: "Alternate contact not found" });
      return;
    }

    await prisma.alternateContact.delete({
      where: { id: alternateContactId },
    });

    res.status(200).json({ message: "Alternate contact removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing alternate contact", error });
  }
};

/**
 * Check if email exists in user table and return user details
 */
export const checkEmailForAlternateContact = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Check if user exists with the provided email
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        extras: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (existingUser) {
      res.status(200).json({ 
        user: true, 
        message: "User found", 
        userDetails: existingUser 
      });
    } else {
      res.status(200).json({ 
        user: false, 
        message: "User not found" 
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Error checking email", error });
  }
};

/**
 * Create a questionnaire within an organisation
 */
export const createQuestionnaire = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;
    const { title, description, questionnaire, minSpanDays, slug } = req.body;
    const userId = req?.user?.id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    if (!title || !questionnaire || !minSpanDays || !slug) {
      res.status(400).json({ 
        message: "Title, slug, questionnaire, and minSpanDays are required" 
      });
      return;
    }

    if (minSpanDays < 1) {
      res.status(400).json({ 
        message: "minSpanDays must be at least 1" 
      });
      return;
    }

    // Validate slug format (allow only alphanumeric, hyphens, underscores)
    const slugPattern = /^[a-zA-Z0-9-_]+$/;
    if (!slugPattern.test(slug)) {
      res.status(400).json({ 
        message: "Slug can only contain letters, numbers, hyphens, and underscores" 
      });
      return;
    }

    // Check if questionnaire with same slug exists globally
    const existingSlug = await prisma.questionnaire.findFirst({
      where: { 
        slug
      },
    });

    if (existingSlug) {
      res.status(400).json({ 
        message: "Questionnaire with this slug already exists" 
      });
      return;
    }

    const newQuestionnaire = await prisma.questionnaire.create({
      data: {
        slug,
        title,
        description,
        questionnaire,
        minSpanDays,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    res.status(201).json({ 
      message: "Questionnaire created successfully", 
      questionnaire: newQuestionnaire 
    });
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    res.status(500).json({ message: "Error creating questionnaire", error });
  }
};

/**
 * List all questionnaires within an organisation
 */
export const listQuestionnaires = async (req: Request, res: Response) => {
  try {
    const { organisationId } = req.params;

    //! Note: Current schema doesn't scope questionnaires to organisations
    // Returning all questionnaires
    const questionnaires = await prisma.questionnaire.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        minSpanDays: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ questionnaires });
  } catch (error) {
    console.error("Error retrieving questionnaires:", error);
    res.status(500).json({ message: "Error retrieving questionnaires", error });
  }
};

/**
 * Get a specific questionnaire by ID
 */
export const getQuestionnaire = async (req: Request, res: Response) => {
  try {
    const { organisationId, questionnaireId } = req.params;

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { 
        id: questionnaireId
      },
    });

    if (!questionnaire) {
      res.status(404).json({ 
        message: "Questionnaire not found" 
      });
      return;
    }

    res.status(200).json({ questionnaire });
  } catch (error) {
    console.error("Error retrieving questionnaire:", error);
    res.status(500).json({ message: "Error retrieving questionnaire", error });
  }
};

/**
 * Update a questionnaire
 */
export const updateQuestionnaire = async (req: Request, res: Response) => {
  try {
    const { organisationId, questionnaireId } = req.params;
    const { slug, title, description, questionnaire, minSpanDays } = req.body;
    const userId = req?.user?.id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if questionnaire exists
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { 
        id: questionnaireId
      },
    });

    if (!existingQuestionnaire) {
      res.status(404).json({ 
        message: "Questionnaire not found" 
      });
      return;
    }

    // Validate minSpanDays if provided
    if (minSpanDays !== undefined && minSpanDays < 1) {
      res.status(400).json({ 
        message: "minSpanDays must be at least 1" 
      });
      return;
    }

    // Validate slug format if provided
    if (slug) {
      const slugPattern = /^[a-zA-Z0-9-_]+$/;
      if (!slugPattern.test(slug)) {
        res.status(400).json({ 
          message: "Slug can only contain letters, numbers, hyphens, and underscores" 
        });
        return;
      }

      // Check if slug is being changed and conflicts with existing questionnaire
      if (slug !== existingQuestionnaire.slug) {
        const slugConflict = await prisma.questionnaire.findFirst({
          where: { 
            slug,
            id: { not: questionnaireId }
          },
        });

        if (slugConflict) {
          res.status(400).json({ 
            message: "Questionnaire with this slug already exists" 
          });
          return;
        }
      }
    }

    const updatedQuestionnaire = await prisma.questionnaire.update({
      where: { id: questionnaireId },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(questionnaire && { questionnaire }),
        ...(minSpanDays !== undefined && { minSpanDays }),
        updatedBy: userId,
      },
    });

    res.status(200).json({ 
      message: "Questionnaire updated successfully", 
      questionnaire: updatedQuestionnaire 
    });
  } catch (error) {
    console.error("Error updating questionnaire:", error);
    res.status(500).json({ message: "Error updating questionnaire", error });
  }
};

/**
 * Delete a questionnaire
 */
export const deleteQuestionnaire = async (req: Request, res: Response) => {
  try {
    const { organisationId, questionnaireId } = req.params;

    // Check if questionnaire exists
    const existingQuestionnaire = await prisma.questionnaire.findUnique({
      where: { 
        id: questionnaireId
      },
    });

    if (!existingQuestionnaire) {
      res.status(404).json({ 
        message: "Questionnaire not found" 
      });
      return;
    }

    // Check if questionnaire is being used in any assessment schedules
    const schedulesUsingQuestionnaire = await prisma.assessmentSchedule.findFirst({
      where: { questionnaireId: questionnaireId },
    });

    if (schedulesUsingQuestionnaire) {
      res.status(400).json({ 
        message: "Cannot delete questionnaire that is being used in assessment schedules" 
      });
      return;
    }

    await prisma.questionnaire.delete({
      where: { id: questionnaireId },
    });

    res.status(200).json({ 
      message: "Questionnaire deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting questionnaire:", error);
    res.status(500).json({ message: "Error deleting questionnaire", error });
  }
};