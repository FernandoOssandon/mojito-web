import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { FlowProvider } from './providers/flow.provider';
import { IPaymentProvider, PaymentWebhookPayload } from './providers/payment-provider.interface';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly provider: IPaymentProvider;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mpProvider: MercadoPagoProvider,
    private flowProvider: FlowProvider,
    private invoicesService: InvoicesService,
  ) {
    const active = config.get('PAYMENT_PROVIDER', 'mercadopago');
    this.provider = active === 'flow' ? flowProvider : mpProvider;
    this.logger.log(`Payment provider: ${active}`);
  }

  async initiateCheckout(orderId: string, buyerEmail: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { service: true } } },
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const providerName = this.config.get('PAYMENT_PROVIDER', 'mercadopago').toUpperCase();
    const result = await this.provider.createPreference({
      orderId,
      buyerEmail,
      items: order.items.map((i) => ({
        title: i.service.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    });

    // Guardar registro de pago
    await this.prisma.payment.upsert({
      where: { orderId },
      update: { preferenceId: result.preferenceId, status: 'PENDING' },
      create: {
        orderId,
        provider: providerName as any,
        preferenceId: result.preferenceId,
        amount: order.total,
        status: 'PENDING',
      },
    });

    return result;
  }

  async handleWebhook(raw: Record<string, any>, provider: 'mercadopago' | 'flow') {
    const payload: PaymentWebhookPayload = { provider, raw };
    const result = await this.provider.processWebhook(payload);
    if (!result) return { received: true };

    // Buscar la orden por el preferenceId o external_reference
    const externalRef = raw.data?.id ? await this.getOrderByMpPayment(String(raw.data.id)) : null;
    if (!externalRef) return { received: true };

    await this.prisma.payment.update({
      where: { orderId: externalRef },
      data: {
        providerTxId: result.providerTxId,
        status: result.status as any,
        metadata: result.metadata as any,
      },
    });

    if (result.status === 'APPROVED') {
      await this.prisma.order.update({
        where: { id: externalRef },
        data: { paymentStatus: 'APPROVED', status: 'PROCESSING' },
      });
      // Emitir boleta automáticamente
      await this.invoicesService.emit(externalRef).catch((err) => {
        this.logger.error(`Invoice emission failed for order ${externalRef}: ${err.message}`);
      });
    }

    return { received: true };
  }

  private async getOrderByMpPayment(paymentId: string): Promise<string | null> {
    // En el webhook de MP obtenemos el payment_id y consultamos la referencia externa
    const mpProvider = this.mpProvider as MercadoPagoProvider;
    try {
      const { Payment } = await import('mercadopago');
      const { MercadoPagoConfig } = await import('mercadopago');
      const client = new MercadoPagoConfig({ accessToken: this.config.get('MP_ACCESS_TOKEN') });
      const paymentApi = new Payment(client);
      const p = await paymentApi.get({ id: Number(paymentId) });
      return p.external_reference || null;
    } catch {
      return null;
    }
  }
}
