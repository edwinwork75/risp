import express from "express";
import {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
} from "../controllers/dynamic.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { requireSystemRole } from "../middleware/rbac.middleware";
import { SystemRole } from "@prisma/client";


const router = express.Router();

/**
 * @swagger
 * /d/{model}:
 *   get:
 *     summary: Get all records for a model
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *     responses:
 *       200:
 *         description: Successfully retrieved records
 *       400:
 *         description: Invalid model name
 */
router.get("/:model", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), getAllRecords);

/**
 * @swagger
 * /d/{model}/{id}:
 *   get:
 *     summary: Get a record by ID
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Successfully retrieved record
 *       404:
 *         description: Record not found
 */
router.get("/:model/:id", authenticateToken, getRecordById);
//router.get("/:model/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), getRecordById);


/**
 * @swagger
 * /d/{model}:
 *   post:
 *     summary: Create a new record
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post("/:model", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), createRecord);

/**
 * @swagger
 * /d/{model}/{id}:
 *   patch:
 *     summary: Update a record by ID
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.patch("/:model/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), updateRecord);

/**
 * @swagger
 * /d/{model}/{id}:
 *   delete:
 *     summary: Delete a record by ID
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Record deleted successfully
 */
router.delete("/:model/:id", authenticateToken, requireSystemRole(SystemRole.SUPER_USER), deleteRecord);

/**
 * @swagger
 * /d/{model}/o/{organisationId}:
 *   get:
 *     summary: Get all records for a model within an organisation
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *     responses:
 *       200:
 *         description: Successfully retrieved records
 *       400:
 *         description: Invalid model or organisation ID
 */
router.get("/:model/o/:organisationId", authenticateToken, getAllRecords);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/{id}:
 *   get:
 *     summary: Get a record by ID within an organisation
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Successfully retrieved record
 *       404:
 *         description: Record not found
 */
router.get("/:model/o/:organisationId/:id", authenticateToken, getRecordById);

/**
 * @swagger
 * /d/{model}/o/{organisationId}:
 *   post:
 *     summary: Create a new record within an organisation
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post("/:model/o/:organisationId", authenticateToken, createRecord);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/{id}:
 *   patch:
 *     summary: Update a record by ID within an organisation
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.patch("/:model/o/:organisationId/:id", authenticateToken, updateRecord);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/{id}:
 *   delete:
 *     summary: Delete a record by ID within an organisation
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Record deleted successfully
 */
router.delete("/:model/o/:organisationId/:id", authenticateToken, deleteRecord);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/p/{projectId}:
 *   get:
 *     summary: Get all records for a model within an organisation and project
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj123"
 *     responses:
 *       200:
 *         description: Successfully retrieved records
 *       400:
 *         description: Invalid model, organisation ID, or project ID
 */
router.get("/:model/o/:organisationId/p/:projectId", authenticateToken, getAllRecords);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/p/{projectId}/{id}:
 *   get:
 *     summary: Get a record by ID within an organisation and project
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj123"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Successfully retrieved record
 *       404:
 *         description: Record not found
 */
router.get("/:model/o/:organisationId/p/:projectId/:id", authenticateToken, getRecordById);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/p/{projectId}:
 *   post:
 *     summary: Create a new record within an organisation and project
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post("/:model/o/:organisationId/p/:projectId", authenticateToken, createRecord);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/p/{projectId}/{id}:
 *   patch:
 *     summary: Update a record by ID within an organisation and project
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj123"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.patch("/:model/o/:organisationId/p/:projectId/:id", authenticateToken, updateRecord);

/**
 * @swagger
 * /d/{model}/o/{organisationId}/p/{projectId}/{id}:
 *   delete:
 *     summary: Delete a record by ID within an organisation and project
 *     tags: [Dynamic API]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: model
 *         required: true
 *         schema:
 *           type: string
 *         example: "user"
 *       - in: path
 *         name: organisationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "org123"
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: "proj123"
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "123"
 *     responses:
 *       200:
 *         description: Record deleted successfully
 */
router.delete("/:model/o/:organisationId/p/:projectId/:id", authenticateToken, deleteRecord);

export default router;
