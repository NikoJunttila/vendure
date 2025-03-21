import {
    RequestContext, PriceCalculationResult,
    ProductVariant, OrderItemPriceCalculationStrategy
} from '@vendure/core';

export class ExtraItemPriceStrategy implements OrderItemPriceCalculationStrategy {

    calculateUnitPrice(
        ctx: RequestContext,
        productVariant: ProductVariant,
        customFields: { extraoptions:{
            enabled: boolean,
            price: number,
            extrachoices: string
        } },
    ) {
        let price = productVariant.listPrice;
        let opt = customFields.extraoptions
        if (opt.enabled) {
            if(opt.extrachoices){
                const arr = opt.extrachoices.split(",")
                if (arr.length > 0){
                    price += arr.length * opt.price;
                }
            }
        }
        return {
            price,
            priceIncludesTax: productVariant.listPriceIncludesTax,
        };
    }
}