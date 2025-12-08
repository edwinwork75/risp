import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Error fetching roles" });
  }
};

export const getRole = async (req: Request, res: Response) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id } });
    if (!role) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Error fetching role" });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { name, description } = req.body;
    const role = await prisma.role.create({
      data: { 
        name, 
        description, 
        createdby: { connect: { id: req.user.id } }, 
        updatedby: { connect: { id: req.user.id } } 
      },
    });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: "Error creating role" });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const role = await prisma.role.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: "Error updating role" });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    await prisma.role.delete({ where: { id: req.params.id } });
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting role" });
  }
};

// Add permission to role
export const addPermissionToRole = async (req: Request, res: Response) => {
  try {
    const { permissionId } = req.body;
    const rolePermission = await prisma.rolePermission.create({
      data: { roleId: req.params.roleId, permissionId },
    });
    res.json(rolePermission);
  } catch (error) {
    res.status(500).json({ error: "Error adding permission to role" });
  }
};

// Remove permission from role
export const removePermissionFromRole = async (req: Request, res: Response) => {
  try {
    await prisma.rolePermission.deleteMany({
      where: { roleId: req.params.roleId, permissionId: req.params.permissionId },
    });
    res.json({ message: "Permission removed from role" });
  } catch (error) {
    res.status(500).json({ error: "Error removing permission from role" });
  }
};
