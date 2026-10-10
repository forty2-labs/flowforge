import type { Role } from './roles.js';

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

export interface SessionDto {
  user: UserDto;
  workspaces: WorkspaceDto[];
}

export interface MemberDto {
  userId: string;
  name: string;
  email: string;
  role: Role;
  joinedAt: string;
}

export interface InvitationDto {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED';
}

export interface InvitationPreviewDto {
  email: string;
  role: Role;
  workspaceName: string;
  expired: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
