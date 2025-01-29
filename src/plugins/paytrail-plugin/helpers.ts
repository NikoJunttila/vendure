import { OrderLine} from "@vendure/core";
import { PaytrailItem } from "./types";
import {v4 as uuidv4} from 'uuid';
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
export const generateMultiOrderLines = (orderLines: OrderLine[], merchant : string): PaytrailItem[] => {

    const order_lines: any[] = orderLines.map((line) => (
        {
            unitPrice: line?.unitPriceWithTax,
            units: line?.quantity,
            vatPercentage: line?.taxRate,
            productCode: line?.productVariant.sku,
            description: "testing",
            stamp:uuidv4(),
            reference:uuidv4(),
            merchant:merchant,
            commission:{
                merchant,
                amount: line?.unitPriceWithTax / 10
            }
        }
    ));
   return [...order_lines];
}