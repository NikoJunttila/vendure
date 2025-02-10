import { VendureEvent, RequestContext, Order } from "@vendure/core";

export class AdminNotifEvent extends VendureEvent {
    constructor(
        public ctx: RequestContext,
        //public to: string,
        public order: Order,
       /*  public formdata: {
          name: string;
          content: string;
          // ...other values
        }, */
    ) {
        super();
    }
}