import {
  dummyPaymentHandler,
  DefaultJobQueuePlugin,
  DefaultSearchPlugin,
  VendureConfig,
  LogLevel,
  DefaultLogger,
  defaultShippingCalculator,
  LanguageCode,
  Middleware,
  MiddlewareHandler
} from "@vendure/core";
import {
  EmailPlugin,
  FileBasedTemplateLoader,
} from "@vendure/email-plugin";
import { EmailHandlers } from "./Email/Emailhandler";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { StripePlugin } from "./plugins/stripe";
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
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  validate: { trustProxy: false },
});


import "dotenv/config";
import path from "path";

const IS_DEV = process.env.APP_ENV === "dev";
const serverPort = +process.env.PORT || 3000;
const URL = !IS_DEV ? process.env.PROD_URL : "http://localhost:5173";

const proxyMiddlewareHandler: MiddlewareHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.app.use(limiter)
  //req.app.set('trust proxy', true);
  next();
};


// Proxy middleware configuration
const proxyMiddleware: Middleware = {
  handler: proxyMiddlewareHandler,
  route: '/',
  beforeListen: true,
};
export const config: VendureConfig = {
  //logger: new DefaultLogger({ level: LogLevel.Debug, timestamp: false }),
  apiOptions: {
    port: serverPort,
    adminApiPath: "admin-api",
    shopApiPath: "shop-api",
    middleware: [proxyMiddleware],
    cors:{
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: "*", // Allow all headers
      credentials: true, // Allow cookies (important if you're using cookies for authentication)
    },
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
        admin: "admin-session"
      }
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
    shippingCalculators: [PickupFromStorePayment, defaultShippingCalculator],
    shippingEligibilityCheckers: [PickupStore],
    fulfillmentHandlers: [manualFulfillmentHandler],
  },
  // When adding or altering custom field definitions, the database will
  // need to be updated. See the "Migrations" section in README.md.
  customFields: {},
  plugins: [
    LandingPagePlugin,
    //PdfPrinterPlugin.init({}),
    //FeedbackPlugin.init(),
    MultivendorPlugin.init({
        platformFeePercent: 5,
        platformFeeSKU: "FEE"
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
            route: 'admin',
            port: 3002,
            app: customAdminUi({recompile: IS_DEV, devMode: IS_DEV}),
            adminUiConfig: {
                defaultLanguage: LanguageCode.fi,
                availableLanguages: [LanguageCode.fi, LanguageCode.en],
            },
        }),
  ],
};
