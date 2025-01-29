import {
  PluginCommonModule,
  RuntimeVendureConfig,
  VendurePlugin,
  OrderService,
  LanguageCode
} from "@vendure/core";
import { paytrailPaymentMethodHandler } from "./paytrailPaymentMethodHandler";
import { PaytrailService } from "./paytrail.service";
import { PaytrailResolver } from "./paytrail.resolver";
import { PaytrailShopResolver } from "./paytrailShop.resolver";
import gql from "graphql-tag";

/**
 * Paytrail Payments provider for Vendure
 */
@VendurePlugin({
  compatibility: "^3.0.0",
  imports: [PluginCommonModule],
  controllers: [],
  providers: [OrderService, PaytrailService],
  adminApiExtensions: {
    resolvers: [PaytrailResolver],
    schema: gql`
      extend type Mutation {
        createPaytrailPayment(orderId: ID!): PaymentResult!
      }
      type PaymentResult {
        amount: Int!
        state: String!
        metadata: JSON
      }
    `,
  },
  shopApiExtensions: {
    resolvers: [PaytrailShopResolver],
    schema: gql`
      extend type Mutation {
        createPaytrailPaymentIntent: PaytrailPaymentIntent!
      }
      extend type Mutation {
        createMultiPTintent: PaytrailPaymentIntent!
      }
      type PaytrailPaymentIntent {
        href: String!
      }
    `,
  },
  configuration: config => {
    config.paymentOptions.paymentMethodHandlers.push(
      paytrailPaymentMethodHandler
    );
      config.customFields.Seller.push({
        name: "PaytrailMerchantId",
        type: "string",
        label: [{ languageCode: LanguageCode.en, value: "PaytrailMerchantId"},{ languageCode: LanguageCode.fi, value: "PaytrailKauppiasId" }],
        nullable: true,
        public: true,
        readonly: false,
      });
      config.customFields.Order.push({
        name: "PaytrailId",
        type: "string",
        label: [{ languageCode: LanguageCode.en, value: "PaytrailId"},{ languageCode: LanguageCode.fi, value: "PaytrailId" }],
        nullable: true,
        public: true,
        readonly: false,
      });
    return config;
  },
})
export class PaytrailPaymentsPlugin {
  static init() {
    return PaytrailPaymentsPlugin;
  }
}
