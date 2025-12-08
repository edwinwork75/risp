import { PrismaClient, SystemRole, User, Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NALLA_HEALTH_ACTIONS } from "../src/constants/actions";
import { hashPassword } from "../src/services/auth.service";

const prisma = new PrismaClient();

// Define role-to-action mappings for ORG_USER business roles only
// Note: No OrgAdmin role needed - ORG_ADMIN SystemRole handles org management
const ROLE_ACTION_MAPPINGS = {
  //   "OrgAdmin": [
  //   // Organisation
  //   "organisation.read", "organisation.update",
  //   // Projects
  //   "project.read", "project.list", "project.update", 
  //   // Users
  //   "users.create", "users.read", "users.list", "users.update", "users.delete",
  //   "users.assignToOrgansation", "users.assignToProject", "users.assignRoles",
  //   "users.assignAlternateUsers", "users.assignGroup",
  //   // Assessments
  //   "assessments.read", "assessments.list", "assessments.update", "assessments.delete",
  //   "assessments.performAssessment", "assessments.viewReport", "assessments.updateReport",
  //   "assessments.deleteReport", "assessments.exportReport",
  //   // Groups
  //   "groups.create", "groups.read", "groups.list", "groups.update", "groups.delete", "groups.addUserToGroup",
  //   // Assignments
  //   "assignments.create", "assignments.read", "assignments.list", "assignments.update", "assignments.delete",
  //   "assignments.assignToUser", "assignments.assignToGroup",
  //   // Roles & Permissions (for org admin)
  //   "roles.read", "roles.list", "roles.update",
  //   "permissions.read", "permissions.list"
  // ],
  
  "ProjectAdmin": [
    // Projects
    "project.read", "project.list", "project.update",
    // Users 
    "users.create", "users.read", "users.list", "users.update", "users.delete",
    "users.assignToOrgansation", "users.assignToProject", "users.assignRoles",
    "users.assignAlternateUsers", "users.assignGroup",
    // Roles actions
    "roles.read","roles.list",
    // Assessments
    "assessments.read", "assessments.list", "assessments.update", "assessments.delete",
    "assessments.performAssessment", "assessments.viewReport", "assessments.updateReport",
    "assessments.deleteReport", "assessments.exportReport",
    // Groups
    "groups.create", "groups.read", "groups.list", "groups.update", "groups.delete", "groups.addUserToGroup",
    // Assignments
    "assignments.create", "assignments.read", "assignments.list", "assignments.update", "assignments.delete",
    "assignments.assignToUser", "assignments.assignToGroup"
  ],
  
  "AssessmentAdmin": [
    // Projects
    "project.read", "project.list",
    // Users
     "users.list",
    // Assessments
    "assessments.create", "assessments.read", "assessments.list", "assessments.update", "assessments.delete",
    "assessments.performAssessment", "assessments.viewReport", "assessments.updateReport",
    "assessments.deleteReport", "assessments.exportReport",
    // Groups
    "groups.create", "groups.read", "groups.list", "groups.update", "groups.delete", "groups.addUserToGroup",
    // Assignments
    "assignments.create", "assignments.read", "assignments.list", "assignments.update", "assignments.delete",
    "assignments.assignToUser", "assignments.assignToGroup"
  ],
  
  "GroupAdmin": [
    // Projects
    "project.read", "project.list",
    // Users
    "users.list",
    // Assessments
    "assessments.performAssessment", "assessments.viewReport", "assessments.exportReport",
    // Groups
    "groups.create", "groups.read", "groups.list", "groups.update", "groups.delete", "groups.addUserToGroup",
    // Assignments
    "assignments.read", "assignments.list", "assignments.update"
  ],
  
  "Staff": [
    // Projects
    "project.read", "project.list",
    // Users
    "users.list",
    // Assessments
    "assessments.performAssessment", "assessments.viewReport",
    // Assignments
    "assignments.read"
  ],
  
  "Student": [
    // Projects
    "project.read", "project.list",
    // Users
    "users.read", 
    // Assessments
    "assessments.performAssessment",
    // Assignments
    "assignments.read"
  ],
  
  "AlternateContact": [
    // Projects
    "project.read", "project.list",
    // Users
    "users.read", "users.list",
    // Assessments
    "assessments.performAssessment", "assessments.viewReport",
    // Assignments
    "assignments.read"
  ]
};

