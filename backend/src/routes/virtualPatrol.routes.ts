// // backend/src/routes/virtualPatrol.routes.ts
// import express from "express";
// import {
//     createVirtualPatrolRoute,
//     getAllVirtualPatrolRoutes,
//     getVirtualPatrolRouteById,
//     updateVirtualPatrolRoute,
//     deleteVirtualPatrolRoute,
//     createVirtualPatrolRouteCamera,
//     getAllVirtualPatrolRouteCameras,
//     getVirtualPatrolRouteCameraById,
//     updateVirtualPatrolRouteCamera,
//     deleteVirtualPatrolRouteCamera,
//     createVirtualPatrolSchedule,
//     getAllVirtualPatrolSchedules,
//     getVirtualPatrolScheduleById,
//     updateVirtualPatrolSchedule,
//     deleteVirtualPatrolSchedule,
//     createVirtualPatrolScheduleRoute,
//     getAllVirtualPatrolScheduleRoutes,
//     getVirtualPatrolScheduleRouteById,
//     updateVirtualPatrolScheduleRoute,
//     deleteVirtualPatrolScheduleRoute,
//     getOrCreateScheduleSession,
//     updateVirtualPatrolScheduleSession,
//     getAllVirtualPatrolSchedulesWithoutDate,
//     createMultipleVirtualPatrolScheduleRoutes,
//     listScheduleSessionsByRouteId,

// } from "../controllers/virtualPatrol.controller";
// import { authenticateToken } from "../middleware/auth.middleware";

// const router = express.Router();

// /**
//  * @swagger
//  * tags:
//  *   name: Virtual Patrol
//  *   description: API for managing Virtual Patrols
//  */

// // VirtualPatrol_Routes
// /**
//  * @swagger
//  * /virtualPatrol/routes/project/{projectId}:
//  *   get:
//  *     summary: Get all virtual patrol routes of a project
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: projectId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: List of virtual patrol routes
//  */
// router.get("/routes/project/:projectId", authenticateToken, getAllVirtualPatrolRoutes);

// /**
//  * @swagger
//  * /virtualPatrol/routes/{id}:
//  *   get:
//  *     summary: Get a virtual patrol route by ID
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol route details
//  *       404:
//  *         description: Route not found
//  */
// router.get("/routes/:id", authenticateToken, getVirtualPatrolRouteById);

// /**
//  * @swagger
//  * /virtualPatrol/routes:
//  *   post:
//  *     summary: Create a new virtual patrol route
//  *     tags: [Virtual Patrol]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               projectId:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Virtual patrol route created
//  */
// router.post("/routes/", authenticateToken, createVirtualPatrolRoute);

// /**
//  * @swagger
//  * /virtualPatrol/routes/{id}:
//  *   patch:
//  *     summary: Update a virtual patrol route
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               projectId:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol route updated
//  */
// router.patch("/routes/:id", authenticateToken, updateVirtualPatrolRoute);

// /**
//  * @swagger
//  * /virtualPatrol/routes/{id}:
//  *   delete:
//  *     summary: Delete a virtual patrol route
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol route deleted
//  */
// router.delete("/routes/:id", authenticateToken, deleteVirtualPatrolRoute);

// // VirtualPatrol_RouteCameras
// /**
//  * @swagger
//  * /virtualPatrol/allRouteCameras/{routeId}:
//  *   get:
//  *     summary: Get all virtual patrol route cameras based on Route ID
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: routeId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: List of virtual patrol route cameras
//  */
// router.get("/allRouteCameras/:routeId", authenticateToken, getAllVirtualPatrolRouteCameras);

// /**
//  * @swagger
//  * /virtualPatrol/routeCameras/{id}:
//  *   get:
//  *     summary: Get a virtual patrol route camera by ID
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol route camera details
//  *       404:
//  *         description: Camera not found
//  */
// router.get("/routeCameras/:id", authenticateToken, getVirtualPatrolRouteCameraById);

// /**
//  * @swagger
//  * /virtualPatrol/routeCameras:
//  *   post:
//  *     summary: Create a new virtual patrol route camera
//  *     tags: [Virtual Patrol]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               routeId:
//  *                 type: string
//  *               cameraId:
//  *                 type: string
//  *               order:
//  *                 type: integer
//  *               questionnaire:
//  *                 type: object
//  *     responses:
//  *       201:
//  *         description: Virtual patrol route camera created
//  */
// router.post("/routeCameras/", authenticateToken, createVirtualPatrolRouteCamera);

