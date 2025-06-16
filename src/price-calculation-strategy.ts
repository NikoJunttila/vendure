import {
  RequestContext,
  PriceCalculationResult,
  ProductVariant,
  OrderItemPriceCalculationStrategy,
} from "@vendure/core";

export class ExtraItemPriceStrategy
  implements OrderItemPriceCalculationStrategy
{
  calculateUnitPrice(
    ctx: RequestContext,
    productVariant: ProductVariant,
    customFields: {
      extraoptions: {
        enabled: boolean;
        price: number;
        extrachoices: string;
      };
    }
  ) {
    let price = productVariant.listPrice;
    let opt = customFields.extraoptions;

    if (opt && opt.enabled && opt.extrachoices) {
      //extraoptions: { enabled: true, extrachoices: 'pekoni:200,kebab:300' }
      //const arr = [{name:"pekoni",price:200},{name:"kebab",price:300},{name:"cheese",price:400}]
      const arr = opt.extrachoices.split(",").map((item) => {
        const [name, priceStr] = item.split(":");
        return {
          name: name,
          price: parseInt(priceStr, 10),
        };
      });
      for (const obj of arr) {
        price += obj.price;
      }
    }
    return {
      price,
      priceIncludesTax: productVariant.listPriceIncludesTax,
    };
  }
}
