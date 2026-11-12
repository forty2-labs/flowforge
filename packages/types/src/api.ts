import type { Role } from './roles.js';

export interface UserDto {
  id: string;
  email: string;
  name: string;
  // False until the person opens the link from their verification email.
  emailVerified: boolean;
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

// Answer to opening a verification link.
export interface EmailVerifiedDto {
  email: string;
}

// What the reset page shows before the new password is chosen.
export interface PasswordResetPreviewDto {
  email: string;
  expired: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
