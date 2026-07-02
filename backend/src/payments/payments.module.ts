import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MercadoPagoProvider } from './providers/mercadopago.provider';
import { FlowProvider } from './providers/flow.provider';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [InvoicesModule],
  providers: [PaymentsService, MercadoPagoProvider, FlowProvider],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
