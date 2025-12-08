import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new global action
 */
export const createAction = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.id; // Guaranteed by middleware

    if (!name || !description) {
      res.status(400).json({ 
        message: "Name and description are required" 
      });
      return;
    }

    // Create the action - let database handle uniqueness constraint
    const action = await prisma.action.create({
      data: {
        name,
        description,
        createdBy: userId,
        updatedBy: userId,
        organisationId: null, // Global action, not organization-specific
      },
    });

    res.status(201).json({
      message: "Action created successfully",
      action,
    });
  } catch (error: any) {
    // Handle Prisma unique constraint violation
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      res.status(409).json({ 
        message: "Action already exists" 
      });
      return;
    }
    
    console.error("Error creating action:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

/**
 * List all global actions
 */
export const listActions = async (req: Request, res: Response) => {
  try {
    const actions = await prisma.action.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      actions,
    });
  } catch (error) {
    console.error("Error listing actions:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

/**
 * Update a global action
 */
export const updateAction = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;
    const { name, description } = req.body;
    const userId = req.user!.id; // Guaranteed by middleware

    if (!actionId) {
      res.status(400).json({ 
        message: "Action ID is required" 
      });
      return;
    }

    // Check if action exists
    const existingAction = await prisma.action.findUnique({
      where: { id: actionId }
    });

    if (!existingAction) {
      res.status(404).json({ 
        message: "Action not found" 
      });
      return;
    }

    // Check if name is being changed and if new name already exists
    if (name && name !== existingAction.name) {
      const duplicateAction = await prisma.action.findFirst({
        where: { 
          name,
          id: { not: actionId }
        }
      });

      if (duplicateAction) {
        res.status(409).json({ 
          message: "Action with this name already exists" 
        });
        return;
      }
    }

    // Update the action
    const action = await prisma.action.update({
      where: { id: actionId },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        updatedBy: userId,
      },
    });

    res.status(200).json({
      message: "Action updated successfully",
      action,
    });
  } catch (error) {
    console.error("Error updating action:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
};

/**
 * Delete a global action
 */
export const deleteAction = async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;

    if (!actionId) {
      res.status(400).json({ 
        message: "Action ID is required" 
      });
      return;
    }

    // Check if action exists
    const existingAction = await prisma.action.findUnique({
      where: { id: actionId }
    });

    if (!existingAction) {
      res.status(404).json({ 
        message: "Action not found" 
      });
      return;
    }

    // Check if action is being used in any permissions
    const usageCount = await prisma.permissionAction.count({
      where: { actionId }
    });

    if (usageCount > 0) {
      res.status(409).json({ 
        message: "Cannot delete action - it's being used in permissions" 
      });
      return;
    }

    // Delete the action
    await prisma.action.delete({
      where: { id: actionId }
    });

    res.status(200).json({
      message: "Action deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting action:", error);
    res.status(500).json({ 
      message: "Internal server error" 
    });
  }
}; 