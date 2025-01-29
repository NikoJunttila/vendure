import { LanguageCode,ShippingCalculator } from "@vendure/core";

export const PickupFromStorePayment = new ShippingCalculator({
    code:'flat-rate-calculator',
    description: [{languageCode: LanguageCode.en, value: "Pick up from store"}, {languageCode: LanguageCode.fi, value: "Nouto kaupasta"}],
    args:{
        price:{
            type:'float',
            ui:{component: 'string', suffix:'€'},
            label:[{languageCode: LanguageCode.en, value: 'Price'},
            {languageCode:LanguageCode.fi, value: "Hinta"}]
        }
    },
    calculate: async(ctx, order, args) =>{
         return{
            price: args.price * 100,
            priceIncludesTax: false,
            taxRate: 0,
            metadata:{},
        };
    }
});
