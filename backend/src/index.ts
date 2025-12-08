import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { setupSwagger } from "./lib/swagger"; // Import Swagger setup
import authRouter from "./routes/auth.routes";
import organisationRouter from "./routes/organisation.routes";
import dynamicRouter from "./routes/dynamic.routes";
import userRouter from "./routes/user.routes";
import roleRouter from "./routes/role.routes";
import permissionRouter from "./routes/permission.routes";
import actionRouter from "./routes/action.routes";
// import virtualPatrol from "./routes/virtualPatrol.routes";
// import visitorManagement from "./routes/visitorManagement.routes";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import prisma from "./lib/prisma";

dotenv.config();

const app = express();
// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(
    cors({
      origin: "*", // Allow all origins (Set specific origin in production)
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization", "x-organisation-id"],
      credentials: true, // Allow cookies if needed
    })
  );
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", "http://localhost:5001"], // Allow API requests
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        },
      },
    })
  );app.use(morgan('combined')); // Request logging

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3500 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Setup Swagger (OpenAPI Documentation)
setupSwagger(app);

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

const startServer = async () => {
    try {
        // Test database connection
        console.log("Database Details:");
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Port: ${process.env.DB_PORT}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Database: ${process.env.DB_NAME}`);

        await prisma.$connect();
        console.log("✅ Database connected successfully.");

        // Mount API Routes
        app.use("/api/auth", authRouter);
        app.use("/api/organisations", organisationRouter);
        app.use("/api/users", userRouter);
        app.use("/api/roles", roleRouter);
        app.use("/api/permissions", permissionRouter);
        app.use("/api/actions", actionRouter);
        app.use("/api/d", dynamicRouter);
        // app.use("/api/virtualPatrol",virtualPatrol)
        // app.use("/api/visitorManagement",visitorManagement)
        const PORT = process.env.PORT ?? 5001;
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

        // Graceful shutdown
        const shutdown = async () => {
            console.log('Received shutdown signal');
            console.log('Shutting down gracefully...');
            server.close(async () => {
                try {
                    await prisma.$disconnect();
                    console.log('✅ Database connection closed.');
                    process.exit(0);
                } catch (err) {
                    console.error('❌ Error during shutdown:', err);
                    process.exit(1);
                }
            });
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Global error handling middleware (should be after routes)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Global error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

startServer();

export default app; 