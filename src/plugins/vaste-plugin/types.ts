import '@vendure/core/dist/entity/custom-entity-fields';

declare module '@vendure/core/dist/entity/custom-entity-fields' {
    interface CustomSellerFields {
        pickupAddress?: string;
        pickupApartment?: string;
        pickupPostalCode?: string;
        pickupCity?: string;
        Email?: string;
        Phone?: string;
        firstName?: string;
        lastName?: string;
    }
    interface CustomOrderFields {
        VasteCode?: string;
        dateString?: string;
        dateTime?: Date;
        ToimitusInfo?: string;
    }
    interface CustomFulfillmentFields {
        vasteOrderId?: string;
    }
    interface CustomProductFields {
        customizationOptions?: {
            enabled?: boolean;
            limit?: number;
            filling?: string;
        };
    }

    interface CustomOrderLineFields {
        fillings?: string;
    }
}