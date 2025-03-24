//not in use anywhere
import { EntityHydrator } from '@vendure/core';
import { EmailEventListener, transformOrderLineAssetUrls, hydrateShippingLines } from '@vendure/email-plugin';
import { AdminNotifEvent } from '../events/admin-notifEvent';

export const customAdminOrderConfirmationHandler = new EmailEventListener('admin-notif')
.on(AdminNotifEvent)
   .loadData(async ({ event, injector }) => {
        transformOrderLineAssetUrls(event.ctx, event.order, injector);
        const shippingLines = await hydrateShippingLines(event.ctx, event.order, injector);
        const entityHydrator = injector.get(EntityHydrator);
        await entityHydrator.hydrate(event.ctx,event.order,{relations: ['channels.seller']})
        const email = event.order.channels[0].seller?.customFields.Email
        console.log("Admin email ", email)
        const dateString = event.order.customFields?.dateString
        return { shippingLines,
                 dateString: dateString,
                 email
        };
    })
    // customer's email address.
    .setRecipient(event => `${event.data.email}`)
    // `globalTemplateVars` object.
    .setFrom('{{ fromAddress }}')
    // `setTemplateVars()` method below
    .setSubject('Order confirmation for #{{ order.code }}')
    // available to the email template.
    .setTemplateVars(event =>  ({ order: event.order, shippingLines: event.data.shippingLines, dateString: event.data.dateString }))

