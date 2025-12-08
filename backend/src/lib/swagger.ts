import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NallaHealth API Documentation",
      version: "1.0.0",
      description: "API documentation for NallaHealth multi-tenant SaaS platform",
    },
    servers: [
      {
        url: "http://localhost:5001/api",
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid", description: "User ID" },
            email: { type: "string", format: "email", description: "User email" },
            systemRole: {
              type: "string",
              enum: ["SUPER_USER", "ORG_USER"],
              description: "Defines if the user is a system-wide SuperUser or an OrgUser",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        SystemRole: {
          type: "string",
          enum: ["SUPER_USER", "ORG_USER"],
          description: "System-wide role assigned to a user",
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", description: "JWT Token for authentication" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: (req: any) => {
        req.headers = req.headers ?? {};

        try {
          const token = localStorage.getItem('authorized');
          if (token) {
            console.log('Raw token:', token);

            const parsedToken = JSON.parse(token);
            const authToken = parsedToken.BearerAuth?.value || '';

            req.headers.Authorization = `Bearer ${authToken}`;
            console.log('Set authorization header:', req.headers.authorization);
          }
        } catch (error) {
          console.error('Error parsing token:', error);
        }

        return req;
      }
    }
  }));
};
