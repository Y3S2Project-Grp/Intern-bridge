// constants/Roles.ts
export enum UserRole {
  YOUTH = 'youth',
  ORG = 'organization',
  ADMIN = 'admin',
}

export const RoleLabels = {
  [UserRole.YOUTH]: 'Youth',
  [UserRole.ORG]: 'Organization',
  [UserRole.ADMIN]: 'Administrator',
};

export const RoleDescriptions = {
  [UserRole.YOUTH]: 'Looking for internship opportunities',
  [UserRole.ORG]: 'Posting internship opportunities',
  [UserRole.ADMIN]: 'Managing platform operations',
};

export default UserRole;