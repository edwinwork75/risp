// import { PrismaClient } from '@prisma/client';
// import { Request, Response } from 'express';

// const prisma = new PrismaClient();



// export const syncVisitors = async (req: Request, res: Response) => {
//   try {
//     const visitors = req.body;
//     console.log('Visitors:', visitors);

//     if (!Array.isArray(visitors)) {
//       return res.status(400).json({ error: 'Request body must be an array of visitor records.' });
//     }

//     const upsertPromises = visitors.map((visitor) =>
//       prisma.visitorManagement.upsert({
//         where: { id: visitor.id },
//         update: {
//           projectId: visitor.projectId,
//           createdBy: visitor.createdBy,
//           name: visitor.name,
//           companyName: visitor.companyName,
//           idType: visitor.idType,
//           idNumber: visitor.idNumber,
//           phoneNumber: visitor.phoneNumber,
//           visitingLocation: visitor.visitingLocation,
//           purposeOfVisit: visitor.purposeOfVisit,
//           vehicleNumber: visitor.vehicleNumber,
//           notes: visitor.notes,
//           status: visitor.status,
//           photo: visitor.photo,
//           checkInTime: new Date(visitor.checkInTime),
//           checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : null,
//           updatedAt: new Date(visitor.updatedAt),
//         },
//         create: {
//           id: visitor.id,
//           projectId: visitor.projectId,
//           createdBy: visitor.createdBy,
//           name: visitor.name,
//           companyName: visitor.companyName,
//           idType: visitor.idType,
//           idNumber: visitor.idNumber,
//           phoneNumber: visitor.phoneNumber,
//           visitingLocation: visitor.visitingLocation,
//           purposeOfVisit: visitor.purposeOfVisit,
//           vehicleNumber: visitor.vehicleNumber,
//           notes: visitor.notes,
//           status: visitor.status,
//           photo: visitor.photo,
//           checkInTime: new Date(visitor.checkInTime),
//           checkOutTime: visitor.checkOutTime ? new Date(visitor.checkOutTime) : null,
//           updatedAt: new Date(visitor.updatedAt),
//         },
//       })
//     );

//     await Promise.all(upsertPromises);

//     res.status(200).json({ message: 'Visitor records processed successfully.' });
//   } catch (error) {
//     console.error('Error syncing visitors:', error);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };

// export const getLatestVisitors = async (req: Request, res: Response) => {
//   try {
//     const { projectId } = req.params;
//     const { startTime } = req.query;

//     if (!projectId) {
//       return res.status(400).json({ error: 'Project ID is required.' });
//     }

//     if (!startTime) {
//       return res.status(400).json({ error: 'Start time is required.' });
//     }

//     const visitors = await prisma.visitorManagement.findMany({
//       where: {
//         projectId,
//         updatedAt: {
//           gte: new Date(startTime as string), // Check updatedAt against startTime
//         },
//       },
//       orderBy: { updatedAt: 'desc' },
//       take: 1000,
//     });

//     // Convert BigInt values to strings
//     const serializedVisitors = visitors.map(visitor => ({
//       ...visitor,
//       id: visitor.id.toString(),
//     }));

//     res.status(200).json(serializedVisitors);
//   } catch (error) {
//     console.error('Error fetching latest visitors:', error);
//     res.status(500).json({ error: 'Internal server error.' });
//   }
// };
