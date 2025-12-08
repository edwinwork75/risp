import express from "express";
import {
  getPermissions,
  createPermission,
  addActionToPermission,
  removeActionFromPermission,
} from "../controllers/permission.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireSystemRole } from "../middleware/rbac.middleware";
import { SystemRole } from "@prisma/client";

const router = express.Router();

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: List all permissions
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved permissions
 *       500:
 *         description: Error retrieving permissions
 */
router.get("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), getPermissions);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
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
 *                 example: "read"
 *               description:
 *                 type: string
 *                 example: "Read permission"
 *     responses:
 *       201:
 *         description: Permission created successfully
 *       500:
 *         description: Error creating permission
 */
router.post("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), createPermission);

/**
 * @swagger
 * /permissions/{permissionId}/actions:
 *   post:
 *     summary: Add action to permission
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-12345"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 example: "create"
 *     responses:
 *       200:
 *         description: Action added to permission successfully
 *       500:
 *         description: Error adding action to permission
 */
router.post("/:permissionId/actions", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), addActionToPermission);

/**
 * @swagger
 * /permissions/{permissionId}/actions/{action}:
 *   delete:
 *     summary: Remove action from permission
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: string
 *         example: "perm-12345"
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *         example: "create"
 *     responses:
 *       200:
 *         description: Action removed from permission successfully
 *       500:
 *         description: Error removing action from permission
 */
router.delete("/:permissionId/actions/:action", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), removeActionFromPermission);

export default router;
