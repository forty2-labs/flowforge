import { IsString, MaxLength, MinLength } from 'class-validator';

export class WorkspaceNameDto {
  @IsString()
  @MinLength(2, { message: 'Workspace name must be at least 2 characters.' })
  @MaxLength(60)
  name: string;
}
