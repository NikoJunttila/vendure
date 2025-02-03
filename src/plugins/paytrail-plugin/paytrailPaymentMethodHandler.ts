import {
    PaymentMethodHandler,
    CreatePaymentResult,
    RequestContext,
    Order,
    PaymentMetadata,
    Logger,
    SettlePaymentResult,
    Payment,
    Injector,
    EntityHydrator,
    CreateRefundResult,
    PaymentMethod,
    OrderService,
    SettlePaymentError
} from '@vendure/core';
import { LanguageCode, RefundOrderInput } from '@vendure/common/lib/generated-types';
import { loggerCtx } from './constants';
import { PaytrailClient, CreateRefundRequest, CreateRefundParams, CallbackUrl } from "@paytrail/paytrail-js-sdk";
import { VasteAPI } from '../vaste-plugin/vaste-data-source';
import { parseDeliveryDateTime } from '../vaste-plugin/helpers';
import { VasteOrder } from '../../types/vaste-types';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

enum OrderState {
    Authorized = "Authorized",
    Settled = "Settled"
}
let vaste: VasteAPI;
let fulfillmentCache: KeyValueCache;
let entityHydrator: EntityHydrator;
let orderService: OrderService;
/**
 * The handler for paytrail payments.
 */
export const paytrailPaymentMethodHandler = new PaymentMethodHandler({
    code: 'paytrail-payments-provider',
    description: [
        { languageCode: LanguageCode.en, value: 'Paytrail Payments Provider' },
        { languageCode: LanguageCode.fi, value: 'Paytrail maksupalvelu' },
    ],
    args: {
        secretKey: {
            type: 'string',
            label: [
                { languageCode: LanguageCode.en, value: 'Secret Key' },
                { languageCode: LanguageCode.fi, value: 'Salainen avain' }
            ],
        },
        merchantId: {
            type: 'string',
            label: [
                { languageCode: LanguageCode.en, value: 'Merchant ID' },
                { languageCode: LanguageCode.fi, value: 'Kauppias ID' }
            ],
        },
    },

    init: (injector: Injector) => {
        entityHydrator = injector.get(EntityHydrator);
        orderService = injector.get(OrderService);
        fulfillmentCache = new Map() as unknown as KeyValueCache;

    },

    createPayment: async (ctx: RequestContext, order: Order, amount: number, args: Record<string, any>, metadata: PaymentMetadata): Promise<CreatePaymentResult> => {
        await entityHydrator.hydrate(ctx, order, { relations: ['shippingLines.shippingMethod', 'customer'] });
        Logger.debug('createPayment() invoked', loggerCtx);
        const hmacCode = metadata.hmacCode
        const transactionId = metadata.transActionCode
        // here update the order customField PaytrailID to be transactionID
        try {
            const res = await orderService.updateCustomFields(ctx, order.id, {
                PaytrailId: transactionId
            })
            console.log(res)
        } catch (err) {
            console.error(err)
        }
        if (hmacCode) {
            return {
                amount: order.totalWithTax,
                state: OrderState.Authorized,
                metadata: {},
            }
        }
        console.error("paytrail no hmac validation")
        return {
            amount: order.totalWithTax,
            state: "Declined",
            metadata: {
                errorMessage: "error validating hmac"
            }
        };
    },
settlePayment: async (ctx, order, payment, args): Promise<SettlePaymentResult> => {
    try {
        await entityHydrator.hydrate(ctx, order, { relations: ['shippingLines.shippingMethod', 'customer'] });
        const vasteCheck = order.shippingLines[0]?.shippingMethod?.code;

        if (vasteCheck === "vaste") {
            const options = {
                apikey: "",
                cache: fulfillmentCache
            };
            vaste = new VasteAPI(options);
            const dateStart = new Date();

            // Parse delivery date time
            //@ts-ignore
            const result = parseDeliveryDateTime(order.customFields.dateTime);

            const vasteOrder: VasteOrder = {
                senderLastname: "Elina",
                senderFirstname: "Miettunen",
                senderEmail: "elina.miettunen@m-ketju.fi",
                senderPhone: "044 901 1358",
                pickupAddress: "Nelostie 2391",
                pickupApartment: "",
                pickupPostal: "95340",
                pickupCity: "Loue",
                pickupDateStart: `${dateStart.getFullYear()}-${(1 + dateStart.getMonth()).toString().padStart(2, "0")}-${dateStart.getDate().toString().padStart(2, "0")}`,
                pickupDateStop: `${dateStart.getFullYear()}-${(1 + dateStart.getMonth()).toString().padStart(2, "0")}-${dateStart.getDate().toString().padStart(2, "0")}`,
                pickupTimeStart: `${dateStart.getHours().toString().padStart(2, "0")}:${dateStart.getMinutes().toString().padStart(2, "0")}`,
                pickupTimeStop: `${dateStart.getHours().toString().padStart(2, "0")}:${dateStart.getMinutes().toString().padStart(2, "0")}`,
                receiverLastname: order?.customer?.lastName || "",
                receiverFirstname: order?.customer?.firstName || "",
                receiverPhone: order?.shippingAddress?.phoneNumber || "",
                receiverEmail: order.customer?.emailAddress || "",
                deliveryAddress: order?.shippingAddress?.streetLine1 || "",
                deliveryApartment: order?.shippingAddress?.streetLine2 || "",
                deliveryPostal: order?.shippingAddress?.postalCode || "",
                deliveryCity: order?.shippingAddress?.city || "",
                deliveryDateStart: result.deliveryDateStart,
                deliveryDateStop: result.deliveryDateStop,
                deliveryTimeStart: result.deliveryTimeStart,
                deliveryTimeStop: result.deliveryTimeStop,
                deliveryCount: 1,
                deliveryLength: 10,
                deliveryWidth: 10,
                deliveryHeight: 10,
                deliveryWeight: 10,
                destination: "address",
                //@ts-ignore
                orderInfoText: order.customFields.ToimitusInfo || "",
                packageDescriptionText: "",
                personCount: 0
            };
            try {
                const transaction = await vaste.createOrder(
                    vasteOrder.receiverFirstname,
                    vasteOrder.receiverLastname,
                    vasteOrder.deliveryAddress,
                    vasteOrder.deliveryApartment,
                    vasteOrder.deliveryPostal,
                    vasteOrder.deliveryCity,
                    vasteOrder.receiverEmail,
                    vasteOrder.receiverPhone,
                    vasteOrder.senderFirstname,
                    vasteOrder.senderLastname,
                    vasteOrder.pickupAddress,
                    vasteOrder.pickupApartment,
                    vasteOrder.pickupPostal,
                    vasteOrder.pickupCity,
                    vasteOrder.senderEmail,
                    vasteOrder.senderPhone,
                    vasteOrder.pickupDateStart,
                    vasteOrder.pickupDateStop,
                    vasteOrder.pickupTimeStart,
                    vasteOrder.pickupTimeStop,
                    vasteOrder.deliveryDateStart,
                    vasteOrder.deliveryDateStop,
                    vasteOrder.deliveryTimeStart,
                    vasteOrder.deliveryTimeStop,
                    vasteOrder.orderInfoText,
                    vasteOrder.packageDescriptionText,
                    vasteOrder.personCount.toString(),
                    vasteOrder.deliveryHeight,
                    vasteOrder.deliveryWidth,
                    vasteOrder.deliveryLength,
                    vasteOrder.deliveryWeight,
                    vasteOrder.deliveryCount,
                    vasteOrder.destination
                );
                if (!transaction) {
                    throw new SettlePaymentError({
                        paymentErrorMessage: 'Failed to create Vaste order: No transaction returned'
                    });
                }

                if (transaction.status === "error") {
                    console.error(`Vaste order creation failed: ${JSON.stringify(transaction)}`);
                    throw new SettlePaymentError({
                        paymentErrorMessage: `Failed to create Vaste order`
                    });
                }
                    await orderService.updateCustomFields(ctx, order.id, {
                        VasteCode: transaction.vasteOrder
                    });

            } catch (vasteError : any) {
                console.error(`Vaste API error: ${vasteError.message}`);
                throw new SettlePaymentError({
                    paymentErrorMessage: `Vaste service error: ${vasteError.message}`
                });
            }
        }
        return { success: true };

    } catch (error) {
        // If it's already a SettlePaymentError, rethrow it
        if (error instanceof SettlePaymentError) {
            throw error;
        }
        // Otherwise wrap it in a SettlePaymentError
        throw new SettlePaymentError({
            paymentErrorMessage: `Payment settlement failed`
        });
    }
},
    createRefund: async (ctx: RequestContext, input: RefundOrderInput, amount: number, order: Order, payment: Payment, args: Record<string, any>, method: PaymentMethod): Promise<CreateRefundResult> => {
        await entityHydrator.hydrate(ctx, order, { relations: ['customer'] });
        const client = new PaytrailClient({
            //@ts-ignore
            merchantId: process.env.PAYTRAIL_MERCHANTID,
            secretKey: process.env.PAYTRAIL_SECRETKEY,
            platformName: 'Jatulintarhashop'
        });

        //@ts-ignore
        const params: CreateRefundParams = { transactionId: order.customFields.PaytrailID }
        // ei tee mitään periaatteessa tällä hetkellä
        const callBacks: CallbackUrl = {
            success: "https://jatulintarhashop.fi/refund/success",
            cancel: "https://jatulintarhashop.fi/refund/cancel"
        }
        const request: CreateRefundRequest = {
            amount: input.amount,
            email: order.customer?.emailAddress || process.env.KAUPPIAS_SPOSTI,
            refundStamp: order.code + "1", //uuid here?
            refundReference: order.code,
            callbackUrls: callBacks
        }
        const res = await client.createRefund(params, request)
        console.log(res)
        if (res.status == 200) {
            return {
                state: "Settled",
                /*    transactionId: "4242424242", */ //voi olla mikä tahansa string 
            };
        } else {
            return {
                state: "Failed"
            }
        }

    },
});
