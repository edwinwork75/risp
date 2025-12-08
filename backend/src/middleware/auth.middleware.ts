import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../services/auth.service";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];


    if (!token) {
        res.status(401).json({ message: "Authentication token required" });
        return
    }

    try {
        const decoded: any = verifyToken(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }

        req.user = { id: user.id, email: user.email, systemRole: user.systemRole };;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
};
