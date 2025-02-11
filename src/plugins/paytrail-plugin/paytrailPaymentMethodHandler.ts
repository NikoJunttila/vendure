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
    EventBus
} from '@vendure/core';
import { LanguageCode, RefundOrderInput } from '@vendure/common/lib/generated-types';
import { loggerCtx } from './constants';
import { PaytrailClient, CreateRefundRequest, CreateRefundParams, CallbackUrl } from "@paytrail/paytrail-js-sdk";
import { AdminNotifEvent } from '../../events/admin-notifEvent';
import { UserOrderEvent } from '../../events/userOrderEvent';

enum OrderState {
    Authorized = "Authorized",
    Settled = "Settled"
}

let entityHydrator: EntityHydrator;
let orderService: OrderService;
let eventBus : EventBus
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
        eventBus = injector.get(EventBus)
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
        } catch (err) {
            console.error(err)
        }
        if (hmacCode) {
            //customer email here
            eventBus.publish(new UserOrderEvent(ctx, order))
            return {
                amount: order.totalWithTax,
                state: OrderState.Settled,
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
settlePayment: (ctx, order, payment, args): SettlePaymentResult => {

    Logger.debug('settlePayment() invoked', loggerCtx);
    return { success: true };
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
        if (res.status == 200) {
            return {
                state: "Settled",
                transactionId: "4242424242", //voi olla mikä tahansa string 
            };
        } else {
            return {
                state: "Failed"
            }
        }

    },
});
