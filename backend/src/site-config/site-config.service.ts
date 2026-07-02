import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Record<string, string>> {
    const configs = await this.prisma.siteConfig.findMany();
    return Object.fromEntries(configs.map((c) => [c.key, c.value]));
  }

  async set(key: string, value: string) {
    return this.prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async setMany(data: Record<string, string>) {
    const ops = Object.entries(data).map(([key, value]) =>
      this.prisma.siteConfig.upsert({ where: { key }, update: { value }, create: { key, value } }),
    );
    return Promise.all(ops);
  }
}
