import { LanguageCode, ShippingEligibilityChecker } from '@vendure/core';
export const PickupStore = new ShippingEligibilityChecker({
    code: 'pick-up',
    description: [
        {languageCode: LanguageCode.en, value: 'pick-up from store'},
        {languageCode: LanguageCode.fi, value: 'Haku kaupasta'}
    ],
    args: {

    },

    /**
     * Must resolve to a boolean value, where `true` means that the order is
     * eligible for this ShippingMethod.
     *
     * (This example assumes a custom field "weight" is defined on the
     * ProductVariant entity)
     */
    check: (ctx, order, args) => {
        var eligible: boolean = true;
                
        return eligible;
    },
});
