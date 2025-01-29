import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Allow, Permission, Transaction, OrderService } from '@vendure/core';
import { PaytrailService } from './paytrail.service';

@Resolver()
export class PaytrailResolver {
    constructor(
        private paytrailService: PaytrailService,
        private orderService: OrderService
    ) {}

    @Transaction()
    @Mutation()
    @Allow(Permission.Owner)
    async createPaytrailPayment(
        @Ctx() ctx: RequestContext,
        @Args('orderId') orderId: string
    ) {
        const order = await this.orderService.findOne(ctx, orderId);
        if (!order) {
            throw new Error(`Order with id ${orderId} not found`);
        }
        return this.paytrailService.createPayment(ctx, order);
    }
}
