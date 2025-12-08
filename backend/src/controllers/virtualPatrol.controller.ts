// // backend/src/controllers/virtualPatrol.controller.ts
// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// // Helper function to handle errors
// const handleError = (res: Response, error: any) => {
//     res.status(500).json({ message: "An error occurred", error });
// };

// // VirtualPatrol_Routes
// export const createVirtualPatrolRoute = async (req: Request, res: Response): Promise<void> => {
//     const { name, projectId } = req.body;

//     try {
//         // Check if the projectId exists in the Project table
//         const projectExists = await prisma.project.findUnique({
//             where: { id: projectId },
//         });

//         if (!projectExists) {
//             res.status(400).json({ message: "Invalid projectId: Project does not exist" });
//             return;
//         }

//         // Proceed to create the VirtualPatrol_Route
//         const newRoute = await prisma.virtualPatrol_Routes.create({
//             data: { name, projectId },
//         });

//         res.status(201).json(newRoute);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const getAllVirtualPatrolRoutes = async (req: Request, res: Response): Promise<void> => {
//     const { projectId } = req.params;
//     try {
//         // Retrieve routes based on the projectId
//         const routes = await prisma.virtualPatrol_Routes.findMany({
//             where: { projectId },
//         });

//         res.status(200).json(routes);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const getVirtualPatrolRouteById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const route = await prisma.virtualPatrol_Routes.findUnique({ where: { id: req.params.id } });
//         if (!route) {
//             res.status(404).json({ message: "Route not Exits" });
//         } else {
//             res.status(200).json(route);
//         }
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const updateVirtualPatrolRoute = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const { name, projectId } = req.body;

//     try {
//         // Check if the projectId exists in the Project table
//         if (projectId) {
//             const projectExists = await prisma.project.findUnique({
//                 where: { id: projectId },
//             });

//             if (!projectExists) {
//                 res.status(400).json({ message: "Invalid projectId: Project does not exist" });
//                 return;
//             }
//         }

//         // Proceed to update the VirtualPatrol_Route
//         const updatedRoute = await prisma.virtualPatrol_Routes.update({
//             where: { id },
//             data: { name, projectId },
//         });

//         res.status(200).json(updatedRoute);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const deleteVirtualPatrolRoute = async (req: Request, res: Response) => {
//     try {
//         await prisma.virtualPatrol_Routes.delete({ where: { id: req.params.id } });
//         res.status(200).json({ message: "Route deleted successfully" });
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// // VirtualPatrol_RouteCameras

// export const createVirtualPatrolRouteCamera = async (req: Request, res: Response): Promise<void> => {
//     const { routeId, cameraId, order, questionnaire } = req.body;

//     try {
//         // Fetch the route and its projectId
//         const route = await prisma.virtualPatrol_Routes.findUnique({
//             where: { id: routeId },
//             select: { projectId: true },
//         });

//         if (!route) {
//             res.status(400).json({ message: "Invalid routeId: Route does not exist" });
//             return;
//         }

//         // Fetch the camera and its projectId
//         const camera = await prisma.device.findUnique({
//             where: { id: cameraId },
//             select: { projectId: true },
//         });

//         if (!camera) {
//             res.status(400).json({ message: "Invalid cameraId: Camera does not exist" });
//             return;
//         }

//         // Compare projectIds
//         if (route.projectId !== camera.projectId) {
//             res.status(400).json({ message: "Route does not belong to this Camera , check whether camera is allocated to this project" });
//             return;
//         }

//         // Proceed to create the VirtualPatrol_RouteCamera with the projectId
//         const newCamera = await prisma.virtualPatrol_RouteCameras.create({
//             data: { routeId, cameraId, order, questionnaire, projectId: route.projectId },
//         });

//         res.status(201).json(newCamera);
//     } catch (error) {
//         handleError(res, error);
//     }
// };
// export const getAllVirtualPatrolRouteCameras = async (req: Request, res: Response): Promise<void> => {
//     const { routeId } = req.params;

//     try {
//         // Retrieve cameras based on the routeId
//         const cameras = await prisma.virtualPatrol_RouteCameras.findMany({
//             where: { routeId },
//         });

