import { LanguageCode,ShippingCalculator } from "@vendure/core";
import {VasteAPI} from './vaste-data-source'
import type {KeyValueCache} from '@apollo/utils.keyvaluecache';

var _cache: KeyValueCache;
export const VasteShippingCalculator = new ShippingCalculator({
    code:'external-shipping-calculator',
    description: [{languageCode: LanguageCode.en, value: "Calculates the cost of shipping based on the route points."}, {languageCode: LanguageCode.fi, value: "Lasketaan hinta kuljetukselle reittipisteiden perusteella."}],
    args:{
        taxRate:{
            type:'float',
            ui:{component: 'number-form-input', suffix:'%'},
            label:[{languageCode: LanguageCode.en, value: 'Tax rate'},{languageCode:LanguageCode.fi, value: "ALV"}]
        }
    },
    calculate: async(ctx, order, args) =>{

        //Get data from Vaste
        //var options = {
        //    apikey: "",
        //    cache: _cache
        //}
        //const date = new Date();
        //const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
        //
        //const Vaste = new VasteAPI(options);
        //console.log('Calling VasteAPI with date:', formattedDate);
        //
        //const response = await Vaste.getRate(
        //  "Talonpojankatu 2, 67100 Kokkola",
        //  "Tehtaankatu 1, 67100 Kokkola",
        //  formattedDate
        //);
        //console.log('VasteAPI response:', JSON.stringify(response, null, 2));
        
        //price is 0 for this pilot period
        //price: order.shippingWithTax || response.data[0].amount*100,
        return{
            price: 0,
            priceIncludesTax: ctx.channel.pricesIncludeTax,
            taxRate: args.taxRate,
            metadata:{},
        };
    }
});
