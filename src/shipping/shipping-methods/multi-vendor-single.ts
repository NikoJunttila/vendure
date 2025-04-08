import { LanguageCode,ShippingCalculator, } from "@vendure/core";
    

export const MultiSinglePayment = new ShippingCalculator({
    code:'flat-rate-multi-vendor',
    description: [{languageCode: LanguageCode.en, value: "Multivendor with single price"}, {languageCode: LanguageCode.fi, value: "Markkinapaikka yhdellä hinnalla"}],
    args:{
        price:{
            type:'float',
            ui:{component: 'string', suffix:'€'},
            label:[{languageCode: LanguageCode.en, value: 'Price'},
            {languageCode:LanguageCode.fi, value: "Hinta"}]
        }
    },
    calculate: async(ctx, order, args) => {
        let divider = 1
        if (order.customFields.vendorAmount && order.customFields.vendorAmount > 0){
            divider = order.customFields.vendorAmount
        } else{
            let uniqueSellers : string[] = []
            for (const c of order.lines){
                if (c.sellerChannel?.token && !uniqueSellers.includes(c.sellerChannel?.token)){
                    uniqueSellers.push(c.sellerChannel.token)
                }
            }
            divider = uniqueSellers.length
        }
            
        const flatRate = args.price ?? 1000
        const priceInCents = (flatRate * 100) / divider
         return {
            price: priceInCents,
            priceIncludesTax: true,
            taxRate: 0,
            metadata:{},
        };
    }
});