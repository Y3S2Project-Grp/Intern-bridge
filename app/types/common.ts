export enum UserRole {
  YOUTH = "youth",
  ORG = "organization",
  ADMIN = "admin",
}

export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
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
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}