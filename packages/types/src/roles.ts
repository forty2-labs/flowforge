export const ROLES = ['OWNER', 'ADMIN', 'EDITOR', 'AUTHOR', 'VIEWER'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  EDITOR: 'Editor',
  AUTHOR: 'Author',
  VIEWER: 'Viewer',
};

const RANK: Record<Role, number> = {
  OWNER: 5,
  ADMIN: 4,
  EDITOR: 3,
  AUTHOR: 2,
  VIEWER: 1,
};

export function roleAtLeast(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

// Capability matrix from the v2 IA board ("Roles in v2"). Authors are limited
// to their own drafts; that ownership check lives with the entry, not here.
export const CAPABILITIES = {
  'entry.edit': 'AUTHOR',
  'layout.edit': 'EDITOR',
  publish: 'EDITOR',
  'model.view': 'AUTHOR',
  'model.manage': 'ADMIN',
  'navigation.manage': 'EDITOR',
  'experience.manage': 'ADMIN',
  'team.manage': 'ADMIN',
  'apiKey.manage': 'ADMIN',
  'workspace.manage': 'ADMIN',
  'billing.manage': 'OWNER',
  'workspace.delete': 'OWNER',
} as const satisfies Record<string, Role>;

export type Capability = keyof typeof CAPABILITIES;

export function can(role: Role, capability: Capability): boolean {
  return roleAtLeast(role, CAPABILITIES[capability]);
}
