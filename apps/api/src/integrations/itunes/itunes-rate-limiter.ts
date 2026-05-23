import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class ItunesRateLimiter {
  private readonly capacity: number;
  private readonly refillRatePerMs: number;
  private lastRefillAt = Date.now();
  private tokens: number;

  constructor(config: ConfigService) {
    this.capacity = Math.max(1, config.itunesRateLimitRps);
    this.refillRatePerMs = this.capacity / 1000;
    this.tokens = this.capacity;
  }

  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      await delay(this.getWaitMs());
    }
  }

  private tryAcquire(): boolean {
    this.refill();

    if (this.tokens < 1) {
      return false;
    }

    this.tokens -= 1;
    return true;
  }

  private refill(): void {
    const now = Date.now();
    const elapsedMs = now - this.lastRefillAt;

    if (elapsedMs <= 0) {
      return;
    }

    this.tokens = Math.min(this.capacity, this.tokens + elapsedMs * this.refillRatePerMs);
    this.lastRefillAt = now;
  }

  private getWaitMs(): number {
    return Math.max(1, Math.ceil((1 - this.tokens) / this.refillRatePerMs));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
