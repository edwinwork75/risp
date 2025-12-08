import express from "express";
import {
   createOrganisation,
   listOrganisations,
   getOrganisation,
   updateOrganisation,
   deleteOrganisation,
   addUserToOrganisation,
   removeUserFromOrganisation,
   deleteRoleInOrganisation,
   createRoleInOrganisation,
   listRolesInOrganisation,
   updateRoleInOrganisation,
   addPermissionsToRole,
   assignUsersToProject,
   createProjectInOrganisation,
   deleteProjectInOrganisation,
   listProjectsInOrganisation,
   removePermissionsFromRole,
   updateProjectInOrganisation,
   listUserAllOrganisations,
   listUserProjectsInOrganisation,
   createPermissionInOrganisation,
   listPermissionsInOrganisation,
   updatePermissionInOrganisation,
   deletePermissionInOrganisation,
   addActionToPermission,
   removeActionFromPermission,
   createActionInOrganisation,
   listActionsInOrganisation,
   updateActionInOrganisation,
   deleteActionInOrganisation,
   listActionsForPermission,
   listPermissionsForRole,
   createOrganisationUser,
   listOrganisationUsersAndRoles,
   deleteUserRoleInOrganisation,
   deleteUserAndRolesInOrganisation,
   updateOrganisationUser,
   getUserInProject,
   listUsersInProject,
   addUserToProject,
   updateProjectUser,
   removeProjectUser,
   unassignUserFromProject,
   createAssessment,
   listAssessments,
   getAssessment,
   updateAssessment,
   deleteAssessment,
   createAssessmentGroup,
   listAssessmentGroups,
   getAssessmentGroup,
   updateAssessmentGroup,
   deleteAssessmentGroup,
   addUsersToGroup,
   removeUserFromGroup,
   createAssessmentAssignment,
   listAssessmentAssignments,
   getGroupAssignmentReport,
   getSchoolAssignmentReport,
   getAssessmentAssignment,
   updateAssessmentAssignment,
   deleteAssessmentAssignment,
   getGroupAdminsInOrganisation,
   getProjectGroupUsers,
   verifyAssessmentAssignment,
   addAlternateContact,
   removeAlternateContact,
   checkEmailForAlternateContact,
   getUserPermissionsInOrganisation,
   updateAssessmentAssignmentResponses,
   listMyAssignments,
   startAssessment,
   createQuestionnaire,
   listQuestionnaires,
   getQuestionnaire,
   updateQuestionnaire,
   deleteQuestionnaire
} from "../controllers/organisation.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { checkPermission, requireSystemRole } from "../middleware/rbac.middleware";
import { SystemRole } from "@prisma/client";

const router = express.Router();

/**
 * @swagger
 * /organisations:
 *   post:
 *     summary: Create a new organisation with admin user
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - adminEmail
 *               - adminPassword
 *               - adminName
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Organisation"
 *               description:
 *                 type: string
 *                 example: "A new organisation"
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 example: "admin@myorg.com"
 *               adminPassword:
 *                 type: string
 *                 format: password
 *                 example: "SecurePassword123"
 *               adminName:
 *                 type: string
 *                 example: "Admin User"
 *     responses:
 *       201:
 *         description: Organisation and admin user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Organisation and admin user created successfully"
 *                 organisation:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                 adminUser:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     systemRole:
 *                       type: string
 *                       example: "ORG_ADMIN"
 *                 adminRole:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                       example: "Admin"
 *                     description:
 *                       type: string
 *                       example: "Organization administrator with full access"
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Error creating organisation
 */
router.post("/", authenticateToken, checkPermission("organisation.create"), createOrganisation);

/**
 * @swagger
 * /organisations:
 *   get:
 *     summary: List all organisations
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved organisations
 *       500:
 *         description: Error retrieving organisations
 */
router.get("/", authenticateToken, checkPermission("organisation.list"), listOrganisations);


/**
 * @swagger
 * /organisations/{id}:
 *   get:
 *     summary: Get organisation by ID
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved organisation
 *       404:
 *         description: Organisation not found
 *       500:
 *         description: Error retrieving organisation
 */
router.get("/:organisationId", authenticateToken, checkPermission("organisation.read"), getOrganisation);

/**
 * @swagger
 * /organisations/{id}:
 *   patch:
 *     summary: Update organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Organisation updated successfully
 *       404:
 *         description: Organisation not found
 *       500:
 *         description: Error updating organisation
 */
router.patch("/:organisationId", authenticateToken, checkPermission("organisation.update"), updateOrganisation);

/**
 * @swagger
 * /organisations/{id}:
 *   delete:
 *     summary: Delete organisation
 *     tags: [Organisations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Organisation deleted successfully
 *       404:
 *         description: Organisation not found
 *       500:
 *         description: Error deleting organisation
 */