//         res.status(200).json(cameras);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const getVirtualPatrolRouteCameraById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const camera = await prisma.virtualPatrol_RouteCameras.findUnique({ where: { id: req.params.id } });
//         if (!camera) {
//             res.status(404).json({ message: "Camera not found" });
//         }
//         else {
//             res.status(200).json(camera);
//         }
//     } catch (error) {
//         handleError(res, error);
//     }
// };
// // backend/src/controllers/virtualPatrol.controller.ts

// export const updateVirtualPatrolRouteCamera = async (req: Request, res: Response): Promise<void> => {
//     const { routeId, cameraId, order, questionnaire } = req.body;
//     const { id } = req.params;

//     try {
//         let routeProjectId: string | null = null;
//         let cameraProjectId: string | null = null;

//         // Check if the routeId exists and fetch its projectId
//         if (routeId) {
//             const route = await prisma.virtualPatrol_Routes.findUnique({
//                 where: { id: routeId },
//                 select: { projectId: true },
//             });

//             if (!route) {
//                 res.status(400).json({ message: "Invalid routeId: Route does not exist" });
//                 return;
//             }

//             routeProjectId = route.projectId;
//         }

//         // Check if the cameraId exists and fetch its projectId
//         if (cameraId) {
//             const camera = await prisma.device.findUnique({
//                 where: { id: cameraId },
//                 select: { projectId: true },
//             });

//             if (!camera) {
//                 res.status(400).json({ message: "Invalid cameraId: Camera does not exist" });
//                 return;
//             }

//             cameraProjectId = camera.projectId;
//         }

//         // Compare projectIds if both are provided
//         if (routeProjectId && cameraProjectId && routeProjectId !== cameraProjectId) {
//             res.status(400).json({ message: "Route does not belong to this Camera" });
//             return;
//         }

//         // Proceed to update the VirtualPatrol_RouteCamera
//         const updatedCamera = await prisma.virtualPatrol_RouteCameras.update({
//             where: { id },
//             data: { routeId, cameraId, order, questionnaire, projectId: routeProjectId },
//         });

//         res.status(200).json(updatedCamera);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const deleteVirtualPatrolRouteCamera = async (req: Request, res: Response) => {
//     try {
//         await prisma.virtualPatrol_RouteCameras.delete({ where: { id: req.params.id } });
//         res.status(200).json({ message: "Camera Route deleted successfully" });
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// // VirtualPatrol_Schedules
// // backend/src/controllers/virtualPatrol.controller.ts

// export const createVirtualPatrolSchedule = async (req: Request, res: Response): Promise<void> => {
//     const { name, description, startTime, endTime, startDate, endDate, projectId, status } = req.body;
//     const isDeleted = req.body.isDeleted ?? false;

//     try {
//         // Check if the projectId exists in the Project table
//         const projectExists = await prisma.project.findUnique({
//             where: { id: projectId },
//         });

//         if (!projectExists) {
//             res.status(400).json({ message: "Invalid projectId: Project does not exist" });
//             return;
//         }

//         // Proceed to create the VirtualPatrol_Schedule
//         const newSchedule = await prisma.virtualPatrol_Schedules.create({
//             data: { name, description, startTime, endTime, startDate, endDate, projectId, status, isDeleted },
//         });
//         res.status(201).json(newSchedule);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const getAllVirtualPatrolSchedules = async (req: Request, res: Response) => {
//     const { projectId, date } = req.params; // Extract date from req.params
//     try {
//         // Parse the date from the path parameter
//         const targetDate = new Date(date as string);

//         // Retrieve schedules based on the projectId and date range
//         const schedules = await prisma.virtualPatrol_Schedules.findMany({
//             where: {
//                 projectId,
//                 startDate: { lte: targetDate },
//                 endDate: { gte: targetDate },
//                 isDeleted: false,
//             },
//         });

//         for (const schedule of schedules) {
//             // Fetch routes for each schedule
//             const scheduleRoutes = await prisma.virtualPatrol_ScheduleRoutes.findMany({
//                 where: {
//                     scheduleId: schedule.id,
//                 },
//             });

//             let allSessionsCompleted = true;

//             for (const route of scheduleRoutes) {
//                 // Check schedule sessions for each route
//                 const sessions = await prisma.virtualPatrol_ScheduleSession.findMany({
//                     where: {
//                         scheduleRouteId: route.id,
//                         date: targetDate,
//                         status: { not: "pending" },
//                     },
//                 });