async function seedRBAC() {
  console.log("🔐 Seeding RBAC (Business Roles for ORG_USER) data...");

  try {
    // 1️⃣ Find existing SuperUser (created by base seed.ts)
    const superUser = await prisma.user.findUnique({
      where: { email: "superuser@mc2.com" }
    });

    if (!superUser) {
      throw new Error("SuperUser not found! Please run the base seed.ts first.");
    }

    console.log("✅ Found existing SuperUser:", superUser.email);

    // 2️⃣ Find existing Organisation (use existing system org)
    const organisation = await prisma.organisation.findFirst({
      where: { name: "System Organisation" }
    });

    if (!organisation) {
      throw new Error("System Organisation not found! Please run the base seed.ts first.");
    }

    console.log("✅ Using existing System Organisation:", organisation.name);

    // 3️⃣ Verify NallaHealth Actions exist (they should be created by seed.ts using ALL_ACTIONS)
    const existingActions = await prisma.action.findMany({
      where: { name: { in: NALLA_HEALTH_ACTIONS } }
    });

    console.log(`✅ Found ${existingActions.length}/${NALLA_HEALTH_ACTIONS.length} NallaHealth actions`);

    // Create action map for easy lookup
    const actionMap = new Map();
    existingActions.forEach(action => {
      actionMap.set(action.name, action.id);
    });

    // 4️⃣ Create Business Roles and their Permissions (for ORG_USER only)
    const roleMap = new Map<string, string>();
    const permissionMap = new Map<string, string>();
    const createdRoles: Role[] = [];

    for (const [roleName, roleActions] of Object.entries(ROLE_ACTION_MAPPINGS)) {
      // Create Role
      const role = await prisma.role.upsert({
        where: { name: `${roleName}` }, // Prefix to avoid conflicts
        update: {},
        create: {
          id: uuidv4(),
          name: `${roleName}`,
          description: `${roleName} role for NallaHealth platform (ORG_USER business role)`,
          isSystemRole: false, // All NallaHealth roles are business-level
          organisationId: organisation.id,
          createdBy: superUser.id,
          updatedBy: superUser.id,
        },
      });
      roleMap.set(roleName, role.id);
      createdRoles.push(role);

      // Create Permission for this role
      const permissionName = `${roleName}_PERMISSION`;
      const permission = await prisma.permission.upsert({
        where: { name: permissionName },
        update: {},
        create: {
          id: uuidv4(),
          name: permissionName,
          description: `Permission set for NallaHealth ${roleName} (ORG_USER business role)`,
          organisationId: organisation.id,
          createdBy: superUser.id,
          updatedBy: superUser.id,
        },
      });
      permissionMap.set(roleName, permission.id);

      // 5️⃣ Link Permission to Actions
      let assignedActionsCount = 0;
      const missingActions: string[] = [];
      
      for (const actionName of roleActions) {
        const actionId = actionMap.get(actionName);
        if (actionId) {
          await prisma.permissionAction.upsert({
            where: { 
              permissionId_actionId: { 
                permissionId: permission.id, 
                actionId: actionId 
              } 
            },
            update: {},
            create: {
              id: uuidv4(),
              permissionId: permission.id,
              actionId: actionId,
            },
          });
          assignedActionsCount++;
        } else {
          missingActions.push(actionName);
        }
      }

      // 6️⃣ Link Role to Permission
      await prisma.rolePermission.upsert({
        where: { 
          roleId_permissionId: { 
            roleId: role.id, 
            permissionId: permission.id 
          } 
        },
        update: {},
        create: {
          id: uuidv4(),
          roleId: role.id,
          permissionId: permission.id,
          organisationId: organisation.id, 
        },
      });

      console.log(`🎭 Role created: NallaHealth_${roleName}`);
      console.log(`   ✅ Actions assigned: ${assignedActionsCount}/${roleActions.length}`);
      if (missingActions.length > 0) {
        console.log(`   ⚠️  Missing actions: ${missingActions.join(', ')}`);
      }
    }

    // 7️⃣ Create sample ORG_USER users for each business role
    const sampleUsers: Array<{
      email: string;
      name: string;
      role: string;
      systemRole: SystemRole;
    }> = [
      // Only ORG_USER with business roles (no ORG_ADMIN users here)
      { 
        email: "projectadmin@nallahealth.com", 
        name: "Project Administrator", 
        role: "ProjectAdmin", 
        systemRole: SystemRole.ORG_USER 
      },
      { 
        email: "assessmentadmin@nallahealth.com", 
        name: "Assessment Administrator", 
        role: "AssessmentAdmin", 
        systemRole: SystemRole.ORG_USER 
      },
      { 
        email: "groupadmin@nallahealth.com", 
        name: "Group Administrator", 
        role: "GroupAdmin", 
        systemRole: SystemRole.ORG_USER 
      },
      { 
        email: "staff@nallahealth.com", 
        name: "Staff Member", 
        role: "Staff", 
        systemRole: SystemRole.ORG_USER 
      },
      { 
        email: "student@nallahealth.com", 
        name: "Student User", 
        role: "Student", 
        systemRole: SystemRole.ORG_USER 
      },
      { 
        email: "alternate@nallahealth.com", 
        name: "Alternate Contact", 
        role: "AlternateContact", 
        systemRole: SystemRole.ORG_USER 
      },
    ];

    const createdUsers: User[] = [];

    for (const userData of sampleUsers) {
      // Create user with hashed password
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          id: uuidv4(),
          email: userData.email,
          name: userData.name,
          password: await hashPassword("NallaHealth123"),
          systemRole: userData.systemRole,
          createdBy: superUser.id,
        },
      });
      createdUsers.push(user);

      // Create UserToken for each user
      await prisma.userToken.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          id: uuidv4(),
          userId: user.id,
          isVerified: false, // Business users need verification
        },
      });

      // Assign business role to user
      const roleId = roleMap.get(userData.role);
      if (roleId) {
        await prisma.orgUser.upsert({
          where: { 
            organisationId_userId: { 
              organisationId: organisation.id, 
              userId: user.id 
            } 
          },
          update: { roleId: roleId },
          create: {
            id: uuidv4(),
            userId: user.id,
            organisationId: organisation.id,
            roleId: roleId,
          },
        });

        console.log(`👤 User created: ${userData.email} → NallaHealth_${userData.role} (with hashed password & token)`);
      }
    }

    console.log("\n✅ NallaHealth RBAC seeding complete!");
    console.log("📊 Final Summary:");
    console.log(`🏢 Organisation: ${organisation.name}`);
    console.log(`⚡ Actions verified: ${existingActions.length}/${NALLA_HEALTH_ACTIONS.length}`);
    console.log(`🎭 Business roles created: ${createdRoles.length} (for ORG_USER only)`);
    console.log(`🔐 Business permissions created: ${Object.keys(ROLE_ACTION_MAPPINGS).length}`);
    console.log(`👥 ORG_USER sample users created: ${createdUsers.length}`);
    console.log(`🔗 All role-permission-action linkages established`);
    
    console.log("\n👥 Created ORG_USER Business Users:");
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.name})`);
    });

    console.log("\n🎭 Created Business Roles:");
    createdRoles.forEach(role => {
      console.log(`   - ${role.name}`);
    });

    console.log("\n💡 Note:");
    console.log("   - ORG_ADMIN users (like orgadmin@mc2.com) get permissions via SystemRole");
    console.log("   - ORG_USER users get permissions via these business roles");
    console.log("   - SUPER_USER gets all permissions via SystemRole");
    
  } catch (error) {
    console.error("❌ Error seeding RBAC data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedRBAC();