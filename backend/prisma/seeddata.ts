import { PrismaClient, SystemRole, AssignmentStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seedData() {
  console.log("🌱 Seeding all tables with sample data...");

  try {
    // 1️⃣ Create Users
    const users: Array<{ id: string; email: string; name: string; password: string; systemRole: SystemRole; createdBy: string; updatedBy: string }> = [];
    for (let i = 1; i <= 10; i++) {
      const user = await prisma.user.create({
        data: {
          id: uuidv4(),
          email: `user${i}@example.com`,
          name: `User ${i}`,
          password: `Password${i}`,
          systemRole: SystemRole.ORG_USER,
          createdBy: "system",
          updatedBy: "system",
        },
      });
      users.push({ id: user.id, email: user.email, name: user.name, password: user.password, systemRole: user.systemRole, createdBy: user.createdBy, updatedBy: user.updatedBy });
    }
    console.log("Users created:", users);

    // 2️⃣ Create Organisations
    const organisations: Array<{
      id: string;
      name: string;
      description: string | null;
      ownerId: string;
      createdBy: string;
      updatedBy: string;
    }> = [];
    for (let i = 1; i <= 10; i++) {
      const organisation = await prisma.organisation.create({
        data: {
          id: uuidv4(),
          name: `Organisation ${i}`,
          description: `Description for Organisation ${i}`,
          ownerId: users[i - 1].id,
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      organisations.push(organisation);
    }
    console.log("Organisations created:", organisations);

    // 3️⃣ Create Roles
    const roles: Array<{ id: string; name: string; description: string | null; isSystemRole: boolean; organisationId: string; createdBy: string; updatedBy: string }> = [];
    for (let i = 1; i <= 10; i++) {
      const role = await prisma.role.create({
        data: {
          id: uuidv4(),
          name: `Role ${i}`,
          description: `Description for Role ${i}`,
          isSystemRole: false,
          organisationId: organisations[i - 1]?.id || "default-organisation-id",
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      roles.push({ id: role.id, name: role.name, description: role.description, isSystemRole: role.isSystemRole, organisationId: role.organisationId!, createdBy: role.createdBy, updatedBy: role.updatedBy });
    }
    console.log("Roles created:", roles);

    // 4️⃣ Create Permissions
    const permissions: Array<{
      id: string;
      name: string;
      description: string | null;
      createdBy: string;
      updatedBy: string;
    }> = [];
    for (let i = 1; i <= 10; i++) {
      const permission = await prisma.permission.create({
        data: {
          id: uuidv4(),
          name: `Permission ${i}`,
          description: `Description for Permission ${i}`,
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      permissions.push(permission);
    }
    console.log("Permissions created:", permissions);

    // 5️⃣ Create Actions
    const actions: Array<{
      id: string;
      name: string;
      description: string | null;
      createdBy: string;
      updatedBy: string;
    }> = [];
    for (let i = 1; i <= 10; i++) {
      const action = await prisma.action.create({
        data: {
          id: uuidv4(),
          name: `Action ${i}`,
          description: `Description for Action ${i}`,
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      actions.push(action);
    }
    console.log("Actions created:", actions);

    // 6️⃣ Assign Actions to Permissions
    for (let i = 0; i < 10; i++) {
      await prisma.permissionAction.create({
        data: {
          id: uuidv4(),
          permissionId: permissions[i].id,
          actionId: actions[i].id,
        },
      });
    }
    console.log("Actions assigned to permissions");

    // 7️⃣ Assign Permissions to Roles
    for (let i = 0; i < 10; i++) {
      await prisma.rolePermission.create({
        data: {
          id: uuidv4(),
          roleId: roles[i].id,
          permissionId: permissions[i].id,
        },
      });
    }
    console.log("Permissions assigned to roles");

    // 8️⃣ Assign Roles to Users
    for (let i = 0; i < 10; i++) {
      await prisma.orgUser.create({
        data: {
          id: uuidv4(),
          userId: users[i].id,
          organisationId: organisations[i].id,
          roleId: roles[i].id,
        },
      });
    }
    console.log("Roles assigned to users");

    // 9️⃣ Create Projects
    const projects: Array<{ id: string; organisationId: string; name: string; description: string | null; createdBy: string; updatedBy: string }> = [];
    for (let i = 1; i <= 10; i++) {
      const project = await prisma.project.create({
        data: {
          id: uuidv4(),
          organisationId: organisations[i - 1].id,
          name: `Project ${i}`,
          description: `Description for Project ${i}`,
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      projects.push({ id: project.id, organisationId: project.organisationId, name: project.name, description: project.description, createdBy: project.createdBy, updatedBy: project.updatedBy });
    }
    console.log("Projects created:", projects);

    // 🔟 Create Assessments
    const assessments: Array<{ id: string; title: string; organisationId: string; description: string; questions: { question: string }; createdBy: string; updatedBy: string }> = [];
    for (let i = 1; i <= 10; i++) {
      const assessment = await prisma.assessment.create({
        data: {
          id: uuidv4(),
          title: `Assessment ${i}`,
          organisationId: organisations[i - 1].id,
          description: `Description for Assessment ${i}`,
          questions: { question: `Question ${i}` },
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      assessments.push({ id: assessment.id, title: assessment.title, organisationId: assessment.organisationId, description: assessment.description, questions: assessment.questions, createdBy: assessment.createdBy, updatedBy: assessment.updatedBy });
    }
    console.log("Assessments created:", assessments);

    console.log("✅ Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