//                 // If no sessions are found, skip updating this schedule
//                 if (sessions.length === 0) {
//                     allSessionsCompleted = false;
//                     break;
//                 }
//                 // Check if all sessions are completed
//                 else if (sessions.some(session => session.status !== "completed")) {
//                     allSessionsCompleted = false;
//                     break;
//                 }
//             }

//             // Update schedule status if all sessions are completed
//             if (allSessionsCompleted) {
//                 await prisma.virtualPatrol_Schedules.update({
//                     where: { id: schedule.id },
//                     data: { status: "completed" },
//                 });
//             }
//             else{
//                 await prisma.virtualPatrol_Schedules.update({
//                     where: { id: schedule.id },
//                     data: { status: "pending" },
//                 });
//             }
//         }

//         // Fetch updated schedules to return
//         const updatedSchedules = await prisma.virtualPatrol_Schedules.findMany({
//             where: {
//                 projectId,
//                 startDate: { lte: targetDate },
//                 endDate: { gte: targetDate },
//                 isDeleted: false,
//             },
//         });

//         res.status(200).json(updatedSchedules);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const getAllVirtualPatrolSchedulesWithoutDate = async (req: Request, res: Response) => {
//     const { projectId } = req.params;

//     try {
//         // Retrieve all schedules based on the projectId
//         const schedules = await prisma.virtualPatrol_Schedules.findMany({
//             where: {
//                 projectId,
//                 isDeleted: false,
//             },
//         });

//         res.status(200).json(schedules);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const getVirtualPatrolScheduleById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const schedule = await prisma.virtualPatrol_Schedules.findUnique({ where: { id: req.params.id } });
//         if (!schedule) {
//             res.status(404).json({ message: "Schedule not found" });
//         }
//         else {
//             res.status(200).json(schedule);
//         }
//     } catch (error) {
//         handleError(res, error);
//     }
// };
// // backend/src/controllers/virtualPatrol.controller.ts

// export const updateVirtualPatrolSchedule = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const { name, startTime, endTime, startDate, endDate, projectId, status, isDeleted } = req.body;

//     try {
//         // Check if the projectId exists in the Project table
//         if (projectId) {
//             const projectExists = await prisma.project.findUnique({
//                 where: { id: projectId },
//             });

//             if (!projectExists) {
//                 res.status(400).json({ message: "Invalid projectId: Project does not exist" });
//                 return;
//             }
//         }

//         // Proceed to update the VirtualPatrol_Schedule
//         const updatedSchedule = await prisma.virtualPatrol_Schedules.update({
//             where: { id },
//             data: { name, startTime, endTime, startDate, endDate, projectId, status, isDeleted },
//         });

//         res.status(200).json(updatedSchedule);
//     } catch (error) {
//         handleError(res, error);
//     }
// };
// export const deleteVirtualPatrolSchedule = async (req: Request, res: Response) => {
//     try {
//         await prisma.virtualPatrol_Schedules.update({
//             where: { id: req.params.id },
//             data: { isDeleted: true },
//         });

