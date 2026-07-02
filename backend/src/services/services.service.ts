import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  findAll(categorySlug?: string, onlyActive = true) {
    return this.prisma.service.findMany({
      where: {
        ...(onlyActive ? { isActive: true } : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(slug: string) {
    const svc = await this.prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!svc) throw new NotFoundException('Servicio no encontrado');
    return svc;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findById(id);
    return this.prisma.service.update({ where: { id }, data: dto, include: { category: true } });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.service.update({ where: { id }, data: { isActive: false } });
  }

  private async findById(id: string) {
    const svc = await this.prisma.service.findUnique({ where: { id } });
    if (!svc) throw new NotFoundException('Servicio no encontrado');
    return svc;
  }
}
