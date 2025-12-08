// import express from 'express';
// import { syncVisitors, getLatestVisitors } from '../controllers/visitorManagement.controller';
// import { authenticateToken } from "../middleware/auth.middleware";
// import { asyncHandler } from '../utils/asyncHandler';


// const router = express.Router();

// /**
//  * @swagger
//  * /visitorManagement/sync:
//  *   post:
//  *     summary: Bulk upsert visitor records
//  *     description: Accepts an array of visitor records for bulk processing. Inserts new records or updates existing ones.
//  *     tags:
//  *       - Visitor Management
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: array
//  *             items:
//  *               type: object
//  *               properties:
//  *                 id:
//  *                   type: integer
//  *                 projectId:
//  *                   type: string
//  *                 createdBy:
//  *                   type: string
//  *                 name:
//  *                   type: string
//  *                 companyName:
//  *                   type: string
//  *                 idType:
//  *                   type: string
//  *                 idNumber:
//  *                   type: string
//  *                 phoneNumber:
//  *                   type: string
//  *                 visitingLocation:
//  *                   type: string
//  *                 purposeOfVisit:
//  *                   type: string
//  *                 vehicleNumber:
//  *                   type: string
//  *                 notes:
//  *                   type: string
//  *                 status:
//  *                   type: string
//  *                 photo:
//  *                   type: string
//  *                 checkInTime:
//  *                   type: string
//  *                   format: date-time
//  *                 checkOutTime:
//  *                   type: string
//  *                   format: date-time
//  *                 updatedAt:
//  *                   type: string
//  *                   format: date-time
//  *     responses:
//  *       200:
//  *         description: Successfully processed visitor records.
//  *       400:
//  *         description: Invalid request data.
//  *       500:
//  *         description: Internal server error.
//  */
// router.post('/sync', authenticateToken, asyncHandler(syncVisitors));

// /**
//  * @swagger
//  * /visitorManagement/allVisitors/{projectId}:
//  *   get:
//  *     summary: Get the latest 1000 visitor records
//  *     description: Fetches the latest 1000 visitor records for a specific project, filtered by start time, ordered by the updatedAt field in descending order.
//  *     tags:
//  *       - Visitor Management
//  *     parameters:
//  *       - in: path
//  *         name: projectId
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: The ID of the project to filter visitors.
//  *       - in: query
//  *         name: startTime
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: date-time
//  *         description: The start time to filter visitors.
//  *     responses:
//  *       200:
//  *         description: Successfully fetched visitor records.
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *       400:
//  *         description: Missing or invalid parameters.
//  *       500:
//  *         description: Internal server error.
//  */
// router.get('/allVisitors/:projectId', authenticateToken, asyncHandler(getLatestVisitors));

// export default router;
