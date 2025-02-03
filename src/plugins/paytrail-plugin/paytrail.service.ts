import { Injectable, Inject } from "@nestjs/common";
import {
  RequestContext,
  Order,
  Logger,
  ConfigService,
  SellerService,
} from "@vendure/core";
import {
  PaytrailClient,
  type CreateSiSPaymentRequest,
} from "@paytrail/paytrail-js-sdk";
import { PaytrailData, PaytrailItem } from "./types";
import { generateOrderLines, generateMultiOrderLines } from "./helpers";
import { loggerCtx } from "./constants";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class PaytrailService {
  constructor(
    private configService: ConfigService,
    private sellerService: SellerService
  ) {}

  async createPayment(ctx: RequestContext, order: Order): Promise<any> {
    Logger.debug("createPayment() invoked", loggerCtx);
    const url = process.env.STOREFRONT;
    try {
      //TODO replace with args from control panel
      const paytrail = new PaytrailClient({
        //@ts-ignore
        merchantId: process.env.PAYTRAIL_MERCHANTID,
        secretKey: process.env.PAYTRAIL_SECRETKEY,
        platformName: "Jatulintarhashop",
      });

      let newUUID = uuidv4();
      const data: PaytrailData = {
        stamp: `${newUUID}`,
        reference: order.code,
        amount: order.totalWithTax,
        currency: "EUR",
        language: "FI",
        items: generateOrderLines(order.lines),
        customer: {
          //@ts-ignore
          email: order.customer.emailAddress,
        },
        redirectUrls: {
          success: `${process.env.paytrail_success_redirect}/${order.code}`,
          cancel: `${process.env.paytrail_cancel_redirect}`,
        },
      };

      const orderShippingItem: PaytrailItem = {
        unitPrice: order.shippingWithTax,
        units: 1,
        vatPercentage: 0,
        productCode: "shipping",
        description: "palvelu maksu",
      };

      data.items.push(orderShippingItem);
      Logger.debug(JSON.stringify(data, null, 2), loggerCtx);
      const paytrailRes = await paytrail.createPayment(data);
      //paytrail.createRefund()
      Logger.debug(JSON.stringify(paytrailRes, null, 2), loggerCtx);
      if (paytrailRes.status === 400) {
        return {
          amount: order.totalWithTax,
          state: "Declined",
          metadata: {
            errorMessage: paytrailRes.message,
          },
        };
      }
      return {
        amount: order.totalWithTax,
        state: "Authorized",
        metadata: {
          paytrail: paytrailRes,
        },
      };
    } catch (error: any) {
      Logger.error(JSON.stringify(error, null, 2), loggerCtx);
      return {
        amount: order.totalWithTax,
        state: "Declined",
        metadata: {
          errorMessage: error.message,
        },
      };
    }
  }

  async createMultiPayment(ctx: RequestContext, order: Order): Promise<any> {
    Logger.debug("createPayment() invoked", loggerCtx);

    try {
      //TODO replace with args from control panel
      const paytrail = new PaytrailClient({
        //@ts-ignore
        merchantId: process.env.PAYTRAIL_SHOP_IN_SHOP_MERCHANT,
        secretKey: process.env.PAYTRAIL_SHOP_IN_SHOP_KEY,
        platformName: "JatulintarhaShop",
      });

      //TODO GET FROM SELLER CUSTOM FIELDS
      const defaultMerchant: string | undefined = process.env.MERCHANT;
      if (!defaultMerchant) console.error("no merchant set");
      /*         for (const line of order.lines){
            console.log(line)
            if(line.sellerChannelId){
                const seller = await this.sellerService.findOne(ctx,line.sellerChannelId)
                console.log(seller)
                //@ts-ignore
                console.log(seller?.customFields.PaytrailMerchantId)
            }
        } */
      const newUUID = uuidv4();
      const data: CreateSiSPaymentRequest = {
        stamp: `${newUUID}`,
        reference: order.code,
        amount: order.totalWithTax,
        currency: "EUR",
        language: "FI",
        items: await generateMultiOrderLines(
          order.lines,
          defaultMerchant!,
          this.sellerService,
          ctx
        ),
        customer: {
          //@ts-ignore
          email: order.customer.emailAddress,
        },
        redirectUrls: {
          success: `${process.env.paytrail_success_redirect}/${order.code}`,
          cancel: `${process.env.paytrail_cancel_redirect}`,
        },
      };

      const orderShippingItem: any = {
        unitPrice: order.shippingWithTax,
        units: 1,
        vatPercentage: 0,
        productCode: "shipping",
        description: "palvelu maksu",
        merchant: defaultMerchant,
        stamp: uuidv4(),
        reference: uuidv4(),
      };
      data.items!.push(orderShippingItem);

      Logger.debug(JSON.stringify(data, null, 2), loggerCtx);
      const paytrailRes = await paytrail.createShopInShopPayment(data);

      Logger.debug(JSON.stringify(paytrailRes, null, 2), loggerCtx);
      if (paytrailRes.status === 400) {
        return {
          amount: order.totalWithTax,
          state: "Declined",
          metadata: {
            errorMessage: paytrailRes.message,
          },
        };
      }
      return {
        amount: order.totalWithTax,
        state: "Authorized",
        metadata: {
          paytrail: paytrailRes,
        },
      };
    } catch (error: any) {
      Logger.error(JSON.stringify(error, null, 3), loggerCtx);
      console.log(error);
      return {
        amount: order.totalWithTax,
        state: "Declined",
        metadata: {
          errorMessage: error.message,
        },
      };
    }
  }
}
