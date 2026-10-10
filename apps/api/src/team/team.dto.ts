import { ROLES, type Role } from '@flowforge/types';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn } from 'class-validator';

export class ChangeRoleDto {
  @IsIn(ROLES)
  role: Role;
}

export class InviteDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  // Ownership is handed over by changing an existing member's role.
  @IsIn(ROLES.filter((role) => role !== 'OWNER'), {
    message: 'Invite people as Admin, Editor, Author or Viewer.',
  })
  role: Exclude<Role, 'OWNER'>;
}
