import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPermissions = async (req: Request, res: Response) => {
  try {
    const permissions = await prisma.permission.findMany();
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: "Error fetching permissions" });
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const permission = await prisma.permission.create({
      data: { 
        name, 
        description, 
        createdby: { connect: { id: req.user?.id } }, 
        updatedby: { connect: { id: req.user?.id } } 
      },
    });
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: "Error creating permission" });
  }
};

// Add action to permission
export const addActionToPermission = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.body;
    const permissionAction = await prisma.permissionAction.create({
      data: { permissionId: req.params.permissionId, actionId },
    });
    res.json(permissionAction);
  } catch (error) {
    res.status(500).json({ error: "Error adding action to permission" });
  }
};

// Remove action from permission
export const removeActionFromPermission = async (req: Request, res: Response) => {
  try {
    await prisma.permissionAction.deleteMany({
      where: { permissionId: req.params.permissionId, actionId: req.params.action },
    });
    res.json({ message: "Action removed from permission" });
  } catch (error) {
    res.status(500).json({ error: "Error removing action from permission" });
  }
};
