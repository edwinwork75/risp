import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireSystemRole } from "../middleware/rbac.middleware";
import { SystemRole } from "@prisma/client";
import {
  createAction,
  listActions,
  updateAction,
  deleteAction,
} from "../controllers/action.controller";

const router = Router();

/**
 * @swagger
 * /actions:
 *   post:
 *     summary: Create a new global action (SUPER_USER only)
 *     tags: [Actions]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Action name
 *                 example: "users.create"
 *               description:
 *                 type: string
 *                 description: Action description
 *                 example: "Create new users in the system"
 *     responses:
 *       201:
 *         description: Action created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Action created successfully"
 *                 action:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - SUPER_USER role required
 *       409:
 *         description: Action already exists
 */
router.post("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), createAction);

/**
 * @swagger
 * /actions:
 *   get:
 *     summary: List all global actions (SUPER_USER only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of actions retrieved successfully
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
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - SUPER_USER role required
 */
router.get("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), listActions);

/**
 * @swagger
 * /actions/{actionId}:
 *   patch:
 *     summary: Update a global action (SUPER_USER only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Action ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Action name
 *               description:
 *                 type: string
 *                 description: Action description
 *     responses:
 *       200:
 *         description: Action updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Action updated successfully"
 *                 action:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - SUPER_USER role required
 *       404:
 *         description: Action not found
 *       409:
 *         description: Action with this name already exists
 */
router.patch("/:actionId", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), updateAction);

/**
 * @swagger
 * /actions/{actionId}:
 *   delete:
 *     summary: Delete a global action (SUPER_USER only)
 *     tags: [Actions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: actionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Action ID
 *     responses:
 *       200:
 *         description: Action deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Action deleted successfully"
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - SUPER_USER role required
 *       404:
 *         description: Action not found
 *       409:
 *         description: Cannot delete action - it's being used
 */
router.delete("/:actionId", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), deleteAction);

export default router; 