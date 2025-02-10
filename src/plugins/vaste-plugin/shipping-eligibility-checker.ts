import { LanguageCode, ShippingEligibilityChecker } from '@vendure/core';
import { postalCodeChecker } from 'src/plugins/vaste-plugin/vaste-types';
export const PostalCodeChecker = new ShippingEligibilityChecker({
    code: 'postal-code-checker',
    description: [
        {languageCode: LanguageCode.en, value: 'Postal Code Checker'},
        {languageCode: LanguageCode.fi, value: 'Postinumeron tarkistaja'}
    ],
    args: {
        postalCode: {
            type: 'string',
            ui: {component: 'json-editor-form-input'},
            label: [{languageCode: LanguageCode.en, value: 'Postal Code Zones'},{languageCode: LanguageCode.fi, value: 'Postinumero alueet'}],
            description: [
                {
                    languageCode: LanguageCode.en,
                    value: 'Shipping is eligible only if delivery address is in a predefined postal code zone. Split the postal codes with a comma, e.g. 00000,01111,...',
                },
                {
                    languageCode: LanguageCode.fi,
                    value: 'Toimitus on mahdollista vain toimitusehdoissa ilmoitetun postinumeron alueen sisällä. Erota postinumerot toisistaan pilkulla, esim. 00000,01111,...',
                },
            ],
            defaultValue: `{
                "data":[
                    {
                        "postalCodes":[],
                        "price":1000
                }
            ]
        }`
        },
    },

    /**
     * Must resolve to a boolean value, where `true` means that the order is
     * eligible for this ShippingMethod.
     *
     * (This example assumes a custom field "weight" is defined on the
     * ProductVariant entity)
     */
    check: (ctx, order, args) => {
        var eligible: boolean = false;
        var data: postalCodeChecker = JSON.parse(args.postalCode);
        data.data.forEach((element:any) => {
            element.postalCodes.forEach((elem:number) =>{
                
                if(elem.toString() == order.shippingAddress.postalCode ){
                    eligible = true;
                    order.shippingWithTax = element.price;
                }
            })
        });
        
        return eligible;
    },
});
