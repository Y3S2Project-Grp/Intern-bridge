// constants/Roles.ts
export enum UserRole {
  YOUTH = 'youth',
  ORGANIZATION = 'organization',
  ADMIN = 'admin',
}

export const RoleLabels = {
  [UserRole.YOUTH]: 'Youth',
  [UserRole.ORGANIZATION]: 'Organization',
  [UserRole.ADMIN]: 'Administrator',
};

export const RoleDescriptions = {
  [UserRole.YOUTH]: 'Looking for internship opportunities',
  [UserRole.ORGANIZATION]: 'Posting internship opportunities',
  [UserRole.ADMIN]: 'Managing platform operations',
};

export default UserRole;