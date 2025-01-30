import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { StripePlugin } from './plugins/stripe';
import { PaytrailPaymentsPlugin } from './plugins/paytrail-plugin/paytrail-plugin';
import { vasteFulfillmentHandler } from './shipping/fulfillment/vaste-fulfillment-handler';
import { PostalCodeChecker } from './shipping/shipping-methods/shipping-eligibility-checker';
import { VasteShippingCalculator } from './shipping/shipping-methods/vaste-shipping-calculator';
import { PickupStore } from './shipping/shipping-methods/pickup-plugin';
import { manualFulfillmentHandler } from '@vendure/core';
import 'dotenv/config';
import path from 'path';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;
const URL = !IS_DEV ? process.env.PROD_URL : "http://localhost:5173"

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'better-sqlite3',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: path.join(__dirname, '../vendure.sqlite'),
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    shippingOptions: {
        shippingCalculators: [
            VasteShippingCalculator,
        ],
        shippingEligibilityCheckers: [
            PostalCodeChecker,
            PickupStore
        ],
        fulfillmentHandlers: [
          vasteFulfillmentHandler,
          manualFulfillmentHandler,
        ]
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        Seller: [
            { name: 'pickupAddress', type: 'string' },
            { name: 'pickupApartment', type: 'string' },
            { name: 'pickupPostalCode', type: 'string' },
            { name: 'pickupCity', type: 'string' },
            { name: 'Email', type: 'string' },
            { name: 'Phone', type: 'string' },
        ],
        Order: [
            { name: 'VasteCode', type: 'string' },
            { name: 'dateString', type: 'string'},
            { name: 'dateTime', type: 'datetime'},
            { name: 'ToimitusInfo', type:'string'},
        ],
        Fulfillment: [
            { name: 'vasteOrderId', type: 'string' }
        ],
    },
    plugins: [
        PaytrailPaymentsPlugin.init(),
        StripePlugin.init({
            storeCustomersInStripe: true,
        }),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : URL + '/assets/',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: URL + '/verify',
                passwordResetUrl: URL + '/password-reset',
                changeEmailAddressUrl: URL + '/verify-email-address-change'
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: serverPort + 2,
        }),
    ],
};
