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
        const email = event.order.channels[0].seller?.customFields.Email
        const dateString = event.order.customFields?.dateString
        return { shippingLines,
                 dateString: dateString,
                 email
        };
    })
    // Here we are setting the recipient of the email to be the
    // customer's email address.
    .setRecipient(event => `${event.data.email}`)
    // We can interpolate variables from the EmailPlugin's configured
    // `globalTemplateVars` object.
    .setFrom('{{ fromAddress }}')
    // We can also interpolate variables made available by the
    // `setTemplateVars()` method below
    .setSubject('Order confirmation for #{{ order.code }}')
    // The object returned here defines the variables which are
    // available to the email template.
    .setTemplateVars(event =>  ({ order: event.order, shippingLines: event.data.shippingLines, dateString: event.data.dateString }))
