import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  DefaultSchedulerPlugin,
  VendureConfig,
  LogLevel,
  DefaultLogger,
  defaultShippingCalculator,
  LanguageCode,
  Middleware,
  MiddlewareHandler,
} from "@vendure/core";
import { EmailPlugin, FileBasedTemplateLoader } from "@vendure/email-plugin";
import { EmailHandlers } from "./Email/Emailhandler";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { StripePlugin } from "./plugins/stripe";
import { GraphiqlPlugin } from "@vendure/graphiql-plugin";

import { PaytrailPaymentsPlugin } from "./plugins/paytrail-plugin/paytrail-plugin";
import { PickupStore } from "./shipping/shipping-methods/pickup-plugin";
import { manualFulfillmentHandler } from "@vendure/core";
import { PickupFromStorePayment } from "./shipping/shipping-methods/pickupPayment";
import { VastePlugin } from "./plugins/vaste-plugin/vaste.plugin";
import { MultivendorPlugin } from "./plugins/multivendor-plugin/multivendor.plugin";
import { LandingPagePlugin } from "./plugins/landing-page-plugin.ts/landing-page-plugin";
import { FeedbackPlugin } from "./plugins/feedback-plugin/feedback.plugin";
import { PdfPrinterPlugin } from "./plugins/pdf-printer-plugin/pdf-printer.plugin";
import { customAdminUi } from "./compile-admin-ui";
import { ExtraItemPriceStrategy } from "./price-calculation-strategy";
import { MultiSinglePayment } from "./shipping/shipping-methods/multi-vendor-single";
import { requestLogger } from "./middleware/shop-api-logger";

import "dotenv/config";
import path from "path";

const IS_DEV = process.env.APP_ENV === "dev";
const serverPort = +process.env.PORT || 3000;
const URL = !IS_DEV ? process.env.PROD_URL : "http://localhost:5173";

