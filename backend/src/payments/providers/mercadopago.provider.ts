import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';
import { IPaymentProvider, CreatePreferenceParams, PaymentWebhookPayload, PaymentResult } from './payment-provider.interface';

@Injectable()
export class MercadoPagoProvider implements IPaymentProvider {
  private readonly logger = new Logger(MercadoPagoProvider.name);
  private readonly client: MercadoPagoConfig;

  constructor(private config: ConfigService) {
    this.client = new MercadoPagoConfig({
      accessToken: config.get('MP_ACCESS_TOKEN'),
    });
  }

  async createPreference(params: CreatePreferenceParams) {
    const preference = new Preference(this.client);
    const response = await preference.create({
      body: {
        external_reference: params.orderId,
        items: params.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: item.unitPrice / 100, // convertir centavos a pesos
          currency_id: 'CLP',
        })),
        payer: { email: params.buyerEmail },
        back_urls: {
          success: this.config.get('MP_SUCCESS_URL'),
          failure: this.config.get('MP_FAILURE_URL'),
          pending: this.config.get('MP_PENDING_URL'),
        },
        auto_return: 'approved',
        notification_url: this.config.get('MP_WEBHOOK_URL'),
      },
    });
    return {
      checkoutUrl: response.init_point,
      preferenceId: response.id,
    };
  }

  async processWebhook(payload: PaymentWebhookPayload): Promise<PaymentResult> {
    const { type, data } = payload.raw;
    if (type !== 'payment') {
      return null; // ignorar otros tipos de notificación
    }

    const paymentApi = new Payment(this.client);
    const payment = await paymentApi.get({ id: data.id });

    const statusMap: Record<string, PaymentResult['status']> = {
      approved: 'APPROVED',
      pending: 'PENDING',
      rejected: 'REJECTED',
      cancelled: 'CANCELLED',
      in_process: 'IN_PROCESS',
    };

    return {
      providerTxId: String(payment.id),
      status: statusMap[payment.status] || 'PENDING',
      metadata: payment as any,
    };
  }
}
