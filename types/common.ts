export enum UserRole {
  YOUTH = "youth",
  ORG = "organization",
  ADMIN = "admin",
}

export interface BaseModel {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function TypesWrapper() {
  return null;
}

export interface User extends BaseModel {
  name: string;
  email: string;
  role: UserRole;
  location?: string;
  skills?: string[];
  bio?: string;
  avatar?: string;
  phone?: string;
  website?: string;
  industry?: string;
  description?: string;
  education?: Education[];
  experience?: Experience[];
  approved?: boolean;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: number;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}
export interface Internship extends BaseModel {
  title: string;
  description: string;
  organizationId: string;
  organizationName: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  category: string;
  requirements: string[];
  skillsRequired: string[];
  duration: string;
  stipend?: number;
  applicationDeadline: Date;
  isActive: boolean;
  positions: number;
}

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  SHORTLISTED = 'shortlisted',
  INTERVIEW = 'interview',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export interface Application extends BaseModel {
  userId: string;
  internshipId: string;
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
}