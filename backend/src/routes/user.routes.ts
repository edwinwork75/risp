import express from "express";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserInfo,
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireSystemRole } from "../middleware/rbac.middleware";
import { SystemRole } from "@prisma/client";

const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *       500:
 *         description: Error retrieving users
 */
router.get("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), getUsers);

/**
 * @swagger
 * /users/{userId}/org-projects:
 *   get:
 *     summary: Get user information including organisations and projects
 *     tags: [Users]
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
 *         description: Successfully retrieved user information
 *       500:
 *         description: Error retrieving user information
 */
router.get("/:userId/org-projects", authenticateToken,requireSystemRole(SystemRole.SUPER_USER), getUserInfo);


/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: Successfully retrieved user
 *       404:
 *         description: User not found
 *       500:
 *         description: Error retrieving user
 */
router.get("/:id", authenticateToken, getUser);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Error creating user
 */
router.post("/", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), createUser);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Error updating user
 */
router.patch("/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "user-12345"
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Error deleting user
 */
router.delete("/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), deleteUser);

export default router;