router.delete("/:organisationId", authenticateToken, checkPermission("organisation.delete"), deleteOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/users:
 *   post:
 *     summary: Add a user to an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       201:
 *         description: User added to organisation successfully
 *       400:
 *         description: User is already a member
 *       500:
 *         description: Error adding user
 */
router.post("/:organisationId/users", authenticateToken, checkPermission("users.assignToOrgansation"), addUserToOrganisation);


/**
 * @swagger
 * /organisations/{organisationId}/user/permissions:
 *   get:
 *     summary: Get current user's permissions in an organisation
 *     tags: [Organisations-Users-Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved user permissions
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   description: Response for SUPER_USER
 *                   properties:
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["users.create", "users.read", "organisation.create", "system.manage-settings", "api.generate-key"]
 *                     role:
 *                       type: string
 *                       example: "SUPER_USER"
 *                     systemRole:
 *                       type: string
 *                       example: "SUPER_USER"
 *                 - type: object
 *                   description: Response for ORG_ADMIN
 *                   properties:
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["organisation.read", "organisation.update", "users.create", "users.read", "project.create", "assessments.create"]
 *                     role:
 *                       type: string
 *                       example: "ORG_ADMIN"
 *                     systemRole:
 *                       type: string
 *                       example: "ORG_ADMIN"
 *                 - type: object
 *                   description: Response for ORG_USER with role-based permissions
 *                   properties:
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["users.read", "project.list", "assessments.read"]
 *                     role:
 *                       type: string
 *                       example: "NallaHealth_ProjectAdmin"
 *                     systemRole:
 *                       type: string
 *                       example: "ORG_USER"
 *                 - type: object
 *                   description: Response for user with no role in organisation
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "User has no role in this organisation"
 *                     actions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: []
 *                     role:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     systemRole:
 *                       type: string
 *                       example: "ORG_USER"
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Internal server error
 */
router.get("/:organisationId/user/permissions", authenticateToken, getUserPermissionsInOrganisation);  //! No checkPermission needed here since user is getting their own permissions

/**
 * @swagger
 * /organisations/{organisationId}/users/{userId}/delete:
 *   delete:
 *     summary: Delete a user and their roles in an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-5678"
 *     responses:
 *       200:
 *         description: User and their roles deleted successfully
 *       404:
 *         description: User not found in organisation
 *       500:
 *         description: Error deleting user and their roles
 */
router.delete("/:organisationId/users/:userId/delete", authenticateToken, checkPermission("users.delete"), deleteUserAndRolesInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/users/{userId}:
 *   delete:
 *     summary: Remove a user from an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-5678"
 *     responses:
 *       200:
 *         description: User removed successfully
 *       404:
 *         description: User not found in organisation
 *       500:
 *         description: Error removing user
 */
router.delete("/:organisationId/users/:userId", authenticateToken, checkPermission("users.delete"), removeUserFromOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/roles:
 *   post:
 *     summary: Create a role within an organisation
 *     tags: [Organisations-Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Manager"
 *               description:
 *                 type: string
 *                 example: "Oversees operations"
 *               createdBy:
 *                 type: string
 *                 example: "user-12345"
 *               updatedBy:
 *                 type: string
 *                 example: "user-12345"
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Role already exists
 *       500:
 *         description: Error creating role
 */
router.post("/:organisationId/roles", authenticateToken, checkPermission("roles.create"), createRoleInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/roles:
 *   get:
 *     summary: List roles within an organisation
 *     tags: [Organisations-Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved roles
 *       500:
 *         description: Error retrieving roles
 */
router.get("/:organisationId/roles", authenticateToken, checkPermission("roles.list"), listRolesInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/roles/{roleId}:
 *   patch:
 *     summary: Update a role within an organisation
 *     tags: [Organisations-Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *                 example: "user-12345"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       500:
 *         description: Error updating role
 */
router.patch("/:organisationId/roles/:roleId", authenticateToken, checkPermission("roles.update"), updateRoleInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/roles/{roleId}:
 *   delete:
 *     summary: Delete a role within an organisation
 *     tags: [Organisations-Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-6789"
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       500:
 *         description: Error deleting role
 */
router.delete("/:organisationId/roles/:roleId", authenticateToken, checkPermission("roles.delete"), deleteRoleInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/roles/{roleId}/permissions:
 *   post:
 *     summary: Add permissions to a role
 *     tags: [Organisations-Permissions-Role-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["perm-1", "perm-2"]
 *     responses:
 *       200:
 *         description: Permissions added successfully
 *       400:
 *         description: Invalid permission IDs
 *       500:
 *         description: Error adding permissions
 */
router.post("/:organisationId/roles/:roleId/permissions", authenticateToken, checkPermission("roles.addPermissions"), addPermissionsToRole);

/**
 * @swagger
 * /organisations/{organisationId}/roles/{roleId}/permissions:
 *   delete:
 *     summary: Remove one or more permissions from a role
 *     tags: [Organisations-Permissions-Role-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["perm-1", "perm-2"]
 *     responses:
 *       200:
 *         description: Permissions removed successfully
 *       400:
 *         description: Invalid permission IDs
 *       500:
 *         description: Error removing permissions
 */
router.delete("/:organisationId/roles/:roleId/permissions", authenticateToken, checkPermission("roles.removePermissions"), removePermissionsFromRole);

/**
 * @swagger
 * /organisations/{organisationId}/roles/{roleId}/permissions:
 *   get:
 *     summary: List permissions associated with a role
 *     tags: [Organisations-Permissions-Role-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-6789"
 *     responses:
 *       200:
 *         description: Successfully retrieved permissions
 *       404:
 *         description: Role not found
 *       500:
 *         description: Error retrieving permissions
 */
router.get("/:organisationId/roles/:roleId/permissions", authenticateToken, checkPermission("permissions.list"), listPermissionsForRole);

/**
 * @swagger
 * /organisations/{organisationId}/permissions:
 *   post:
 *     summary: Create a permission within an organisation
 *     tags: [Organisations-Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "View Reports"
 *               description:
 *                 type: string
 *                 example: "Allows viewing of reports"
 *               createdBy:
 *                 type: string
 *                 example: "user-12345"
 *               updatedBy:
 *                 type: string
 *                 example: "user-12345"
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       400:
 *         description: Permission already exists
 *       500:
 *         description: Error creating permission
 */
router.post("/:organisationId/permissions", authenticateToken, checkPermission("permissions.create"), createPermissionInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/permissions:
 *   get:
 *     summary: List permissions within an organisation
 *     tags: [Organisations-Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved permissions
 *       500:
 *         description: Error retrieving permissions
 */
router.get("/:organisationId/permissions", authenticateToken, checkPermission("permissions.list"), listPermissionsInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/permissions/{permissionId}:
 *   patch:
 *     summary: Update a permission within an organisation
 *     tags: [Organisations-Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               updatedBy:
 *                 type: string
 *                 example: "user-12345"
 *     responses:
 *       200:
 *         description: Permission updated successfully
 *       500:
 *         description: Error updating permission
 */
router.patch("/:organisationId/permissions/:permissionId", authenticateToken, checkPermission("permissions.update"), updatePermissionInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/permissions/{permissionId}:
 *   delete:
 *     summary: Delete a permission within an organisation
 *     tags: [Organisations-Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-6789"
 *     responses:
 *       200:
 *         description: Permission deleted successfully
 *       500:
 *         description: Error deleting permission
 */
router.delete("/:organisationId/permissions/:permissionId", authenticateToken, checkPermission("permissions.delete"), deletePermissionInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/permissions/{permissionId}/actions:
 *   post:
 *     summary: Add multiple actions to a permission
 *     tags: [Organisations-Actions-Permission-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["action-12345", "action-67890"]
 *     responses:
 *       201:
 *         description: Actions added to permission successfully
 *       400:
 *         description: Invalid action IDs
 *       500:
 *         description: Error adding actions
 */
router.post("/:organisationId/permissions/:permissionId/actions", authenticateToken, checkPermission("permissions.addActions"), addActionToPermission);

/**
 * @swagger
 * /organisations/{organisationId}/permissions/{permissionId}/actions:
 *   delete:
 *     summary: Remove multiple actions from a permission
 *     tags: [Organisations-Actions-Permission-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["action-12345", "action-67890"]
 *     responses:
 *       200:
 *         description: Actions removed from permission successfully
 *       400:
 *         description: Invalid action IDs
 *       500:
 *         description: Error removing actions
 */
router.delete("/:organisationId/permissions/:permissionId/actions", authenticateToken, checkPermission("permissions.removeActions"), removeActionFromPermission);

/**
 * @swagger
 * /organisations/{organisationId}/permissions/{permissionId}/actions:
 *   get:
 *     summary: List actions associated with a permission
 *     tags: [Organisations-Actions-Permission-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-6789"
 *     responses:
 *       200:
 *         description: Successfully retrieved actions
 *       404:
 *         description: Permission not found
 *       500:
 *         description: Error retrieving actions
 */
router.get("/:organisationId/permissions/:permissionId/actions", authenticateToken, checkPermission("permissions.read"), listActionsForPermission);

/**
 * @swagger
 * /organisations/{organisationId}/projects:
 *   post:
 *     summary: Create a project within an organisation
 *     tags: [Organisations-Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Project Alpha"
 *               description:
 *                 type: string
 *                 example: "A new AI-based project"
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Project already exists
 *       500:
 *         description: Error creating project
 */
router.post("/:organisationId/projects", authenticateToken, checkPermission("project.create"), createProjectInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/projects:
 *   get:
 *     summary: List projects within an organisation
 *     tags: [Organisations-Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *       500:
 *         description: Error retrieving projects
 */
router.get("/:organisationId/projects", authenticateToken, checkPermission("project.list"), listProjectsInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}:
 *   patch:
 *     summary: Update a project within an organisation
 *     tags: [Organisations-Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       500:
 *         description: Error updating project
 */
router.patch("/:organisationId/projects/:projectId", authenticateToken, checkPermission("project.update"), updateProjectInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}:
 *   delete:
 *     summary: Delete a project within an organisation
 *     tags: [Organisations-Projects]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       500:
 *         description: Error deleting project
 */
router.delete("/:organisationId/projects/:projectId", authenticateToken, checkPermission("project.delete"), deleteProjectInOrganisation);

/**
 * @swagger
 * /organisations/getUserOrganisations/{userId}:
 *   get:
 *     summary: Fetch organisations of a user
 *     tags: [Organisations]
 *     security: 
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved organisations
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving organisations
 */
router.get("/getUserOrganisations/:userId", authenticateToken, listUserAllOrganisations);

/**
 * @swagger
 * /organisations/{organisationId}/actions:
 *   post:
 *     summary: Create an action within an organisation
 *     tags: [Organisations-Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Read"
 *               description:
 *                 type: string
 *                 example: "Allows reading data"
 *               extras:
 *                 type: object
 *                 example: { key: "value" }
 *     responses:
 *       201:
 *         description: Action created successfully
 *       400:
 *         description: Action already exists
 *       500:
 *         description: Error creating action
 */
router.post("/:organisationId/actions", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), createActionInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/actions:
 *   get:
 *     summary: List actions within an organisation (role-based)
 *     description: Returns different actions based on user's system role - SUPER_USER gets all actions, ORG_ADMIN gets bypass actions, ORG_USER gets database actions
 *     tags: [Organisations-Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved actions based on user role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 actions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "users.create"
 *                       name:
 *                         type: string
 *                         example: "users.create"
 *                       description:
 *                         type: string
 *                         example: "Action: users.create"
 *                       organisationId:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       extras:
 *                         type: object
 *                         example: {}
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       createdBy:
 *                         type: string
 *                         example: "system"
 *                       updatedBy:
 *                         type: string
 *                         example: "system"
 *               examples:
 *                 SUPER_USER:
 *                   summary: Response for SUPER_USER
 *                   value:
 *                     actions: [
 *                       {
 *                         "id": "users.create",
 *                         "name": "users.create",
 *                         "description": "Action: users.create"
 *                       },
 *                       {
 *                         "id": "system.manage-settings",
 *                         "name": "system.manage-settings", 
 *                         "description": "Action: system.manage-settings"
 *                       }
 *                     ]
 *                 ORG_ADMIN:
 *                   summary: Response for ORG_ADMIN
 *                   value:
 *                     actions: [
 *                       {
 *                         "id": "organisation.read",
 *                         "name": "organisation.read",
 *                         "description": "Action: organisation.read"
 *                       },
 *                       {
 *                         "id": "users.create",
 *                         "name": "users.create",
 *                         "description": "Action: users.create"
 *                       }
 *                     ]
 *       500:
 *         description: Error retrieving actions
 */
router.get("/:organisationId/actions", authenticateToken, checkPermission("actions.list"), listActionsInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/actions/{actionId}:
 *   patch:
 *     summary: Update an action within an organisation
 *     tags: [Organisations-Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "action-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               extras:
 *                 type: object
 *     responses:
 *       200:
 *         description: Action updated successfully
 *       500:
 *         description: Error updating action
 */
router.patch("/:organisationId/actions/:actionId", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), updateActionInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/actions/{actionId}:
 *   delete:
 *     summary: Delete an action within an organisation
 *     tags: [Organisations-Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "action-12345"
 *     responses:
 *       200:
 *         description: Action deleted successfully
 *       500:
 *         description: Error deleting action
 */
router.delete("/:organisationId/actions/:actionId", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), deleteActionInOrganisation);

/**
 * @swagger
 * /organisations/organisation-users/organisationId/{organisationId}:
 *   post:
 *     summary: Create a new user and add to an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["role-6789", "role-1234"]
 *     responses:
 *       201:
 *         description: User created and added to organisation successfully
 *       400:
 *         description: User is already a member of this organisation
 *       500:
 *         description: Error creating user or adding to organisation
 */
router.post("/organisation-users/organisationId/:organisationId", authenticateToken, checkPermission("organisation.add-user"), createOrganisationUser);

/**
 * @swagger
 * /organisations/{organisationId}/users-roles:
 *   get:
 *     summary: List all users and their roles in an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved users and roles
 *       404:
 *         description: No users found in this organisation
 *       500:
 *         description: Error retrieving users and roles
 */
router.get("/:organisationId/users-roles", authenticateToken, checkPermission("users.list"), listOrganisationUsersAndRoles);

/**
 * @swagger
 * /organisations/{organisationId}/users/{userId}/roles/{roleId}:
 *   delete:
 *     summary: Delete a user's role in an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-5678"
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-6789"
 *     responses:
 *       200:
 *         description: User role deleted successfully
 *       404:
 *         description: User role not found in organisation
 *       500:
 *         description: Error deleting user role
 */
router.delete("/:organisationId/users/:userId/roles/:roleId", authenticateToken, checkPermission("users.assignRoles"), deleteUserRoleInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/users/{userId}:
 *   patch:
 *     summary: Update user details and roles in an organisation
 *     tags: [Organisation-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-5678"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 example: "john.doe@example.com"
 *               roleIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["role-12345", "role-67890"]
 *     responses:
 *       200:
 *         description: User details and roles updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user details
 */
router.patch("/:organisationId/users/:userId", authenticateToken, checkPermission("users.update"), updateOrganisationUser);

/**
 * @swagger
 * /organisations/{organisationId}/users/{userId}/projects:
 *   get:
 *     summary: List projects assigned to a user within an organisation
 *     tags: [Organisations-Projects-Users]
 *     security: 
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved projects
 *       404:
 *         description: User not found in organisation
 *       500:
 *         description: Error retrieving projects
 */
router.get("/:organisationId/users/:userId/projects", authenticateToken, checkPermission("project.list"), listUserProjectsInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/users:
 *   post:
 *     summary: Assign users to a project
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user-1", "user-2"]
 *                role:
 *                 type: object
 *                 example: { "roleName": "Developer", "permissions": ["read", "write"] }
 *     responses:
 *       200:
 *         description: Users assigned successfully
 *       400:
 *         description: Invalid user IDs
 *       500:
 *         description: Error assigning users
 */
router.post("/:organisationId/projects/:projectId/users", authenticateToken, checkPermission("users.assignToProject"), assignUsersToProject);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/user/{userId}:
 *   get:
 *     summary: Get a user assigned to a project within an organisation
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: user not found
 *       500:
 *         description: Error retrieving user
 */
router.get("/:organisationId/projects/:projectId/user/:userId", authenticateToken, checkPermission("users.read"), getUserInProject);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/users/all:
 *   get:
 *     summary: List all Users assigned to a project within an organisation
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       500:
 *         description: Error retrieving users
 */
router.get("/:organisationId/projects/:projectId/users/all", authenticateToken, checkPermission("users.list"), listUsersInProject);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/usersassign:
 *   post:
 *     summary: Create a User to a project within an organisation
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               extras:
 *                 type: object
 *                 example: { "key": "value" }
 *               contactId:
 *                 type: string
 *                 example: "user-1234"
 *               relationship:
 *                 type: string
 *                 example: "Guardian"
 *               roleId:
 *                 type: string
 *                 description: "Single role ID for backward compatibility"
 *                 example: "role-67890"
 *               roleIds:
 *                 type: array
 *                 description: "Array of role IDs for multiple role assignment"
 *                 items:
 *                   type: string
 *                 example: ["role-67890", "role-12345"]
 *     responses:
 *       201:
 *         description: User added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error adding user
 */
router.post("/:organisationId/projects/:projectId/usersassign", authenticateToken, checkPermission("users.assignToProject"), addUserToProject);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/user/{Id}:
 *   patch:
 *     summary: Update a user's details in a project within an organisation
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "student@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               extras:
 *                 type: object
 *                 example: { "key": "updatedValue" }
 *               roleId:
 *                 type: string
 *                 description: "Single role ID for backward compatibility"
 *                 example: "role-12345"
 *               roleIds:
 *                 type: array
 *                 description: "Array of role IDs for multiple role assignment"
 *                 items:
 *                   type: string
 *                 example: ["role-12345", "role-67890"]
 *               contactNo:
 *                 type: string
 *                 example: "9876543210"
 *               relationship:
 *                 type: string
 *                 example: "Guardian"
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error updating user
 */
router.patch("/:organisationId/projects/:projectId/user/:Id", authenticateToken, checkPermission("users.update"), updateProjectUser);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/users/{Id}:
 *   delete:
 *     summary: Remove a user from a project within an organisation
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: User removed successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error removing user
 */
router.delete("/:organisationId/projects/:projectId/users/:Id", authenticateToken, checkPermission("users.delete"), removeProjectUser);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/unassign/{userId}:
 *   delete:
 *     summary: Unassign a user from a project (keeps user in organization)
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: User unassigned from project successfully
 *       404:
 *         description: User not found in organization or not assigned to project
 *       500:
 *         description: Error unassigning user from project
 */
router.delete("/:organisationId/projects/:projectId/unassign/:userId", authenticateToken, checkPermission("users.assignToProject"), unassignUserFromProject);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/unassign/{userId}:
 *   delete:
 *     summary: Unassign a user from a project (keeps user in organization)
 *     tags: [Organisations-Projects-Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: User unassigned from project successfully
 *       404:
 *         description: User not found in organization or not assigned to project
 *       500:
 *         description: Error unassigning user from project
 */
router.delete("/:organisationId/projects/:projectId/unassign/:userId", authenticateToken, checkPermission("users.assignToProject"), unassignUserFromProject);

/**
 * @swagger
 * /organisations/{organisationId}/project/{projectId}/assessments:
 *   post:
 *     summary: Create an assessment schedule within a project
 *     tags: [Organisation-Project-Assessment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - questionnaireId
 *               - groupIds
 *               - dateRanges
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Monthly Health Assessment"
 *                 description: "Title of the assessment schedule"
 *               description:
 *                 type: string
 *                 example: "Monthly recurring health assessment for all employees"
 *                 description: "Description of the assessment schedule"
 *               questionnaireId:
 *                 type: string
 *                 example: "quest-12345"
 *                 description: "ID of the questionnaire to use for this assessment"
 *               groupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["group-123", "group-456"]
 *                 description: "Array of user group IDs to assign this assessment to"
 *               dateRanges:
 *                 type: array
 *                 description: "Array of date range objects defining when assessments should be active"
 *                 items:
 *                   type: object
 *                   required:
 *                     - startDate
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-02-01"
 *                       description: "Start date for the assessment instance (YYYY-MM-DD)"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-02-15"
 *                       description: "End date for the assessment instance (YYYY-MM-DD). If not provided, will be auto-calculated using questionnaire's minSpanDays"
 *                 example: 
 *                   - startDate: "2024-02-01"
 *                     endDate: "2024-02-15"
 *                   - startDate: "2024-03-01"
 *                     endDate: "2024-03-15"
 *                   - startDate: "2024-04-01"
 *                     endDate: "2024-04-15"
 *     responses:
 *       201:
 *         description: Assessment schedule created successfully with multiple assessment instances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Assessment schedule created successfully"
 *                 assessmentSchedule:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     questionnaireId:
 *                       type: string
 *                     projectId:
 *                       type: string
 *                 assessmentInstances:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       assessmentScheduleId:
 *                         type: string
 *       400:
 *         description: Validation error - invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "dateRange 2: endDate must be after startDate"
 *       404:
 *         description: Referenced resource not found (questionnaire or groups)
 *       500:
 *         description: Internal server error
 */
router.post("/project/:projectId/assessments", authenticateToken, checkPermission("assessments.create"), createAssessment);

/**
 * @swagger
 * /organisations/project/{projectId}/assessments:
 *   get:
 *     summary: List all assessment schedules and their instances within a project
 *     tags: [Organisation-Project-Assessment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment schedules and instances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assessmentSchedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       questionnaireId:
 *                         type: string
 *                       projectId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       assessments:
 *                         type: array
 *                         description: "Assessment instances created from this schedule"
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             startDate:
 *                               type: string
 *                               format: date-time
 *                             endDate:
 *                               type: string
 *                               format: date-time
 *                             assessmentScheduleId:
 *                               type: string
 *       500:
 *         description: Error retrieving assessments
 */
router.get("/project/:projectId/assessments", authenticateToken, checkPermission("assessments.list"), listAssessments);

/**
 * @swagger
 * /organisations/project/{projectId}/assessments/{assessmentId}:
 *   get:
 *     summary: Get an assessment schedule or assessment instance by ID
 *     tags: [Organisation-Project-Assessment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-12345"
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "schedule-12345 or instance-12345"
 *         description: "ID of either an assessment schedule or assessment instance"
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               oneOf:
 *                 - type: object
 *                   title: "Assessment Schedule"
 *                   properties:
 *                     assessmentSchedule:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         description:
 *                           type: string
 *                         questionnaireId:
 *                           type: string
 *                         projectId:
 *                           type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         assessments:
 *                           type: array
 *                           description: "Related assessment instances"
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               startDate:
 *                                 type: string
 *                                 format: date-time
 *                               endDate:
 *                                 type: string
 *                                 format: date-time
 *                 - type: object
 *                   title: "Assessment Instance"
 *                   properties:
 *                     assessment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         startDate:
 *                           type: string
 *                           format: date-time
 *                         endDate:
 *                           type: string
 *                           format: date-time
 *                         assessmentScheduleId:
 *                           type: string
 *                         projectId:
 *                           type: string
 *       404:
 *         description: Assessment schedule or instance not found
 *       500:
 *         description: Error retrieving assessment
 */
router.get("/project/:projectId/assessments/:assessmentId", authenticateToken, checkPermission("assessments.read"), getAssessment);

/**
 * @swagger
 * /organisations/project/{projectId}/assessments/{assessmentId}:
 *   patch:
 *     summary: Update an assessment schedule or assessment instance
 *     tags: [Organisation-Project-Assessment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-12345"
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "schedule-12345 or instance-12345"
 *         description: "ID of either an assessment schedule or assessment instance"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 title: "Update Assessment Schedule"
 *                 description: "For updating assessment schedules (creates new assessment instances if dateRanges provided)"
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "Updated Monthly Health Assessment"
 *                   description:
 *                     type: string
 *                     example: "Updated description for the assessment schedule"
 *                   questionnaireId:
 *                     type: string
 *                     example: "quest-67890"
 *                     description: "ID of the questionnaire to use"
 *                   groupIds:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["group-789", "group-012"]
 *                     description: "Array of user group IDs to assign this assessment to"
 *                   dateRanges:
 *                     type: array
 *                     description: "Array of date range objects. Providing this will recreate all assessment instances"
 *                     items:
 *                       type: object
 *                       required:
 *                         - startDate
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-02-01"
 *                         endDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-02-15"
 *                     example: 
 *                       - startDate: "2024-02-01"
 *                         endDate: "2024-02-15"
 *                       - startDate: "2024-03-01"
 *                         endDate: "2024-03-15"
 *               - type: object
 *                 title: "Update Assessment Instance"
 *                 description: "For updating individual assessment instances (only dates can be updated)"
 *                 properties:
 *                   dateRange:
 *                     type: object
 *                     required:
 *                       - startDate
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-02-01"
 *                         description: "New start date for the assessment instance"
 *                       endDate:
 *                         type: string
 *                         format: date
 *                         example: "2024-02-15"
 *                         description: "New end date for the assessment instance (defaults to 15 days after start if not provided)"
 *     responses:
 *       200:
 *         description: Assessment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Assessment schedule updated successfully"
 *                 assessmentSchedule:
 *                   type: object
 *                   description: "Returned when updating a schedule"
 *                 assessment:
 *                   type: object
 *                   description: "Returned when updating an instance"
 *       400:
 *         description: Validation error or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "dateRange 1: Invalid startDate format"
 *       404:
 *         description: Assessment schedule or instance not found
 *       500:
 *         description: Internal server error
 */
router.patch("/project/:projectId/assessments/:assessmentId", authenticateToken, checkPermission("assessments.update"), updateAssessment);

/**
 * @swagger
 * /organisations/project/{projectId}/assessments/{assessmentId}:
 *   delete:
 *     summary: Delete an assessment schedule or assessment instance
 *     tags: [Organisation-Project-Assessment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-12345"
 *       - in: path
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "schedule-12345 or instance-12345"
 *         description: "ID of either an assessment schedule or assessment instance"
 *     responses:
 *       200:
 *         description: Assessment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   oneOf:
 *                     - example: "Assessment schedule and all related instances deleted successfully"
 *                       description: "When deleting a schedule"
 *                     - example: "Assessment instance deleted successfully"  
 *                       description: "When deleting an instance"
 *       404:
 *         description: Assessment schedule or instance not found
 *       500:
 *         description: Error deleting assessment
 */
router.delete("/project/:projectId/assessments/:assessmentId", authenticateToken, checkPermission("assessments.delete"), deleteAssessment);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups:
 *   post:
 *     summary: Create a new assessment group
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Group A"
 *               projectId:
 *                 type: string
 *                 example: "proj-12345"
 *               managerId:
 *                 type: string
 *                 example: "user-12345"
 *     responses:
 *       201:
 *         description: Assessment group created successfully
 *       500:
 *         description: Error creating assessment group
 */
router.post("/:organisationId/assessment-groups", authenticateToken, checkPermission("groups.create"), createAssessmentGroup);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups:
 *   get:
 *     summary: List all assessment groups within an organisation
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment groups
 *       500:
 *         description: Error retrieving assessment groups
 */
router.get("/:organisationId/assessment-groups", authenticateToken, checkPermission("groups.list"), listAssessmentGroups);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups/{groupId}:
 *   get:
 *     summary: Get an assessment group by ID
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment group
 *       404:
 *         description: Assessment group not found
 *       500:
 *         description: Error retrieving assessment group
 */
router.get("/:organisationId/assessment-groups/:groupId", authenticateToken, checkPermission("groups.read"), getAssessmentGroup);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups/{groupId}:
 *   patch:
 *     summary: Update an assessment group
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               managerId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assessment group updated successfully
 *       404:
 *         description: Assessment group not found
 *       500:
 *         description: Error updating assessment group
 */
router.patch("/:organisationId/assessment-groups/:groupId", authenticateToken, checkPermission("groups.update"), updateAssessmentGroup);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups/{groupId}:
 *   delete:
 *     summary: Delete an assessment group
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group-12345"
 *     responses:
 *       200:
 *         description: Assessment group deleted successfully
 *       404:
 *         description: Assessment group not found
 *       500:
 *         description: Error deleting assessment group
 */
router.delete("/:organisationId/assessment-groups/:groupId", authenticateToken, checkPermission("groups.delete"), deleteAssessmentGroup);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups/{groupId}/members:
 *   post:
 *     summary: Add multiple users to an assessment group
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user-1", "user-2"]
 *     responses:
 *       201:
 *         description: Users added to group successfully
 *       500:
 *         description: Error adding users to group
 */
router.post("/:organisationId/assessment-groups/:groupId/members", authenticateToken, checkPermission("groups.addUserToGroup"), addUsersToGroup);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-groups/{groupId}/members/{memberId}:
 *   delete:
 *     summary: Remove a user from an assessment group
 *     tags: [Organisation-Assessment-Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         example: "group-12345"
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         example: "member-12345"
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *       404:
 *         description: User not found in group
 *       500:
 *         description: Error removing user from group
 */
router.delete("/:organisationId/assessment-groups/:groupId/members/:memberId", authenticateToken, checkPermission("groups.addUserToGroup"), removeUserFromGroup);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-assignments:
 *   post:
 *     summary: Create a new assessment assignment
 *     tags: [Assessment-Assignments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               submittedBy:
 *                 type: string
 *               submittedAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               responses:
 *                 type: object
 *               report:
 *                 type: object
 *               assessmentId:
 *                 type: string
 *               accessCode:
 *                 type: string
 *               accessSecret:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: "Optional start date for the assignment"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: "Optional end date for the assignment"
 *     responses:
 *       201:
 *         description: Assessment assignment created successfully
 *       500:
 *         description: Error creating assessment assignment
 */
router.post("/:organisationId/assessment-assignments", authenticateToken, checkPermission("assignments.create"), createAssessmentAssignment);

/**
 * @swagger
 * /organisations/{organisationId}/groups/{groupId}/assignment-report:
 *   get:
 *     summary: Get group level assignment report
 *     description: Retrieves all assignments for a specific group across all their assessments. Shows completed, pending, and not started assignments for reporting purposes.
 *     tags: [Assessment Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The organisation ID
 *         example: "org-12345"
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: The group ID to get assignment report for
 *         example: "group-12345"
 *     responses:
 *       200:
 *         description: Group assignment report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userName:
 *                         type: string
 *                       assessmentName:
 *                         type: string
 *                       status:
 *                         type: string
 *                       groupName:
 *                         type: string
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *       400:
 *         description: Bad request - missing group ID
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Access denied - insufficient permissions
 *       500:
 *         description: Error retrieving group assignment report
 */
router.get("/:organisationId/groups/:groupId/assignment-report", authenticateToken, checkPermission("assessments.read"), getGroupAssignmentReport);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/school-assignment-report:
 *   get:
 *     summary: Get school level assignment report for all groups in a project
 *     tags: [Assessment Reports]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The organisation ID
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID
 *     responses:
 *       200:
 *         description: School assignment report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assignments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AssignmentReport'
 *                 questionnaire:
 *                   $ref: '#/components/schemas/Questionnaire'
 *       400:
 *         description: Bad request - missing project ID
 *       401:
 *         description: Unauthorized - authentication required
 *       403:
 *         description: Access denied - insufficient permissions
 *       500:
 *         description: Error retrieving school assignment report
 */
router.get("/:organisationId/projects/:projectId/school-assignment-report", authenticateToken, checkPermission("assessments.read"), getSchoolAssignmentReport);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-assignments:
 *   get:
 *     summary: List assessment assignments for a specific assessment
 *     description: |
 *       Retrieves all assignment records for a specific assessment. Shows all users who are part of groups assigned to the assessment,
 *       regardless of whether they've started the assessment or not. This is a simplified version without complex RBAC filtering.
 *     tags: [Assessment-Assignments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *         description: The organisation ID
 *       - in: query
 *         name: assessmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The assessment ID to list assignments for (required)
 *         example: "assessment-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assignments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         nullable: true
 *                         description: Assignment ID (null if user hasn't started)
 *                       userName:
 *                         type: string
 *                         description: Name of the user
 *                       assessmentName:
 *                         type: string
 *                         description: Title of the assessment schedule
 *                       questionnaire:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           title:
 *                             type: string
 *                       status:
 *                         type: string
 *                         description: Assignment status (NOT_STARTED, IN_PROGRESS, COMPLETED, etc.)
 *                       responses:
 *                         type: object
 *                         nullable: true
 *                         description: Assessment responses (null if not started)
 *                       accessSecret:
 *                         type: string
 *                         nullable: true
 *                         description: Access secret (null if not started)
 *                       accessCode:
 *                         type: string
 *                         nullable: true
 *                         description: Access code (null if not started)
 *                       userId:
 *                         type: string
 *                         description: ID of the user
 *                       assessmentId:
 *                         type: string
 *                         description: ID of the assessment instance
 *                       groupId:
 *                         type: string
 *                         description: ID of the user's group
 *                       groupName:
 *                         type: string
 *                         description: Name of the user's group
 *                       startDate:
 *                         type: string
 *                         format: date-time
 *                         description: Assessment start date
 *                       endDate:
 *                         type: string
 *                         format: date-time
 *                         description: Assessment end date
 *                       submittedAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                         description: Submission timestamp (null if not submitted)
 *                       hasStarted:
 *                         type: boolean
 *                         description: Whether the user has started the assessment
 *       400:
 *         description: Bad request - Assessment ID is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Assessment ID is required to list assignments"
 *       404:
 *         description: Assessment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Assessment not found"
 *       500:
 *         description: Error retrieving assessment assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving assessment assignments"
 *                 error:
 *                   type: object
 */
router.get("/:organisationId/assessment-assignments", authenticateToken, checkPermission("assignments.list"), listAssessmentAssignments);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/my-assignments:
 *   get:
 *     summary: List assignments for the current user and their alternate contacts
 *     description: Fetches all assessment assignments for the logged-in user and any users for whom they are an alternate contact within the specified project.
 *     tags: [Assessment-Assignments]

 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-12345"
 *     responses:
 *       '200':
 *         description: Successfully retrieved user's assignments.
 *       '401':
 *         description: User not authenticated.
 *       '400':
 *         description: Project ID is required.
 *       '500':
 *         description: Internal server error.
 */
router.get("/:organisationId/projects/:projectId/my-assignments", authenticateToken, checkPermission("assessments.performAssessment"), listMyAssignments);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/start-assessment:
 *   post:
 *     summary: Start an assessment (creates assignment entry)
 *     tags: [Assessment-Assignments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "project-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assessmentInstanceId
 *             properties:
 *               assessmentInstanceId:
 *                 type: string
 *                 example: "assessment-instance-12345"
 *     responses:
 *       201:
 *         description: Assessment started successfully
 *       400:
 *         description: Assessment instance ID required or assignment already exists
 *       401:
 *         description: User not authenticated
 *       403:
 *         description: User not authorized for this assessment
 *       404:
 *         description: Assessment not found or not available
 *       500:
 *         description: Internal server error
 */
router.post("/:organisationId/projects/:projectId/start-assessment", authenticateToken, checkPermission("assessments.performAssessment"), startAssessment);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-assignments/{assignmentId}:
 *   get:
 *     summary: Get an assessment assignment by ID
 *     tags: [Assessment-Assignments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "assignment-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved assessment assignment
 *       404:
 *         description: Assessment assignment not found
 *       500:
 *         description: Error retrieving assessment assignment
 */
router.get("/:organisationId/assessment-assignments/:assignmentId", authenticateToken, checkPermission("assignments.read"), getAssessmentAssignment);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-assignments/{assignmentId}:
 *   patch:
 *     summary: Update an assessment assignment
 *     tags: [Assessment-Assignments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "assignment-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userGroupId:
 *                 type: string
 *               assignedBy:
 *                 type: string
 *               submittedBy:
 *                 type: string
 *               submittedAt:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               responses:
 *                 type: object
 *               report:
 *                 type: object
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: "Optional start date for the assignment"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: "Optional end date for the assignment"
 *     responses:
 *       200:
 *         description: Assessment assignment updated successfully
 *       404:
 *         description: Assessment assignment not found
 *       500:
 *         description: Error updating assessment assignment
 */
router.patch("/:organisationId/assessment-assignments/:assignmentId", authenticateToken, checkPermission("assignments.update"), updateAssessmentAssignment);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-assignments/{assignmentId}:
 *   delete:
 *     summary: Delete an assessment assignment
 *     tags: [Assessment-Assignments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "assignment-12345"
 *     responses:
 *       200:
 *         description: Assessment assignment deleted successfully
 *       404:
 *         description: Assessment assignment not found
 *       500:
 *         description: Error deleting assessment assignment
 */
router.delete("/:organisationId/assessment-assignments/:assignmentId", authenticateToken, checkPermission("assignments.delete"), deleteAssessmentAssignment);

/**
 * @swagger
 * /organisations/{organisationId}/assessment-assignments/{assignmentId}/response:
 *   patch:
 *     summary: Update responses for an assessment assignment
 *     tags: [Assessment-Assignments]
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         example: "assignment-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - responses
 *             properties:
 *               responses:
 *                 type: object
 *                 description: Assessment responses object
 *     responses:
 *       200:
 *         description: Responses updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Responses updated successfully"
 *       400:
 *         description: Missing responses in request body
 *       404:
 *         description: Assignment not found for this organisation
 *       500:
 *         description: Internal server error
 */
router.patch("/:organisationId/assessment-assignments/:assignmentId/response", updateAssessmentAssignmentResponses);

/**
 * @swagger
 * /organisations/{organisationId}/group-admins:
 *   get:
 *     summary: Fetch all Group Admins in an organisation
 *     tags: [Organisation-Assessment-Role-User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved Group Admins
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "user-12345"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       404:
 *         description: No Group Admins found
 *       500:
 *         description: Error fetching Group Admins
 */
router.get("/:organisationId/group-admins", authenticateToken, checkPermission("users.list"), getGroupAdminsInOrganisation);

/**
 * @swagger
 * /organisations/{organisationId}/project-group-users:
 *   get:
 *     summary: Fetch user IDs and names for an organisation
 *     tags: [Organisation-Project-Group-User]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved user IDs and names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                         example: "user-12345"
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *       404:
 *         description: No users found
 *       500:
 *         description: Error fetching users
 */
router.get("/:organisationId/project-group-users", authenticateToken, checkPermission("users.list"), getProjectGroupUsers);

/**
 * @swagger
 * /organisations/assessment-assignments/verify:
 *   post:
 *     summary: Verify accessCode and accessSecret for an assessment assignment
 *     tags: [Assessment-Assignments]
 *     security: 
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessCode:
 *                 type: string
 *                 example: "abc12"
 *               accessSecret:
 *                 type: string
 *                 example: "xyz34"
 *     responses:
 *       200:
 *         description: Successfully verified and retrieved assessment assignment
 *       404:
 *         description: Invalid accessCode or accessSecret
 *       500:
 *         description: Error verifying assessment assignment
 */
// router.post("/assessment-assignments/verify", authenticateToken, checkPermission("assignments.read"), verifyAssessmentAssignment);
router.post("/assessment-assignments/verify", verifyAssessmentAssignment);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/userId/{userId}/alternate-contacts:
 *   post:
 *     summary: Add an alternate contact for a user in a project
 *     tags: [Organisations-Projects-Users-Alternatecontact-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contactId:
 *                 type: string
 *                 example: "user-67890"
 *               relationship:
 *                 type: string
 *                 example: "Guardian"
 *     responses:
 *       201:
 *         description: Alternate contact added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error adding alternate contact
 */
router.post("/:organisationId/projects/:projectId/userId/:userId/alternate-contacts", authenticateToken, checkPermission("users.assignAlternateUsers"), addAlternateContact);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/alternate-contacts/{alternateContactId}:
 *   delete:
 *     summary: Remove an alternate contact for a user in a project
 *     tags: [Organisations-Projects-Users-Alternatecontact-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *       - in: path
 *         name: alternateContactId
 *         required: true
 *         schema:
 *           type: string
 *         example: "alt-contact-12345"
 *         description: "ID of the alternateContact record"
 *     responses:
 *       200:
 *         description: Alternate contact removed successfully
 *       404:
 *         description: Alternate contact not found
 *       500:
 *         description: Error removing alternate contact
 */
router.delete("/:organisationId/projects/:projectId/alternate-contacts/:alternateContactId", authenticateToken, checkPermission("users.assignAlternateUsers"), removeAlternateContact);

/**
 * @swagger
 * /organisations/{organisationId}/projects/{projectId}/users/alternatecontact/check-email:
 *   post:
 *     summary: Check if email exists for alternate contact
 *     tags: [Organisations-Projects-Users-Alternatecontact-Assign]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj-6789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Email check completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     user:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "User found"
 *                     userDetails:
 *                       type: object
 *                 - type: object
 *                   properties:
 *                     user:
 *                       type: boolean
 *                       example: false
 *                     message:
 *                       type: string
 *                       example: "User not found"
 *       400:
 *         description: Bad request - Email is required
 *       500:
 *         description: Internal server error
 */
router.post("/:organisationId/projects/:projectId/users/alternatecontact/check-email", authenticateToken, checkPermission("users.read"), checkEmailForAlternateContact);

/**
 * @swagger
 * /organisations/{organisationId}/questionnaires:
 *   post:
 *     summary: Create a new questionnaire
 *     tags: [Questionnaires]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - slug
 *               - questionnaire
 *               - minSpanDays
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Mental Health Assessment"
 *               slug:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9-_]+$'
 *                 example: "mental-health-assessment"
 *               description:
 *                 type: string
 *                 example: "Comprehensive mental health evaluation questionnaire"
 *               questionnaire:
 *                 type: object
 *                 example: {"questions": [{"id": 1, "text": "How are you feeling?", "type": "text"}]}
 *               minSpanDays:
 *                 type: integer
 *                 minimum: 1
 *                 example: 15
 *     responses:
 *       201:
 *         description: Questionnaire created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Error creating questionnaire
 */
router.post("/:organisationId/questionnaires", authenticateToken, checkPermission("questionnaires.create"), createQuestionnaire);

/**
 * @swagger
 * /organisations/{organisationId}/questionnaires:
 *   get:
 *     summary: List all questionnaires in an organisation
 *     tags: [Questionnaires]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved questionnaires
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionnaires:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       slug:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       minSpanDays:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Error retrieving questionnaires
 */
router.get("/:organisationId/questionnaires", authenticateToken, checkPermission("questionnaires.list"), listQuestionnaires);

/**
 * @swagger
 * /organisations/{organisationId}/questionnaires/{questionnaireId}:
 *   get:
 *     summary: Get a specific questionnaire by ID
 *     tags: [Questionnaires]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: questionnaireId
 *         required: true
 *         schema:
 *           type: string
 *         example: "quest-67890"
 *     responses:
 *       200:
 *         description: Successfully retrieved questionnaire
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 questionnaire:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     questionnaire:
 *                       type: object
 *                     minSpanDays:
 *                       type: integer
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Questionnaire not found
 *       500:
 *         description: Error retrieving questionnaire
 */
router.get("/:organisationId/questionnaires/:questionnaireId", authenticateToken, checkPermission("questionnaires.read"), getQuestionnaire);

/**
 * @swagger
 * /organisations/{organisationId}/questionnaires/{questionnaireId}:
 *   patch:
 *     summary: Update a questionnaire
 *     tags: [Questionnaires]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: questionnaireId
 *         required: true
 *         schema:
 *           type: string
 *         example: "quest-67890"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slug:
 *                 type: string
 *                 pattern: '^[a-zA-Z0-9-_]+$'
 *                 example: "updated-mental-health-assessment"
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questionnaire:
 *                 type: object
 *               minSpanDays:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Questionnaire updated successfully
 *       404:
 *         description: Questionnaire not found
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Error updating questionnaire
 */
router.patch("/:organisationId/questionnaires/:questionnaireId", authenticateToken, checkPermission("questionnaires.update"), updateQuestionnaire);

/**
 * @swagger
 * /organisations/{organisationId}/questionnaires/{questionnaireId}:
 *   delete:
 *     summary: Delete a questionnaire
 *     tags: [Questionnaires]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org-12345"
 *       - in: path
 *         name: questionnaireId
 *         required: true
 *         schema:
 *           type: string
 *         example: "quest-67890"
 *     responses:
 *       200:
 *         description: Questionnaire deleted successfully
 *       404:
 *         description: Questionnaire not found
 *       400:
 *         description: Cannot delete questionnaire that is in use
 *       500:
 *         description: Error deleting questionnaire
 */
router.delete("/:organisationId/questionnaires/:questionnaireId", authenticateToken, checkPermission("questionnaires.delete"), deleteQuestionnaire);

export default router;
