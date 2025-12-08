// src/constants/actions.ts

export const ACTIONS = {
  // Users actions
  users: [
    "users.create",
    "users.read",
    "users.list",
    "users.update",
    "users.delete",
    "users.assignToOrgansation", // Note: keeping original spelling from Excel
    "users.assignToProject",
    "users.assignRoles",
    "users.assignAlternateUsers",
    "users.assignGroup",
  ],

  // Authentication actions
  auth: [
    "auth.login",
    "auth.logout",
    "auth.refresh-token",
    "auth.change-password",
    "auth.reset-password",
  ],

  // Organisation actions
  organisation: [
    "organisation.create",
    "organisation.read",
    "organisation.list",
    "organisation.update",
    "organisation.delete",
    "organisation.add-user",
    "organisation.remove-user",
  ],

  // Projects actions
  projects: [
    "project.create",
    "project.read",
    "project.list",
    "project.update",
    "project.delete",
    "project.assign-user",
    "project.remove-user",
  ],

  // Roles actions
  roles: [
    "roles.create",
    "roles.read",
    "roles.list",
    "roles.update",
    "roles.delete",
    "roles.addPermissions",
    "roles.removePermissions",
  ],

  // Permissions actions
  permissions: [
    "permissions.create",
    "permissions.read",
    "permissions.list",
    "permissions.update",
    "permissions.delete",
    "permissions.addActions",
    "permissions.removeActions",
  ],

  // Assessments actions (NallaHealth specific)
  assessments: [
    "assessments.create",
    "assessments.read",
    "assessments.list",
    "assessments.update",
    "assessments.delete",
    "assessments.performAssessment",
    "assessments.viewReport",
    "assessments.updateReport",
    "assessments.deleteReport",
    "assessments.exportReport",
  ],

  // Groups actions (NallaHealth specific)
  groups: [
    "groups.create",
    "groups.read",
    "groups.list",
    "groups.update",
    "groups.delete",
    "groups.addUserToGroup",
  ],

  // Assignments actions (NallaHealth specific)
  assignments: [
    "assignments.create",
    "assignments.read",
    "assignments.list",
    "assignments.update",
    "assignments.delete",
    "assignments.assignToUser",
    "assignments.assignToGroup",
  ],

  // Subscriptions actions (NallaHealth specific)
  subscriptions: [
    "subscriptions.create",
    "subscriptions.read",
    "subscriptions.list",
    "subscriptions.update",
    "subscriptions.delete",
    "subscriptions.createSubscriptionToOrganisation",
    "subscriptions.removeSubscriptionToOrganisation",
    "subscriptions.createSubscriptionToProject",
    "subscriptions.removeSubscriptionToProject",
  ],

  // Audit actions
  audit: ["audit.read", "audit.export"],

  // System actions (SUPER_USER only)
  system: [
    "system.manage-settings",
    "system.view-dashboard",
    "system.backup",
    "system.restore",
  ],

  // API actions (SUPER_USER only)
  api: [
    "api.manage-webhooks",
    "api.read",
    "api.generate-key",
    "api.revoke-key",
  ],

  // Global Actions management (SUPER_USER only)
  actions: [
    "actions.create",
    "actions.read",
    "actions.list", 
    "actions.update",
    "actions.delete",
  ],
};

// Actions that ORG_ADMIN can bypass permission checks for
export const ORG_ADMIN_BYPASS_ACTIONS = [
  "organisation.read",
  "organisation.list",
  "organisation.update",
  "organisation.add-user",
  "organisation.remove-user",
  "actions.list",
  ...ACTIONS.users,
  ...ACTIONS.projects,
  ...ACTIONS.roles,
  ...ACTIONS.permissions,
  ...ACTIONS.assessments,
  ...ACTIONS.groups,
  ...ACTIONS.assignments,
  ...ACTIONS.subscriptions,
  ...ACTIONS.audit,
];

// Actions that are SUPER_USER only (ORG_ADMIN cannot bypass)
export const SUPER_USER_ONLY_ACTIONS = [
  "organisation.create",
  ...ACTIONS.system,
  ...ACTIONS.api,
    "actions.create",
    "actions.read",
    "actions.update",
    "actions.delete",
    //! for Now Superuser only
    "questionnaires.create",
    "questionnaires.delete",
    "questionnaires.update"
];

// Flatten actions into a single array for easy listing
export const ALL_ACTIONS = Object.values(ACTIONS).flat();

// Export NallaHealth specific actions for backwards compatibility
export const NALLA_HEALTH_ACTIONS = [
  ...ACTIONS.organisation,
  ...ACTIONS.projects,
  ...ACTIONS.users,
  ...ACTIONS.assessments,
  ...ACTIONS.groups,
  ...ACTIONS.assignments,
  ...ACTIONS.roles,
  ...ACTIONS.permissions,
  ...ACTIONS.subscriptions,
];
