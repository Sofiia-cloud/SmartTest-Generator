export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student'
} as const;

export const ALL_ROLES: RoleValues[] = Object.values(ROLES);

export type RoleValues = typeof ROLES[keyof typeof ROLES];