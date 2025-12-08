import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { param } from "express-validator";

const prisma = new PrismaClient();

/**
 * Get Prisma model dynamically
 */
const getModel = (modelName: string) => {
    if (modelName in prisma) {
        console.log("Model found: ", modelName);
        return (prisma as any)[modelName];
    }
    return null;
};

/**
 * Generic function to create a record
 */
export const createRecord = async (req: Request, res: Response) => {
    const { model,organisationId ,projectId } = req.params;
    const data = req.body;
    console.log("projectId",projectId)

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }
    // if projectId is in the request body
    if (data.projectId) {
        // If projectId is present in the body, ensure it matches the one in params
        if (data.projectId !== projectId) {
            res.status(400).json({ message: "Project ID in request body does not match the one in URL parameters" });
            return;
        }
    } else {
        // If projectId is missing in the body, add it from params
        data.projectId = projectId;
    }
    try {
        const newRecord = await modelInstance.create({ data });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: "Error creating record", error });
    }
};

/**
 * Generic function to get all records
 */
export const getAllRecords = async (req: Request, res: Response) => {
    const { model, organisationId, projectId } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        // Add filtering based on organisationId and projectId
        const records = await modelInstance.findMany({
            where: {
                projectId,
            },
        });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving records", error });
    }
};

/**
 * Generic function to get a single record by ID
 */
export const getRecordById = async (req: Request, res: Response) => {
    const { model, id } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }
    try {
        const record = await modelInstance.findUnique({ where: { id } });
        if (!record) {
            res.status(404).json({ message: "Record not found" });
            return;
        }

        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving record", error });
    }
};

/**
 * Generic function to update a record by ID
 */
export const updateRecord = async (req: Request, res: Response) => {
    const { model, id } = req.params;
    const data = req.body;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const updatedRecord = await modelInstance.update({ where: { id }, data });
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: "Error updating record", error });
    }
};

/**
 * Generic function to delete a record by ID
 */
export const deleteRecord = async (req: Request, res: Response) => {
    const { model, id } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        await modelInstance.delete({ where: { id } });
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error });
    }
};

/**
 * Generic function to get all records within an organisation
 */
export const getAllRecordsByOrganisation = async (req: Request, res: Response) => {
    const { model, organisationId } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const records = await modelInstance.findMany({ where: { organisationId } });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving records", error });
    }
};

/**
 * Generic function to get a single record by ID within an organisation
 */
export const getRecordByIdAndOrganisation = async (req: Request, res: Response) => {
    const { model, organisationId, id } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const record = await modelInstance.findUnique({ where: { id, organisationId } });
        if (!record) {
            res.status(404).json({ message: "Record not found" });
            return;
        }

        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving record", error });
    }
};

/**
 * Generic function to create a record within an organisation
 */
export const createRecordByOrganisation = async (req: Request, res: Response) => {
    const { model, organisationId } = req.params;
    const data = { ...req.body, organisationId };

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const newRecord = await modelInstance.create({ data });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: "Error creating record", error });
    }
};

/**
 * Generic function to update a record by ID within an organisation
 */
export const updateRecordByOrganisation = async (req: Request, res: Response) => {
    const { model, organisationId, id } = req.params;
    const data = req.body;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const updatedRecord = await modelInstance.update({
            where: { id, organisationId },
            data,
        });
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: "Error updating record", error });
    }
};

/**
 * Generic function to delete a record by ID within an organisation
 */
export const deleteRecordByOrganisation = async (req: Request, res: Response) => {
    const { model, organisationId, id } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        await modelInstance.delete({ where: { id, organisationId } });
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error });
    }
};

/**
 * Generic function to get all records within an organisation and project
 */
export const getAllRecordsByOrganisationAndProject = async (req: Request, res: Response) => {
    const { model, organisationId, projectId } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const records = await modelInstance.findMany({ where: { organisationId, projectId } });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving records", error });
    }
};

/**
 * Generic function to get a single record by ID within an organisation and project
 */
export const getRecordByIdAndOrganisationAndProject = async (req: Request, res: Response) => {
    const { model, organisationId, projectId, id } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const record = await modelInstance.findUnique({ where: { id, organisationId, projectId } });
        if (!record) {
            res.status(404).json({ message: "Record not found" });
            return;
        }

        res.status(200).json(record);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving record", error });
    }
};

/**
 * Generic function to create a record within an organisation and project
 */
export const createRecordByOrganisationAndProject = async (req: Request, res: Response) => {
    const { model, organisationId, projectId } = req.params;
    const data = { ...req.body, organisationId, projectId };

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const newRecord = await modelInstance.create({ data });
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ message: "Error creating record", error });
    }
};

/**
 * Generic function to update a record by ID within an organisation and project
 */
export const updateRecordByOrganisationAndProject = async (req: Request, res: Response) => {
    const { model, organisationId, projectId, id } = req.params;
    const data = req.body;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        const updatedRecord = await modelInstance.update({
            where: { id, organisationId, projectId },
            data,
        });
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: "Error updating record", error });
    }
};

/**
 * Generic function to delete a record by ID within an organisation and project
 */
export const deleteRecordByOrganisationAndProject = async (req: Request, res: Response) => {
    const { model, organisationId, projectId, id } = req.params;

    const modelInstance = getModel(model);
    if (!modelInstance) {
        res.status(400).json({ message: "Invalid model name" });
        return;
    }

    try {
        await modelInstance.delete({ where: { id, organisationId, projectId } });
        res.status(200).json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting record", error });
    }
};
