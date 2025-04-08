import "@vendure/core/dist/entity/custom-entity-fields";

declare module "@vendure/core/dist/entity/custom-entity-fields" {
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
    vendorAmount? : number
    VasteCode?: string;
    dateString?: string;
    dateTime?: Date;
    ToimitusInfo?: string;
  }
  interface CustomFulfillmentFields {
    vasteOrderId?: string;
  }
  interface CustomProductFields {
    incredientlist?: string;
    allergenlist?: string;
    customizationOptions?: {
      enabled?: boolean;
      limit?: number;
      filling?: string;
    };
    extraoptions?: {
      enabled?: boolean;
      price?: number;
      extrachoices?: string;
    };
  }

  interface CustomOrderLineFields {
    fillings?: string;
    extraoptions?: {
      enabled?: boolean;
      price?: number;
      extrachoices?: string;
    };
  }
}
