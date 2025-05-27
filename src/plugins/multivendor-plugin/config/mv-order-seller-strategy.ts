import {
  ChannelService,
  EntityHydrator,
  ID,
  idsAreEqual,
  Injector,
  InternalServerError,
  isGraphQlErrorResult,
  Order,
  OrderLine,
  OrderSellerStrategy,
  OrderService,
  PaymentMethod,
  PaymentMethodService,
  PaymentService,
  RequestContext,
  SplitOrderContents,
  Surcharge,
  TransactionalConnection,
} from "@vendure/core";
import {
  CONNECTED_PAYMENT_METHOD_CODE,
  MULTIVENDOR_PLUGIN_OPTIONS,
} from "../constants";
import { MultivendorPluginOptions } from "../types";

import { vendureDataToVaste } from "../../vaste-plugin/helpers";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
  interface CustomSellerFields {
    connectedAccountId: string;
  }
}

export class MultivendorSellerStrategy implements OrderSellerStrategy {
  private entityHydrator: EntityHydrator;
  private channelService: ChannelService;
  private paymentService: PaymentService;
  private paymentMethodService: PaymentMethodService;
  private connection: TransactionalConnection;
  private orderService: OrderService;
  private options: MultivendorPluginOptions;

  init(injector: Injector) {
    this.entityHydrator = injector.get(EntityHydrator);
    this.channelService = injector.get(ChannelService);
    this.paymentService = injector.get(PaymentService);
    this.paymentMethodService = injector.get(PaymentMethodService);
    this.connection = injector.get(TransactionalConnection);
    this.orderService = injector.get(OrderService);
    this.options = injector.get(MULTIVENDOR_PLUGIN_OPTIONS);
  }

  async setOrderLineSellerChannel(ctx: RequestContext, orderLine: OrderLine) {
    await this.entityHydrator.hydrate(ctx, orderLine.productVariant, {
      relations: ["channels"],
    });
    const defaultChannel = await this.channelService.getDefaultChannel();

    // If a ProductVariant is assigned to exactly 2 Channels, then one is the default Channel
    // and the other is the seller's Channel.
    if (orderLine.productVariant.channels.length === 2) {
      const sellerChannel = orderLine.productVariant.channels.find(
        (c) => !idsAreEqual(c.id, defaultChannel.id)
      );
      if (sellerChannel) {
        return sellerChannel;
      }
    }
  }

  async splitOrder(
    ctx: RequestContext,
    order: Order
  ): Promise<SplitOrderContents[]> {
    //make sellerchannel available
    await this.entityHydrator.hydrate(ctx, order, {
      relations: ["lines.sellerChannel"],
    });

    let uniqueSellers: string[] = [];
    for (const c of order.lines) {
      if (
        c.sellerChannel?.token &&
        !uniqueSellers.includes(c.sellerChannel?.token)
      ) {
        uniqueSellers.push(c.sellerChannel.token);
      }
    }
    order.customFields.vendorAmount = uniqueSellers.length;
    const partialOrders = new Map<ID, any>();
    for (const line of order.lines) {
      const sellerChannelId = line.sellerChannelId;
      if (sellerChannelId) {
        let partialOrder = partialOrders.get(sellerChannelId);
        if (!partialOrder) {
          partialOrder = {
            channelId: sellerChannelId,
            shippingLines: [],
            lines: [],
            state: "ArrangingPayment",
            customFields: { ...order.customFields },
          };
          partialOrders.set(sellerChannelId, partialOrder);
        }
        partialOrder.lines.push(line);
      }
    }

    for (const partialOrder of partialOrders.values()) {
      const shippingLineIds = new Set(
        partialOrder.lines.map((l: any) => l.shippingLineId)
      );
      partialOrder.shippingLines = order.shippingLines.filter((shippingLine) =>
        shippingLineIds.has(shippingLine.id)
      );
    }

    return [...partialOrders.values()];
  }

  async afterSellerOrdersCreated(
    ctx: RequestContext,
    aggregateOrder: Order,
    sellerOrders: Order[]
  ) {
    const paymentMethod = await this.connection.rawConnection
      .getRepository(PaymentMethod)
      .findOne({
        where: { code: CONNECTED_PAYMENT_METHOD_CODE },
      });

    if (!paymentMethod) {
      return;
    }

    const defaultChannel = await this.channelService.getDefaultChannel();

    for (const sellerOrder of sellerOrders) {
      const sellerChannel = sellerOrder.channels.find(
        (c) => !idsAreEqual(c.id, defaultChannel.id)
      );
      if (!sellerChannel) {
        throw new InternalServerError(
          `Could not determine Seller Channel for Order ${sellerOrder.code}`
        );
      }
      await this.entityHydrator.hydrate(ctx, sellerChannel, {
        relations: ["seller"],
      });
      // Apply the custom fields from the default order
      //TODO fix vaste backend
      // const vasteCode = await vendureDataToVaste(
      //   aggregateOrder,
      //   sellerChannel.seller
      // );
      // sellerOrder.customFields = { ...aggregateOrder.customFields };

      // sellerOrder.customFields.VasteCode = vasteCode;

      // Add platform fee surcharge
      sellerOrder.surcharges = [
        await this.createPlatformFeeSurcharge(ctx, sellerOrder),
      ];

      await this.orderService.applyPriceAdjustments(ctx, sellerOrder);
      // Add payment method
      console.log({
        method: paymentMethod.code,
        metadata: {
          channelToken: defaultChannel.token,
          transfer_group: aggregateOrder.code,
          connectedAccountId:
            sellerChannel.seller?.customFields.connectedAccountId,
          orderId: aggregateOrder.id,
          orderCode: aggregateOrder.code,
          paymentMethod: aggregateOrder.payments[0].method,
        },
      });
      const result = await this.orderService.addPaymentToOrder(
        ctx,
        sellerOrder.id,
        {
          method: paymentMethod.code,
          metadata: {
            channelToken: defaultChannel.token,
            transfer_group: aggregateOrder.code,
            connectedAccountId:
              sellerChannel.seller?.customFields.connectedAccountId,
            orderId: aggregateOrder.id,
            orderCode: aggregateOrder.code,
            paymentMethod: aggregateOrder.payments[0].method,
          },
        }
      );
      console.log(result);
      if (isGraphQlErrorResult(result)) {
        throw new InternalServerError(result.message);
      }
    }
  }

  private async createPlatformFeeSurcharge(
    ctx: RequestContext,
    sellerOrder: Order
  ) {
    const platformFee = Math.round(
      sellerOrder.totalWithTax * -(this.options.platformFeePercent / 100)
    );
    return this.connection.getRepository(ctx, Surcharge).save(
      new Surcharge({
        taxLines: [],
        sku: this.options.platformFeeSKU,
        description: "Platform fee",
        listPrice: platformFee,
        listPriceIncludesTax: true,
        order: sellerOrder,
      })
    );
  }
}
