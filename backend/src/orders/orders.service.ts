import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /** Crear una orden a partir del carrito */
  async create(userId: string, dto: CreateOrderDto) {
    // Obtener servicios y calcular total
    const serviceIds = dto.items.map((i) => i.serviceId);
    const services = await this.prisma.service.findMany({
      where: { id: { in: serviceIds }, isActive: true },
    });

    if (services.length !== serviceIds.length) {
      throw new BadRequestException('Uno o más servicios no están disponibles');
    }

    const total = dto.items.reduce((acc, item) => {
      const svc = services.find((s) => s.id === item.serviceId);
      return acc + svc.price * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        total,
        items: {
          create: dto.items.map((item) => ({
            serviceId: item.serviceId,
            quantity: item.quantity,
            unitPrice: services.find((s) => s.id === item.serviceId).price,
          })),
        },
      },
      include: { items: { include: { service: true } }, user: { select: { id: true, email: true, name: true } } },
    });

    return order;
  }

  /** Listar órdenes — admin ve todas, buyer solo las suyas */
  findAll(userId: string, role: string, status?: string) {
    const isAdmin = role === Role.ADMIN;
    return this.prisma.order.findMany({
      where: {
        ...(!isAdmin ? { userId } : {}),
        ...(status ? { status: status as any } : {}),
      },
      include: {
        items: { include: { service: { select: { id: true, name: true, imageUrl: true } } } },
        payment: { select: { status: true, provider: true } },
        invoice: { select: { status: true, pdfUrl: true, folio: true } },
        user: { select: { id: true, email: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string, role: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { service: true } },
        payment: true,
        invoice: true,
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
        user: { select: { id: true, email: true, name: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (role !== Role.ADMIN && order.userId !== userId)
      throw new ForbiddenException('Acceso denegado');
    return order;
  }

  async updateStatus(id: string, status: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }
}
