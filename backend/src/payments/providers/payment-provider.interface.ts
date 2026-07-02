export interface CreatePreferenceParams {
  orderId: string;
  items: { title: string; quantity: number; unitPrice: number }[];
  buyerEmail: string;
}

export interface PaymentWebhookPayload {
  provider: 'mercadopago' | 'flow';
  raw: Record<string, any>;
}

export interface PaymentResult {
  providerTxId: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'CANCELLED' | 'IN_PROCESS';
  metadata: Record<string, any>;
}

export interface IPaymentProvider {
  createPreference(params: CreatePreferenceParams): Promise<{ checkoutUrl: string; preferenceId: string }>;
  processWebhook(payload: PaymentWebhookPayload): Promise<PaymentResult>;
}
