import { PrismaClient, SystemRole, AssignmentStatus } from "@prisma/client";
import { ALL_ACTIONS } from "../src/constants/actions";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../src/services/auth.service";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding base data...");

  try {
    // 1️⃣ Create Users
    const superUser = await prisma.user.upsert({
      where: { email: "superuser@mc2.com" },
      update: {},
      create: {
        id: uuidv4(),
        email: "superuser@mc2.com",
        name: "Super User",
        password: await hashPassword("Super123"), 
        systemRole: SystemRole.SUPER_USER,
        createdBy: "system",
      },
    });

    // Create UserToken for superUser
    await prisma.userToken.upsert({
      where: { userId: superUser.id },
      update: {},
      create: {
        id: uuidv4(),
        userId: superUser.id,
        isVerified: true, // SuperUser is pre-verified
      },
    });

    const orgUser = await prisma.user.upsert({
      where: { email: "orguser@mc2.com" },
      update: {},
      create: {
        id: uuidv4(),
        email: "orguser@mc2.com",
        name: "Org User",
        password: await hashPassword("Org123"),
        systemRole: SystemRole.ORG_USER,
        createdBy: "system",
      },
    });

    // Create UserToken for orgUser
    await prisma.userToken.upsert({
      where: { userId: orgUser.id },
      update: {},
      create: {
        id: uuidv4(),
        userId: orgUser.id,
        isVerified: false,
      },
    });

    // Create Org Admin User (SystemRole grants org management permissions)
    const orgAdmin = await prisma.user.upsert({
      where: { email: "orgadmin@mc2.com" },
      update: {},
      create: {
        id: uuidv4(),
        email: "orgadmin@mc2.com",
        name: "Org Admin",
        password: await hashPassword("OrgAdmin123"),
        systemRole: SystemRole.ORG_ADMIN,
        createdBy: "system",
      },
    });

    // Create UserToken for orgAdmin
    await prisma.userToken.upsert({
      where: { userId: orgAdmin.id },
      update: {},
      create: {
        id: uuidv4(),
        userId: orgAdmin.id,
        isVerified: true, // OrgAdmin is pre-verified
      },
    });

    console.log("Users created with hashed passwords and tokens:", { superUser, orgUser, orgAdmin });

    // 2️⃣ Create Organisation
    const organisation = await prisma.organisation.upsert({
      where: { name: "System Organisation" },
      update: {},
      create: {
        id: uuidv4(),
        name: "System Organisation",
        description: "System-wide organisation",
        ownerId: superUser.id,
        createdBy: superUser.id,
        updatedBy: superUser.id,
      },
    });

    console.log("Organisation created:", organisation);

    // 3️⃣ Create System Roles
    const superUserRole = await prisma.role.upsert({
      where: { name: "SuperUserRole" },
      update: {},
      create: {
        id: uuidv4(),
        name: "SuperUserRole",
        description: "System-wide role for super users",
        isSystemRole: true,
        createdBy: superUser.id,
        updatedBy: superUser.id,
      },
    });

    // Note: ORG_ADMIN SystemRole users don't need additional roles
    // Their permissions come directly from SystemRole

    console.log("System roles created:", { superUserRole });

    // 4️⃣ Create System Permissions
    const superUserPermission = await prisma.permission.upsert({
      where: { name: "SuperUserAccess" },
      update: {},
      create: {
        id: uuidv4(),
        name: "SuperUserAccess",
        description: "Grants all actions for platform administration",
        createdBy: superUser.id,
        updatedBy: superUser.id,
      },
    });

    console.log("System permissions created:", { superUserPermission });

    // 5️⃣ Create Actions
    const actionMap = new Map();
    for (const actionName of ALL_ACTIONS) {
      const action = await prisma.action.upsert({
        where: { name: actionName },
        update: {},
        create: {
          id: uuidv4(),
          name: actionName,
          description: `Description for ${actionName}`,
          createdBy: superUser.id,
          updatedBy: superUser.id,
        },
      });
      actionMap.set(actionName, action.id);
    }

    console.log("Actions created:", Array.from(actionMap.keys()).length, "total actions");

    // 6️⃣ Assign All Actions to SuperUser Permission
    for (const [actionName, actionId] of actionMap.entries()) {
      await prisma.permissionAction.upsert({
        where: { permissionId_actionId: { permissionId: superUserPermission.id, actionId } },
        update: {},
        create: {
          id: uuidv4(),
          permissionId: superUserPermission.id,
          actionId,
        },
      });
    }

    console.log(`SuperUser granted ${actionMap.size} actions`);

    // 7️⃣ Assign SuperUser Permission to SuperUser Role
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superUserRole.id, permissionId: superUserPermission.id } },
      update: {},
      create: {
        id: uuidv4(),
        roleId: superUserRole.id,
        permissionId: superUserPermission.id,
      },
    });

    // 8️⃣ Assign SuperUser to Organisation with SuperUser Role
    await prisma.orgUser.upsert({
      where: { 
        organisationId_userId: { 
          organisationId: organisation.id, 
          userId: superUser.id 
        } 
      },
      update: { roleId: superUserRole.id },
      create: {
        id: uuidv4(),
        userId: superUser.id,
        organisationId: organisation.id,
        roleId: superUserRole.id,
      },
    });

    // Note: ORG_ADMIN and ORG_USER don't get org assignments here
    // They will be assigned to specific organizations as needed

    console.log("\n✅ Base seeding complete!");
    console.log("📊 Summary:");
    console.log("👥 Users created:");
    console.log(`   - SuperUser: ${superUser.email} (${superUser.systemRole}) - Platform admin`);
    console.log(`   - OrgAdmin: ${orgAdmin.email} (${orgAdmin.systemRole}) - Organization admin (permissions via SystemRole)`);
    console.log(`   - OrgUser: ${orgUser.email} (${orgUser.systemRole}) - Basic user (needs application roles)`);
    console.log(`🏢 Organisation: ${organisation.name}`);
    console.log(`🎭 System Role: SuperUserRole (for platform administration)`);
    console.log(`🔐 System Permission: SuperUserAccess (all ${actionMap.size} actions)`);
    console.log(`⚡ Actions: ${actionMap.size} actions from actions.ts`);
    console.log(`🔗 SuperUser linked to organisation with full permissions`);
    console.log(`\n💡 Note: ORG_ADMIN users get permissions via SystemRole, ORG_USER needs application roles`);

  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();