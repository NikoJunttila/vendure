import { OrderLine} from "@vendure/core";
import { PaytrailItem } from "./types";
import {randomUUID} from "crypto"

interface Seller {
    customFields: {
        PaytrailMerchantId?: string;
    };
}

/**
 * Converts Vendure OrderLines to paytrail OrderLine.
 * 
 * @param orderLines The Vendure OrderLines to convert.
 * @returns paytrail OrderLine, consisting of Vendure OrderLines.
 */
export const generateOrderLines = (orderLines: OrderLine[]): PaytrailItem[] => {

    const order_lines: PaytrailItem[] = orderLines.map((line) => (
        {
            unitPrice: line?.unitPriceWithTax,
            units: line?.quantity,
            vatPercentage: line?.taxRate,
            productCode: line?.productVariant.sku,
            description: "testing",
        }
    ));
   return [...order_lines];
}
/**
 * Converts Vendure OrderLines to paytrail OrderLine.
 * 
 * @param orderLines The Vendure OrderLines to convert.
 * @returns paytrail OrderLine, consisting of Vendure OrderLines.
 */
export const generateMultiOrderLines = async (
    orderLines: OrderLine[], 
    defaultMerchant: string,
    sellerService: any,
    ctx: any
): Promise<PaytrailItem[]> => {
    const order_lines: PaytrailItem[] = await Promise.all(
        orderLines.map(async (line) => {
            let merchantId = defaultMerchant;
            
            if (line.sellerChannelId) {
                const seller = await sellerService.findOne(ctx, line.sellerChannelId) as Seller | null;
                // Use seller's PaytrailMerchantId if available, otherwise fall back to default
                merchantId = seller?.customFields?.PaytrailMerchantId || defaultMerchant;
            }
            console.log("merchant id ",merchantId)

            return {
                unitPrice: line.unitPriceWithTax,
                units: line.quantity,
                vatPercentage: line.taxRate,
                productCode: line.productVariant.sku,
                description: "testing",
                stamp: `${randomUUID()}`,
                reference: `${randomUUID()}`,
                merchant: merchantId,
                commission: {
                    merchant: merchantId,
                    amount: 0
                }
            };
        })
    );

    return order_lines;
};