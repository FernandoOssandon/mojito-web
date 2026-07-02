import { Controller, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Inicia el checkout para una orden existente */
  @Post('checkout/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkout(@Param('orderId') orderId: string, @CurrentUser() user: any) {
    return this.paymentsService.initiateCheckout(orderId, user.email);
  }

  /** Webhook de MercadoPago */
  @Post('mp/webhook')
  mpWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body, 'mercadopago');
  }

  /** Webhook de Flow */
  @Post('flow/webhook')
  flowWebhook(@Body() body: any) {
    return this.paymentsService.handleWebhook(body, 'flow');
  }
}
