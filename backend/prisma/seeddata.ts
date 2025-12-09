import { PrismaClient, SystemRole, AssignmentStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

async function seedData() {
  console.log("🌱 Seeding all tables with sample data...");

  try {
    // 1️⃣ Create Users
    const users: Array<{ id: string; email: string; name: string; password: string; systemRole: SystemRole; createdBy: string; updatedBy: string | null }> = [];
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

    // 🔟 Create Questionnaires
    const questionnaires = [];
    for (let i = 1; i <= 10; i++) {
      const questionnaire = await prisma.questionnaire.create({
        data: {
          id: uuidv4(),
          slug: `questionnaire-${i}`,
          title: `Sample Questionnaire ${i}`,
          description: `Description for Sample Questionnaire ${i}`,
          questionnaire: {
            "question1": "What is your name?",
            "question2": "What is your age?"
          } as any,
          minSpanDays: 15,
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      questionnaires.push(questionnaire);
    }
    console.log("Questionnaires created:", questionnaires);

    // 1️⃣1️⃣ Create Assessment Schedules
    const assessmentSchedules: Array<{
      id: string;
      projectId: string;
      title: string;
      description: string | null;
      questionnaireId: string;
      createdBy: string;
      updatedBy: string;
    }> = [];
    for (let i = 1; i <= 10; i++) {
      const assessmentSchedule = await prisma.assessmentSchedule.create({
        data: {
          id: uuidv4(),
          projectId: projects[i - 1].id,
          title: `Assessment Schedule ${i}`,
          description: `Description for Assessment Schedule ${i}`,
          questionnaireId: questionnaires[i - 1].id,
          createdBy: users[i - 1].id,
          updatedBy: users[i - 1].id,
        },
      });
      assessmentSchedules.push(assessmentSchedule);
    }
    console.log("Assessment Schedules created:", assessmentSchedules);

    console.log("Assessment Schedules created:", assessmentSchedules);

    // 1️⃣2️⃣ Create Assessments
    const assessments: Array<{ id: string; assessmentScheduleId: string; startDate: Date; endDate: Date; projectId: string }> = [];
    for (let i = 1; i <= 10; i++) {
      const assessment = await prisma.assessment.create({
        data: {
          id: uuidv4(),
          assessmentScheduleId: assessmentSchedules[i - 1].id,
          projectId: projects[i - 1].id,
          startDate: new Date(),
          endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        },
      });
      assessments.push(assessment);
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
