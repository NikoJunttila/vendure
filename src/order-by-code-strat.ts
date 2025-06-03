import { OrderByCodeAccessStrategy, type RequestContext, type Order } from "@vendure/core";

export class AllAccessOrderByCodeAccessStrategy implements OrderByCodeAccessStrategy {
    canAccessOrder(ctx: RequestContext, order: Order): boolean {

        return true;
    }
}