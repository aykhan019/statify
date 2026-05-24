import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from './config.service';
import { parseEnv } from './env.schema';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: ['.env', '../../.env'],
      isGlobal: true,
      validate: parseEnv,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
