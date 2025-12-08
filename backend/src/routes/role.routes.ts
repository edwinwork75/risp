import express from "express";
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  addPermissionToRole,
  removePermissionFromRole,
} from "../controllers/role.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { checkPermission, requireSystemRole } from "../middleware/rbac.middleware";
import { SystemRole } from "@prisma/client";

const router = express.Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: List all roles
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved roles
 *       500:
 *         description: Error retrieving roles
 */
router.get("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved role
 *       404:
 *         description: Role not found
 *       500:
 *         description: Error retrieving role
 */
router.get("/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), getRole);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Admin"
 *               description:
 *                 type: string
 *                 example: "Administrator role"
 *     responses:
 *       201:
 *         description: Role created successfully
 *       500:
 *         description: Error creating role
 */
router.post("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), createRole);

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     summary: Update role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-12345"
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
 *         description: Role updated successfully
 *       500:
 *         description: Error updating role
 */
router.patch("/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-12345"
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       500:
 *         description: Error deleting role
 */
router.delete("/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), deleteRole);

/**
 * @swagger
 * /roles/{roleId}/permissions:
 *   post:
 *     summary: Add permission to role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissionId:
 *                 type: string
 *                 example: "perm-12345"
 *     responses:
 *       200:
 *         description: Permission added to role successfully
 *       500:
 *         description: Error adding permission to role
 */
router.post("/:roleId/permissions", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), addPermissionToRole);

/**
 * @swagger
 * /roles/{roleId}/permissions/{permissionId}:
 *   delete:
 *     summary: Remove permission from role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         example: "role-12345"
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-12345"
 *     responses:
 *       200:
 *         description: Permission removed from role successfully
 *       500:
 *         description: Error removing permission from role
 */
router.delete("/:roleId/permissions/:permissionId", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), removePermissionFromRole);

export default router;