// /**
//  * @swagger
//  * /virtualPatrol/routeCameras/{id}:
//  *   patch:
//  *     summary: Update a virtual patrol route camera
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               routeId:
//  *                 type: string
//  *               cameraId:
//  *                 type: string
//  *               order:
//  *                 type: integer
//  *               questionnaire:
//  *                 type: object
//  *     responses:
//  *       200:
//  *         description: Virtual patrol route camera updated
//  */
// router.patch("/routeCameras/:id", authenticateToken, updateVirtualPatrolRouteCamera);

// /**
//  * @swagger
//  * /virtualPatrol/routeCameras/{id}:
//  *   delete:
//  *     summary: Delete a virtual patrol route camera
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol route camera deleted
//  */
// router.delete("/routeCameras/:id", authenticateToken, deleteVirtualPatrolRouteCamera);

// // VirtualPatrol_Schedules
// /**
//  * @swagger
//  * /virtualPatrol/schedules/project/{projectId}/date/{date}:
//  *   get:
//  *     summary: Get all virtual patrol schedules with projectId and date
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: projectId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: path
//  *         name: date
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: date
//  *     responses:
//  *       200:
//  *         description: List of virtual patrol schedules
//  */
// router.get("/schedules/project/:projectId/date/:date", authenticateToken, getAllVirtualPatrolSchedules);

// /**
//  * @swagger
//  * /virtualPatrol/schedules/project/{projectId}/all:
//  *   get:
//  *     summary: Get all virtual patrol schedules for a project without a date filter
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: projectId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: List of all virtual patrol schedules
//  */
// router.get("/schedules/project/:projectId/all", authenticateToken, getAllVirtualPatrolSchedulesWithoutDate);
// /**
//  * @swagger
//  * /virtualPatrol/schedules/{id}:
//  *   get:
//  *     summary: Get a virtual patrol schedule by ID
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule details
//  *       404:
//  *         description: Schedule not found
//  */
// router.get("/schedules/:id", authenticateToken, getVirtualPatrolScheduleById);

// /**
//  * @swagger
//  * /virtualPatrol/schedules:
//  *   post:
//  *     summary: Create a new virtual patrol schedule
//  *     tags: [Virtual Patrol]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               description:
//  *                 type: string
//  *                 nullable: true
//  *               startTime:
//  *                 type: string
//  *                 format: date-time
//  *               endTime:
//  *                 type: string
//  *                 format: date-time
//  *               startDate:
//  *                 type: string
//  *                 format: date-time
//  *               endDate:
//  *                 type: string
//  *                 format: date-time
//  *               projectId:
//  *                 type: string
//  *                 nullable: true
//  *               status:
//  *                 type: string
//  *                 nullable: true
//  *               isDeleted:
//  *                 type: boolean
//  *                 nullable: true
//  *     responses:
//  *       201:
//  *         description: Virtual patrol schedule created
//  */
// router.post("/schedules/", authenticateToken, createVirtualPatrolSchedule);

// /**
//  * @swagger
//  * /virtualPatrol/schedules/{id}:
//  *   patch:
//  *     summary: Update a virtual patrol schedule
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *            schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *               Description:
//  *                 type: string
//  *                 nullable: true
//  *               startTime:
//  *                 type: string
//  *                 format: date-time
//  *               endTime:
//  *                 type: string
//  *                 format: date-time
//  *               startDate:
//  *                 type: string
//  *                 format: date-time
//  *               endDate:
//  *                 type: string
//  *                 format: date-time
//  *               projectId:
//  *                 type: string
//  *                 nullable: true
//  *               status:
//  *                 type: string
//  *                 nullable: true
//  *               isDeleted:
//  *                 type: boolean
//  *                 nullable: true
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule updated
//  */
// router.patch("/schedules/:id", authenticateToken, updateVirtualPatrolSchedule);

// /**
//  * @swagger
//  * /virtualPatrol/schedules/{id}:
//  *   delete:
//  *     summary: Delete a virtual patrol schedule
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule deleted
//  */
// router.delete("/schedules/:id", authenticateToken, deleteVirtualPatrolSchedule);

// // VirtualPatrol_ScheduleRoutes

// /**
//  * @swagger
//  * /virtualPatrol/scheduleRoutes/scheduleId/{scheduleId}:
//  *   get:
//  *     summary: Get all virtual patrol schedule routes by scheduleID
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: scheduleId
//  *         required: true
//  *         schema:
//  *           type: string
//  *           description: ScheduleId
//  *     responses:
//  *       200:
//  *         description: List of virtual patrol schedule routes
//  */
// router.get("/scheduleRoutes/scheduleId/:scheduleId", authenticateToken, getAllVirtualPatrolScheduleRoutes);
// /**
//  * @swagger
//  * /virtualPatrol/scheduleRoutes/{id}:
//  *   get:
//  *     summary: Get a virtual patrol schedule route by ID
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule route details
//  *       404:
//  *         description: Schedule route not found
//  */
// router.get("/scheduleRoutes/:id", authenticateToken, getVirtualPatrolScheduleRouteById);

