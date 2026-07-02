import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async findByOrder(orderId: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (role !== Role.ADMIN && order.userId !== userId) throw new ForbiddenException();

    return this.prisma.message.findMany({
      where: { orderId },
      include: { sender: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(orderId: string, senderId: string, body: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return this.prisma.message.create({
      data: { orderId, senderId, body },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
  }
}