export const config: VendureConfig = {
  //logger: new DefaultLogger({ level: LogLevel.Debug, timestamp: false }),
  apiOptions: {
    port: serverPort,
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    middleware: [
      ...(process.env.LOG_SHOP_QUERIES
        ? [
            {
              route: "/shop-api",
              handler: requestLogger,
            },
          ]
        : []),
    ],
    // The following options are useful in development mode,
    // but are best turned off for production for security
    // reasons.
    ...(IS_DEV
      ? {
          adminApiPlayground: {
            settings: { "request.credentials": "include" },
          },
          adminApiDebug: true,
          shopApiPlayground: {
            settings: { "request.credentials": "include" },
          },
          shopApiDebug: true,
        }
      : {}),
  },
  authOptions: {
    tokenMethod: ["bearer", "cookie"],
    superadminCredentials: {
      identifier: process.env.SUPERADMIN_USERNAME,
      password: process.env.SUPERADMIN_PASSWORD,
    },
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
      name: {
        shop: "session",
        admin: "admin-session",
      },
    },
  },
  dbConnectionOptions: {
    type: "postgres",
    synchronize: false,
    migrations: [path.join(__dirname, "./migrations/*.+(js|ts)")],
    logging: false,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    host: process.env.DB_HOST,
    //@ts-ignore
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  paymentOptions: {
    paymentMethodHandlers: [dummyPaymentHandler],
  },
  shippingOptions: {
    shippingCalculators: [
      PickupFromStorePayment,
      defaultShippingCalculator,
      MultiSinglePayment,
    ],
    shippingEligibilityCheckers: [PickupStore],
    fulfillmentHandlers: [manualFulfillmentHandler],
  },
  orderOptions: {
    orderItemPriceCalculationStrategy: new ExtraItemPriceStrategy(),
  },
  customFields: {
    Product: [
      {
        name: "incredientlist",
        type: "text",
        label: [
          { languageCode: LanguageCode.en, value: "incredient list" },
          {
            languageCode: LanguageCode.fi,
            value:
              "Ainesosaluettelo erottamalla kukin vaihtoehto toisistaan , merkillä.",
          },
        ],
      },
      {
        name: "allergenlist",
        type: "text",
        label: [
          { languageCode: LanguageCode.en, value: "allergen list" },
          {
            languageCode: LanguageCode.fi,
            value:
              "Luettele mahdolliset allergeenit asiakkaalle (esim. gluteeni), erottamalla kukin vaihtoehto toisistaan , merkillä.",
          },
        ],
      },
      // Modified customizationOptions
      {
        name: "customizationOptions",
        type: "struct",
        label: [
          { languageCode: LanguageCode.en, value: "customizationOptions" },
          { languageCode: LanguageCode.fi, value: "Kustomointi vaihtoehdot" },
        ],
        fields: [
          {
            name: "enabled",
            type: "boolean",
            description: [
              { languageCode: LanguageCode.en, value: "Activate this field" },
              { languageCode: LanguageCode.fi, value: "Aktivoi kustomointi" },
            ],
          },
          {
            name: "limit",
            type: "int",
            description: [
              {
                languageCode: LanguageCode.en,
                value: "Limit number of options user can choose",
              },
              {
                languageCode: LanguageCode.fi,
                value: "Rajoita käyttäjän valinta määrää",
              },
            ],
          },
          {
            name: "filling",
            type: "text",
            description: [
              {
                languageCode: LanguageCode.en,
                value:
                  "Enter extra fillings user can choose with , seperating each option",
              },
              {
                languageCode: LanguageCode.fi,
                value:
                  "Kirjoita ylimääräiset täytteet, jotka käyttäjä voi valita, erottamalla kukin vaihtoehto toisistaan , merkillä.",
              },
            ],
          },
        ],
      },
      {
        name: "extraoptions",
        type: "struct",
        label: [
          { languageCode: LanguageCode.en, value: "Extra choices" },
          {
            languageCode: LanguageCode.fi,
            value: "Extra maksulliset vaihtoehdot",
          },
        ],
        fields: [
          {
            name: "enabled",
            type: "boolean",
            description: [
              { languageCode: LanguageCode.en, value: "Activate this field" },
              { languageCode: LanguageCode.fi, value: "Aktivoi kustomointi" },
            ],
          },
          {
            name: "extrachoices",
            type: "text",
            ui: { component: "json-editor-form-input" },
            description: [
              {
                languageCode: LanguageCode.en,
                value: "Additional toppings with prices (JSON format)",
              },
              {
                languageCode: LanguageCode.fi,
                value:
                  "Kirjoita ylimääräiset täytteet, jotka käyttäjä voi valita maksua vastaan, erottamalla kukin vaihtoehto toisistaan , merkillä.",
              },
            ],
          },
        ],
      },
    ],
    OrderLine: [
      { name: "fillings", type: "string" },
      {
        name: "extrachoicestring",
        type: "string",
      },
      {
        name: "extraoptions",
        type: "struct",
        label: [
          { languageCode: LanguageCode.en, value: "Extra choices" },
          {
            languageCode: LanguageCode.fi,
            value: "Extra maksulliset vaihtoehdot",
          },
        ],
        fields: [
          {
            name: "enabled",
            type: "boolean",
            description: [
              { languageCode: LanguageCode.en, value: "Activate this field" },
              { languageCode: LanguageCode.fi, value: "Aktivoi kustomointi" },
            ],
          },
          {
            name: "price",
            type: "int",
            description: [
              {
                languageCode: LanguageCode.en,
                value: "Extra price per item in cents",
              },
              {
                languageCode: LanguageCode.fi,
                value: "Extra hinta per tuote senteissä",
              },
            ],
          },
          {
            name: "extrachoices",
            type: "text",
            description: [
              {
                languageCode: LanguageCode.en,
                value: "Additional toppings with prices",
              },
              {
                languageCode: LanguageCode.fi,
                value:
                  "Kirjoita ylimääräiset täytteet, jotka käyttäjä voi valita maksua vastaan.",
              },
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    // LandingPagePlugin,
    // PdfPrinterPlugin.init({}),
    // FeedbackPlugin.init(),
    DefaultSchedulerPlugin.init(),
    GraphiqlPlugin.init(),
    MultivendorPlugin.init({
      platformFeePercent: 5,
      platformFeeSKU: "FEE",
    }),
    PaytrailPaymentsPlugin.init(),
    VastePlugin.init(),
    StripePlugin.init({
      storeCustomersInStripe: true,
    }),
    AssetServerPlugin.init({
      route: "assets",
      assetUploadDir: path.join(__dirname, "../static/assets"),
      // For local dev, the correct value for assetUrlPrefix should
      // be guessed correctly, but for production it will usually need
      // to be set manually to match your production url.
      assetUrlPrefix: IS_DEV ? undefined : URL + "/assets/",
    }),
    DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
    DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
    EmailPlugin.init({
      devMode: true,
      outputPath: path.join(__dirname, "../static/email/test-emails"),
      route: "mailbox",
      handlers: EmailHandlers,
      templateLoader: new FileBasedTemplateLoader(
        path.join(__dirname, "../static/email/templates")
      ),
      globalTemplateVars: {
        // The following variables will change depending on your storefront implementation.
        // Here we are assuming a storefront running at http://localhost:8080.
        fromAddress: '"example" <noreply@example.com>',
        verifyEmailAddressUrl: URL + "/verify",
        passwordResetUrl: URL + "/password-reset",
        changeEmailAddressUrl: URL + "/verify-email-address-change",
      },
    }),
    AdminUiPlugin.init({
      route: "admin",
      port: 3002,
      // app: customAdminUi({ recompile: IS_DEV, devMode: IS_DEV }),
      adminUiConfig: {
        defaultLanguage: LanguageCode.fi,
        availableLanguages: [LanguageCode.fi, LanguageCode.en],
      },
    }),
  ],
};
