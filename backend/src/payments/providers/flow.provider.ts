import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import axios from 'axios';
import { IPaymentProvider, CreatePreferenceParams, PaymentWebhookPayload, PaymentResult } from './payment-provider.interface';

@Injectable()
export class FlowProvider implements IPaymentProvider {
  private readonly logger = new Logger(FlowProvider.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(private config: ConfigService) {
    this.apiUrl = config.get('FLOW_API_URL', 'https://sandbox.flow.cl/api');
    this.apiKey = config.get('FLOW_API_KEY');
    this.secretKey = config.get('FLOW_SECRET_KEY');
  }

  private sign(params: Record<string, string>): string {
    const sorted = Object.keys(params).sort().map((k) => `${k}${params[k]}`).join('');
    return createHmac('sha256', this.secretKey).update(sorted).digest('hex');
  }

  async createPreference(params: CreatePreferenceParams) {
    const amount = params.items.reduce((a, i) => a + i.unitPrice * i.quantity, 0) / 100;
    const payload: Record<string, string> = {
      apiKey: this.apiKey,
      commerceOrder: params.orderId,
      subject: 'Compra Mojito',
      amount: String(Math.round(amount)),
      email: params.buyerEmail,
      urlConfirmation: this.config.get('MP_WEBHOOK_URL').replace('mp', 'flow'), // reutilizamos similar
      urlReturn: this.config.get('MP_SUCCESS_URL'),
    };
    payload.s = this.sign(payload);

    const res = await axios.post(`${this.apiUrl}/payment/create`, payload, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    return {
      checkoutUrl: `${res.data.url}?token=${res.data.token}`,
      preferenceId: String(res.data.flowOrder),
    };
  }

  async processWebhook(payload: PaymentWebhookPayload): Promise<PaymentResult> {
    const { token } = payload.raw;
    const params: Record<string, string> = { apiKey: this.apiKey, token };
    params.s = this.sign(params);

    const res = await axios.get(`${this.apiUrl}/payment/getStatus`, { params });
    const data = res.data;
    const statusMap: Record<number, PaymentResult['status']> = {
      1: 'PENDING', 2: 'APPROVED', 3: 'REJECTED', 4: 'CANCELLED',
    };
    return {
      providerTxId: String(data.flowOrder),
      status: statusMap[data.status] || 'PENDING',
      metadata: data,
    };
  }
}
