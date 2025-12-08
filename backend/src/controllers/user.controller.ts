import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Get user ID from auth middleware
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user){
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password,name} = req.body;
    const user = await prisma.user.create({
      data: { email, password, name, createdBy: req.body.createdBy },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error creating user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
};
export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Fetch organisationIds from OrgUser table using userId
    const orgUserEntries = await prisma.orgUser.findMany({
      where: { userId },
      select: { id: true, organisationId: true },
    });
    console.log("orgUserEntries", orgUserEntries);

    const organisationIds = orgUserEntries.map((entry: { organisationId: string }) => entry.organisationId);

    // Fetch organisation details and projects for each organisation
    const organisations = await Promise.all(
      organisationIds.map(async (organisationId : string) => {
        // Fetch organisation details
        const organisation = await prisma.organisation.findUnique({
          where: { id: organisationId },
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
            subscriptions: true,
          },
        });
        console.log("organisation", organisation);

        // Fetch projectIds from ProjectUser table using orgUserId specific to this organisation
        const orgUserIdsForOrg = orgUserEntries
          .filter((entry: { organisationId: string }) => entry.organisationId === organisationId)
          .map((entry: {id: string;  organisationId: string }) => entry.id);

        const projectUserEntries = await prisma.projectUser.findMany({
          where: { orgUserId: { in: orgUserIdsForOrg } },
          select: { projectId: true },
        });

        const projectIds = projectUserEntries.map((entry: { projectId: any; }) => entry.projectId);

        // Fetch project details
        const projects = await prisma.project.findMany({
          where: { id: { in: projectIds }, organisationId },
          select: {
            id: true,
            organisationId: true,
            name: true,
            description: true,
          },
        });

        // Return organisation with its projects nested
        return {
          organisation: {
            ...organisation,
            projects, // Nest projects under the organisation
          },
        };
      })
    );

    res.json({ organisations });
  } catch (error) {
    res.status(500).json({ error: "Error fetching user info", details: error });
  }
};