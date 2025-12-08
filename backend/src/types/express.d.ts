import { Request } from "express";

declare module "express-serve-static-core" {
    interface Request {
        user?: { id: string; email: string, systemRole: string }; // Add user field to Express Request
        organisationId?: string; // Add organisationId field to Express Request
    }
}
