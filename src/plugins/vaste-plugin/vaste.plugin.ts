import { LanguageCode, PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { VasteShippingCalculator } from './vaste-shipping-calculator';
import { vasteFulfillmentHandler } from './vaste-fulfillment-handler';
import { PostalCodeChecker } from './shipping-eligibility-checker';

/**
 * @description
 *  Vaste delivery plugin
 * 
 * 
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
    controllers: [],
    providers: [],
    configuration: config => {
        config.shippingOptions.fulfillmentHandlers.push(vasteFulfillmentHandler);
        config.shippingOptions.shippingCalculators.push(VasteShippingCalculator);
        config.shippingOptions.shippingEligibilityCheckers.push(PostalCodeChecker);
        
        // Seller custom fields
        config.customFields.Seller.push(
            {
                name: 'pickupAddress',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Pickup Address' },
                    { languageCode: LanguageCode.fi, value: 'Nouto-osoite' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'pickupApartment',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Apartment/Suite' },
                    { languageCode: LanguageCode.fi, value: 'Huoneisto' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'pickupPostalCode',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Postal Code' },
                    { languageCode: LanguageCode.fi, value: 'Postinumero' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'pickupCity',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'City' },
                    { languageCode: LanguageCode.fi, value: 'Kaupunki' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'Email',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Email Address' },
                    { languageCode: LanguageCode.fi, value: 'Sähköpostiosoite' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'Phone',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Phone Number' },
                    { languageCode: LanguageCode.fi, value: 'Puhelinnumero' }
                ],
                nullable: true,
                public: true,
            }
        );

        // Order custom fields
        config.customFields.Order.push(
            {
                name: 'VasteCode',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Vaste Code' },
                    { languageCode: LanguageCode.fi, value: 'Vaste-koodi' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'dateString',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Date String' },
                    { languageCode: LanguageCode.fi, value: 'Päivämäärä' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'dateTime',
                type: 'datetime',
                label: [
                    { languageCode: LanguageCode.en, value: 'Delivery Date & Time' },
                    { languageCode: LanguageCode.fi, value: 'Toimituspäivä ja -aika' }
                ],
                nullable: true,
                public: true,
            },
            {
                name: 'ToimitusInfo',
                type: 'string',
                label: [
                    { languageCode: LanguageCode.en, value: 'Delivery Information' },
                    { languageCode: LanguageCode.fi, value: 'Toimitustiedot' }
                ],
                nullable: true,
                public: true,
            }
        );

        // Fulfillment custom fields
        config.customFields.Fulfillment.push({
            name: 'vasteOrderId',
            type: 'string',
            label: [
                { languageCode: LanguageCode.en, value: 'Vaste Order ID' },
                { languageCode: LanguageCode.fi, value: 'Vaste-tilausnumero' }
            ],
            nullable: true,
            public: true,
        });

        return config;
    },
})
export class VastePlugin {
    static init() {
        return VastePlugin;
    }
}