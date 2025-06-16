import {
  PluginCommonModule,
  VendurePlugin,
  Product,
  OrderLine,
  Ctx,
  RequestContext,
    TransactionalConnection,
} from "@vendure/core";
import { gql } from "graphql-tag";
import { Resolver, ResolveField, Parent } from "@nestjs/graphql";

@Resolver("Product")
export class ProductChannelResolver {
  @ResolveField()
  async channels(@Parent() product: Product) {
    return product.channels || [];
  }
}

@Resolver("OrderLine")
export class OrderlineChannelResolver {
  constructor(private connection: TransactionalConnection) {}

  @ResolveField()
  async channels(@Ctx() ctx: RequestContext, @Parent() orderLine: OrderLine) {
    // Option 1: Load the OrderLine with channel relation
    const orderLineWithChannel = await this.connection
      .getRepository(ctx, OrderLine)
      .findOne({
        where: { id: orderLine.id },
        relations: ['sellerChannel']
      });
    
    return orderLineWithChannel?.sellerChannel ? [orderLineWithChannel.sellerChannel] : [];
    
    // Option 2: Alternative approach - if sellerChannel is already loaded
    // return orderLine.sellerChannel ? [orderLine.sellerChannel] : [];
  }
}


@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    schema: gql`
      extend type Product {
        channels: [Channel!]!
      }
      extend type OrderLine{
        channels: [Channel]
      }
    `,
    resolvers: [ProductChannelResolver, OrderlineChannelResolver],
  },
})
export class ChannelProductPlugin {}
