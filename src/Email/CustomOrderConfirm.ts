/* import { OrderStateTransitionEvent } from '@vendure/core'; */
import { EmailEventListener, transformOrderLineAssetUrls, hydrateShippingLines } from '@vendure/email-plugin';
import { UserOrderEvent } from '../events/userOrderEvent';

// The 'order-confirmation' string is used by the EmailPlugin to identify
// which template to use when rendering the email.
export const customOrderConfirmationHandler = new EmailEventListener('order-confirmation')
    .on(UserOrderEvent)
    .loadData(async ({ event, injector }) => {
        transformOrderLineAssetUrls(event.ctx, event.order, injector);
        const shippingLines = await hydrateShippingLines(event.ctx, event.order, injector);
        const dateString = event.order.customFields?.dateString
        return { shippingLines, dateString: dateString};
    })
    // Here we are setting the recipient of the email to be the
    // customer's email address.
    .setRecipient(event => event.order.customer!.emailAddress)
    // We can interpolate variables from the EmailPlugin's configured
    // `globalTemplateVars` object.
    .setFrom('{{ fromAddress }}')
    // We can also interpolate variables made available by the
    // `setTemplateVars()` method below
    .setSubject('Order confirmation for #{{ order.code }}')
    // The object returned here defines the variables which are
    // available to the email template.
    .setTemplateVars(event =>  ({ order: event.order, shippingLines: event.data.shippingLines, dateString: event.data.dateString }))
