import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';
import type { DatabaseTransactionHandler, DatabaseTransactionOptions } from './database.types';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.databaseUrl,
        },
      },
      errorFormat: config.isProduction ? 'minimal' : 'colorless',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    await this.$connect();
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    await this.$disconnect();
    this.isConnected = false;
  }

  async transaction<T>(
    handler: DatabaseTransactionHandler<T>,
    options?: DatabaseTransactionOptions,
  ): Promise<T> {
    return this.$transaction(async (client) => handler(client), options);
  }
}
