import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { HealthController } from './health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { WorkspacesModule } from './workspaces/workspaces.module.js';

@Module({
  imports: [PrismaModule, AuthModule, WorkspacesModule],
  controllers: [HealthController],
})
export class AppModule {}