//         res.status(200).json({ message: "Schedule deleted successfully" });
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const createVirtualPatrolScheduleRoute = async (req: Request, res: Response): Promise<void> => {
//     const { scheduleId, routeId, order, status } = req.body;
//     const isDeleted = req.body.isDeleted ?? false;

//     try {
//         // Check if the scheduleId exists and fetch its projectId
//         const schedule = await prisma.virtualPatrol_Schedules.findUnique({
//             where: { id: scheduleId },
//             select: { projectId: true },
//         });

//         if (!schedule) {
//             res.status(400).json({ message: "Invalid scheduleId: Schedule does not exist" });
//             return;
//         }

//         // Check if the routeId exists and fetch its projectId
//         const route = await prisma.virtualPatrol_Routes.findUnique({
//             where: { id: routeId },
//             select: { projectId: true },
//         });

//         if (!route) {
//             res.status(400).json({ message: "Invalid routeId: Route does not exist" });
//             return;
//         }

//         // Compare projectIds
//         if (schedule.projectId !== route.projectId) {
//             res.status(400).json({ message: "Either schedule or route doesn't belong to this project" });
//             return;
//         }

//         // Proceed to create the VirtualPatrol_ScheduleRoute with the projectId
//         const newScheduleRoute = await prisma.virtualPatrol_ScheduleRoutes.create({
//             data: { scheduleId, routeId, order, isDeleted },
//         });

//         res.status(201).json(newScheduleRoute);
//     } catch (error) {
//         handleError(res, error);
//     }
// };

// export const createMultipleVirtualPatrolScheduleRoutes = async (req: Request, res: Response): Promise<void> => {
//     const { scheduleId, routeId: routeIds, status } = req.body; // Renaming routeId to routeIds for clarity
//     const isDeleted = req.body.isDeleted ?? false;
//     console.log(req.body);

//     try {
//         const newScheduleRoutes = [];

//         // Check if the scheduleId exists and fetch its projectId
//         const schedule = await prisma.virtualPatrol_Schedules.findUnique({
//             where: { id: scheduleId },
//             select: { projectId: true },
//         });

//         if (!schedule) {
//             res.status(400).json({ message: "Invalid scheduleId: Schedule does not exist" });
//             return;
//         }

//         for (let i = 0; i < routeIds.length; i++) {
//             const routeId = routeIds[i]; // Use the individual routeId
//             const order = i + 1;

//             // Check if the routeId exists and fetch its projectId
//             const route = await prisma.virtualPatrol_Routes.findUnique({
//                 where: { id: routeId },
//                 select: { projectId: true },
//             });

//             if (!route) {
//                 res.status(400).json({ message: `Invalid routeId at index ${i}: Route does not exist` });
//                 return;
//             }

//             // Compare projectIds
//             if (schedule.projectId !== route.projectId) {
//                 res.status(400).json({ message: `Project ID mismatch at index ${i}: Either schedule or route doesn't belong to this project` });
//                 return;
//             }

//             // Proceed to create the VirtualPatrol_ScheduleRoute with the projectId
//             const newScheduleRoute = await prisma.virtualPatrol_ScheduleRoutes.create({
//                 data: { scheduleId, routeId, order,  isDeleted },
//             });

//             newScheduleRoutes.push(newScheduleRoute);
//         }

//         res.status(201).json(newScheduleRoutes);
//     } catch (error) {
//         console.error("Error creating schedule routes:", error);
//         handleError(res, error);
//     }
// };

// export const getAllVirtualPatrolScheduleRoutes = async (req: Request, res: Response): Promise<void> => {
//     const scheduleId = req.params.scheduleId || req.query.scheduleId; // Support both route and query params
//     console.log(scheduleId);
//     try {
//         // Retrieve schedule routes based on scheduleId (if provided)
//         const scheduleRoutes = await prisma.virtualPatrol_ScheduleRoutes.findMany({
//             where: {
//                 isDeleted: false,
//                 ...(scheduleId ? { scheduleId: scheduleId as string } : {}), // Apply filter only if scheduleId exists
//             },
//         });

//         res.status(200).json(scheduleRoutes);
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "Unknown error";
//         res.status(500).json({ error: "Internal Server Error", details: errorMessage });
//     }
// };

// export const getVirtualPatrolScheduleRouteById = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const scheduleRoute = await prisma.virtualPatrol_ScheduleRoutes.findUnique({ where: { id: req.params.id } });
//         if (!scheduleRoute) { res.status(404).json({ message: "Schedule route not found" }); }
//         else {
//             res.status(200).json(scheduleRoute);
//         }
//     } catch (error) {
//         handleError(res, error);
//     }
// };


// export const updateVirtualPatrolScheduleRoute = async (req: Request, res: Response): Promise<void> => {
//     const { scheduleId, routeId, order, status, isDeleted } = req.body;
//     const { id } = req.params;

//     try {
//         // Check if the scheduleId exists and fetch its projectId
//         let scheduleProjectId: string | null = null;
//         if (scheduleId) {
//             const schedule = await prisma.virtualPatrol_Schedules.findUnique({
//                 where: { id: scheduleId },
//                 select: { projectId: true },
//             });

//             if (!schedule) {
//                 res.status(400).json({ message: "Invalid scheduleId: Schedule does not exist" });
//                 return;
//             }

//             scheduleProjectId = schedule.projectId;
//         }

//         // Check if the routeId exists and fetch its projectId
//         let routeProjectId: string | null = null;
//         if (routeId) {
//             const route = await prisma.virtualPatrol_Routes.findUnique({
//                 where: { id: routeId },
//                 select: { projectId: true },
//             });

//             if (!route) {
//                 res.status(400).json({ message: "Invalid routeId: Route does not exist" });
//                 return;
//             }

//             routeProjectId = route.projectId;
//         }

//         // Compare projectIds
//         if (scheduleProjectId && routeProjectId && scheduleProjectId !== routeProjectId) {
//             res.status(400).json({ message: "Either schedule or route doesn't belong to this project" });
//             return;
//         }

//         // Proceed to update the VirtualPatrol_ScheduleRoute with the projectId
//         const updatedScheduleRoute = await prisma.virtualPatrol_ScheduleRoutes.update({
//             where: { id },
//             data: { scheduleId, routeId, order, isDeleted },
//         });

//         res.status(200).json(updatedScheduleRoute);
//     } catch (error) {
//         handleError(res, error);
//     }
// };
// export const deleteVirtualPatrolScheduleRoute = async (req: Request, res: Response) => {
//     try {
//         await prisma.virtualPatrol_ScheduleRoutes.update({
//             where: { id: req.params.id },
//             data: { isDeleted: true },
//         });
//         res.status(200).json({ message: "Schedule route deleted successfully" });
//     } catch (error) {
//         handleError(res, error);
//     }
// };


// export const getOrCreateScheduleSession = async (req: Request, res: Response): Promise<void> => {
//     const { scheduleRouteId, date } = req.params;
//     console.log(req.params)
//     try {
//         // Parse the date from the query parameter
//         const targetDate = new Date(date as string);

//         // Check if a session already exists for the given scheduleRouteId and date
//         let session = await prisma.virtualPatrol_ScheduleSession.findFirst({
//             where: {
//                 scheduleRouteId,
//                 date: targetDate,
//             },
//         });

//         if (!session) {
//             const scheduleRoute = await prisma.virtualPatrol_ScheduleRoutes.findUnique({
//                 where: { id: scheduleRouteId },
//                 include: { schedule: true },
//             });

//             if (!scheduleRoute) {
//                 res.status(404).json({ message: "Schedule route not found" });
//                 return;
//             }

//             const { schedule } = scheduleRoute;

//             // Check if the target date is within the schedule's start and end dates
//             if (schedule.startDate && schedule.endDate && targetDate >= schedule.startDate && targetDate <= schedule.endDate) {
//                 // Create a new session
//                 session = await prisma.virtualPatrol_ScheduleSession.create({
//                     data: {
//                         scheduleRouteId,
//                         date: targetDate,
//                         report: {},
//                         status: "pending",
//                     },
//                 });
//             } else {
//                 res.status(400).json({ message: "Date is not within the schedule's start and end dates" });
//                 return;
//             }
//         }

//         res.status(200).json(session);
//     } catch (error) {
//         res.status(500).json({ message: "An error occurred", error });
//     }
// };

// export const listScheduleSessionsByRouteId = async (req: Request, res: Response): Promise<void> => {
//     const { scheduleRouteId } = req.params;
//     console.log("Received scheduleRouteId:", scheduleRouteId);
//     try {
//         // Retrieve all sessions for the given scheduleRouteId
//         const sessions = await prisma.virtualPatrol_ScheduleSession.findMany({
//             where: {
//                 scheduleRouteId,
//             },
//         });

//         if (sessions.length === 0) {
//             res.status(404).json({ message: "No schedule sessions found for the given scheduleRouteId" });
//             return;
//         }

//         res.status(200).json(sessions);
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "Unknown error";
//         res.status(500).json({ error: "Internal Server Error", details: errorMessage });
//     }
// };


// export const updateVirtualPatrolScheduleSession = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const { scheduleRouteId, date, report, status, submittedTime } = req.body;

//     try {
//         // Proceed to update the VirtualPatrol_ScheduleSession
//         const updatedSession = await prisma.virtualPatrol_ScheduleSession.update({
//             where: { id },
//             data: {
//                 scheduleRouteId,
//                 date: date ? new Date(date) : undefined, // Convert date to Date object if provided
//                 report,
//                 status,
//                 submittedTime: submittedTime ? new Date(submittedTime) : undefined, // Convert submittedTime to Date object if provided
//             },
//         });

//         res.status(200).json(updatedSession);
//     } catch (error) {
//         res.status(500).json({ message: "An error occurred", error });
//     }
// };