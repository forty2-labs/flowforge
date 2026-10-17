import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { configureApp } from './configure-app.js';
import { env } from './env.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(env.port);
}
// No top-level await: Vercel's launcher loads this file with require(), which
// can't load an ES module that uses it.
void bootstrap();
