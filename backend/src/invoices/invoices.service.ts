import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';

const APIGATEWAY_BASE = 'https://apigateway.cl/recursos/v1/sii/eboleta';
const MAX_RETRIES = 3;

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  /** Emite una boleta electrónica vía API Gateway Portal eBoleta */
  async emit(orderId: string, attempt = 1): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { service: true } },
        user: true,
      },
    });

    if (!order) {
      this.logger.error(`Order ${orderId} not found for invoice`);
      return;
    }

    // Si ya existe una boleta emitida, no reemitir
    const existing = await this.prisma.invoice.findUnique({ where: { orderId } });
    if (existing?.status === 'ISSUED') return;

    // Crear o actualizar registro de factura como PENDING
    const invoice = await this.prisma.invoice.upsert({
      where: { orderId },
      update: { retries: attempt },
      create: { orderId, retries: attempt, status: 'PENDING' },
    });

    try {
      const token = this.config.get('APIGATEWAY_TOKEN');
      const emisorRut = this.config.get('EMISOR_RUT');

      const body = {
        emisor: {
          rut: emisorRut,
          razonSocial: this.config.get('EMISOR_RAZON_SOCIAL'),
        },
        receptor: {
          rut: '66666666-6', // RUT genérico para boletas sin RUT de receptor
          razonSocial: order.user.name,
          email: order.user.email,
        },
        detalles: order.items.map((item) => ({
          nombre: item.service.name,
          cantidad: item.quantity,
          precio: item.unitPrice / 100, // centavos a pesos
        })),
        referencia: orderId,
      };

      const response = await axios.post(
        `${APIGATEWAY_BASE}/emitir`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: 'ISSUED',
          folio: response.data.folio,
          dteId: String(response.data.id || ''),
          pdfUrl: response.data.urlPdf || null,
          issuedAt: new Date(),
        },
      });

      this.logger.log(`Invoice issued for order ${orderId}, folio: ${response.data.folio}`);
    } catch (err) {
      this.logger.error(`Invoice emission error (attempt ${attempt}): ${err.message}`);

      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: attempt >= MAX_RETRIES ? 'FAILED' : 'PENDING', retries: attempt },
      });

      if (attempt < MAX_RETRIES) {
        // Retry con backoff exponencial
        const delay = Math.pow(2, attempt) * 1000;
        setTimeout(() => this.emit(orderId, attempt + 1), delay);
      }
    }
  }

  findByOrder(orderId: string) {
    return this.prisma.invoice.findUnique({ where: { orderId } });
  }

  findAll() {
    return this.prisma.invoice.findMany({
      include: { order: { include: { user: { select: { id: true, name: true, email: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async retry(orderId: string) {
    await this.prisma.invoice.update({
      where: { orderId },
      data: { status: 'PENDING', retries: 0 },
    });
    return this.emit(orderId);
  }
}
