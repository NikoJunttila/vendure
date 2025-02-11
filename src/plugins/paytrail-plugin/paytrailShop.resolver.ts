import { Mutation, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction, ActiveOrderService, OrderService } from '@vendure/core';
import { PaytrailService } from './paytrail.service';

@Resolver()
export class PaytrailShopResolver {
    constructor(
        private paytrailService: PaytrailService,
        private activeOrderService: ActiveOrderService,
        private orderService: OrderService,
    ) {}

    @Transaction()
    @Mutation()
    async createPaytrailPaymentIntent(@Ctx() ctx: RequestContext) {
        let order;
        
        try {
            order = await this.activeOrderService.getActiveOrder(ctx, undefined);
        } catch (error) {
            throw new Error('No active order found');
        }
        if (!order) {
            throw new Error('No active order found');
        }

        //const order2 = await this.orderService.getActiveOrderForUser(ctx, userID);
        const orderFull = await this.orderService.findOne(ctx, order.id)
        if (orderFull){
        const paymentResult = await this.paytrailService.createPayment(ctx, orderFull);
        if (paymentResult.metadata.paytrail.data.href) {
            return {
                href: paymentResult.metadata.paytrail.data.href,
            };
        } else {
            throw new Error('Failed to create Paytrail payment intent');
        }
        }else {
          throw new Error("Error getting order by id")
        }
    }
    @Transaction()
    @Mutation()
    async createMultiPTintent(@Ctx() ctx: RequestContext) {
        let order;
        
        try {
            order = await this.activeOrderService.getActiveOrder(ctx, undefined);
        } catch (error) {
            console.error(error)
            throw new Error('No active order found');
        }
        if (!order) {
            console.error("no active order")
            throw new Error('No active order found');
        }

        //const order2 = await this.orderService.getActiveOrderForUser(ctx, userID);
        const orderFull = await this.orderService.findOne(ctx, order.id)
        if (orderFull){
        const paymentResult = await this.paytrailService.createMultiPayment(ctx, orderFull);
        if (paymentResult.metadata.paytrail.data.href) {
            return {
                href: paymentResult.metadata.paytrail.data.href,
            };
        } else {
            console.error("failed to create pt intent")
            throw new Error('Failed to create Paytrail payment intent');
        }
        }else {
          console.error("error getting order by ID")
          throw new Error("Error getting order by id")
        }
    }
}