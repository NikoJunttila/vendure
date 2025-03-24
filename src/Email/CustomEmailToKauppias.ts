import { OrderStateTransitionEvent, EntityHydrator } from '@vendure/core';
import { EmailEventListener, transformOrderLineAssetUrls, hydrateShippingLines } from '@vendure/email-plugin';


// The 'order-confirmation' string is used by the EmailPlugin to identify
// which template to use when rendering the email.
export const customKauppiasOrderConfirmationHandler = new EmailEventListener('order-confirmation')
.on(OrderStateTransitionEvent)
// Only send the email when the Order is transitioning to the
// "PaymentAuthorized" state and the Order has a customer associated with it.
.filter(
    event =>
        event.toState === 'PaymentSettled'
    && !!event.order.customer,
)
    // We commonly need to load some additional data to be able to render the email
    // template. This is done via the `loadData()` method. In this method we are
    // mutating the Order object to ensure that product images are correctly
    // displayed in the email, as well as fetching shipping line data from the database.
    .loadData(async ({ event, injector }) => {
        transformOrderLineAssetUrls(event.ctx, event.order, injector);
        const shippingLines = await hydrateShippingLines(event.ctx, event.order, injector);
        const entityHydrator = injector.get(EntityHydrator);
        await entityHydrator.hydrate(event.ctx,event.order,{relations: ['channels.seller']})
        let email = event.order.channels[0].seller?.customFields.Email
        if (event.order.channels.length > 1){
            email = event.order.channels[1].seller?.customFields.Email
        }
        const dateString = event.order.customFields?.dateString
        return { shippingLines,
                 dateString: dateString,
                 email
        };
    })
    .setRecipient(event => `${event.data.email}`)
    .setFrom('{{ fromAddress }}')
    .setSubject('Order confirmation for #{{ order.code }}')
    .setTemplateVars(event =>  ({ order: event.order, shippingLines: event.data.shippingLines, dateString: event.data.dateString }))