// /**
//  * @swagger
//  * /virtualPatrol/scheduleRoutes:
//  *   post:
//  *     summary: Create a new virtual patrol schedule route
//  *     tags: [Virtual Patrol]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *            schema:
//  *             type: object
//  *             properties:
//  *               scheduleId:
//  *                 type: string
//  *               routeId:
//  *                 type: string
//  *               order:
//  *                 type: integer
//  *               status:
//  *                 type: string
//  *                 nullable: true
//  *               isDeleted:
//  *                 type: boolean
//  *                 nullable: true
//  *     responses:
//  *       201:
//  *         description: Virtual patrol schedule route created
//  */
// router.post("/scheduleRoutes/", authenticateToken, createVirtualPatrolScheduleRoute);


// /**
//  * @swagger
//  * /virtualPatrol/scheduleRoutes/batch:
//  *   post:
//  *     summary: Create multiple virtual patrol schedule routes
//  *     tags: [Virtual Patrol]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *            schema:
//  *             type: object
//  *             properties:
//  *               scheduleId:
//  *                 type: string
//  *               routeId:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *               order:
//  *                 type: integer
//  *               status:
//  *                 type: string
//  *                 nullable: true
//  *               isDeleted:
//  *                 type: boolean
//  *                 nullable: true
//  *     responses:
//  *       201:
//  *         description: Virtual patrol schedule routes created
//  */
// router.post("/scheduleRoutes/batch", authenticateToken, createMultipleVirtualPatrolScheduleRoutes);
// // 

// /**
//  * @swagger
//  * /virtualPatrol/scheduleRoutes/{id}:
//  *   patch:
//  *     summary: Update a virtual patrol schedule route
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               scheduleId:
//  *                 type: string
//  *               routeId:
//  *                 type: string
//  *               order:
//  *                 type: integer
//  *               report:
//  *                 type: object
//  *               status:
//  *                 type: string
//  *               submittedTime:
//  *                 format: date-time
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule route updated
//  */
// router.patch("/scheduleRoutes/:id", authenticateToken, updateVirtualPatrolScheduleRoute);

// /**
//  * @swagger
//  * /virtualPatrol/scheduleRoutes/{id}:
//  *   delete:
//  *     summary: Delete a virtual patrol schedule route
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule route deleted
//  */
// router.delete("/scheduleRoutes/:id", authenticateToken, deleteVirtualPatrolScheduleRoute);



// /**
//  * @swagger
//  * /virtualPatrol/scheduleSessions/{scheduleRouteId}/date/{date}:
//  *   get:
//  *     summary: Get or create a virtual patrol schedule session by scheduleRouteId and date
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: scheduleRouteId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: path
//  *         name: date
//  *         required: true
//  *         schema:
//  *           type: string
//  *           format: date
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule session details
//  *       400:
//  *         description: Date is not within the schedule's start and end dates
//  *       404:
//  *         description: Schedule route not found
//  */
// router.get("/scheduleSessions/:scheduleRouteId/date/:date", authenticateToken, getOrCreateScheduleSession);

// /**
//  * @swagger
//  * /virtualPatrol/scheduleSessions/{scheduleRouteId}:
//  *   get:
//  *     summary: List all virtual patrol schedule sessions by scheduleRouteId
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: scheduleRouteId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: List of virtual patrol schedule sessions
//  *       404:
//  *         description: Schedule route not found
//  */
// router.get("/scheduleSessions/:scheduleRouteId", authenticateToken, listScheduleSessionsByRouteId);
// // ... existing code ...

// /**
//  * @swagger
//  * /virtualPatrol/scheduleSessions/{id}:
//  *   patch:
//  *     summary: Update a virtual patrol schedule session
//  *     tags: [Virtual Patrol]
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               scheduleRouteId:
//  *                 type: string
//  *               date:
//  *                 type: string
//  *                 format: date-time
//  *               report:
//  *                 type: object
//  *               status:
//  *                 type: string
//  *               submittedTime:
//  *                 type: string
//  *                 format: date-time
//  *     responses:
//  *       200:
//  *         description: Virtual patrol schedule session updated
//  *       404:
//  *         description: Schedule session not found
//  */
// router.patch("/scheduleSessions/:id", authenticateToken, updateVirtualPatrolScheduleSession);


// export default router;