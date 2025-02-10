import { emailVerificationHandler,
    passwordResetHandler,
    emailAddressChangeHandler, } from '@vendure/email-plugin';  
import { LanguageCode } from "@vendure/core";
import { customOrderConfirmationHandler } from './CustomOrderConfirm';
import { customKauppiasOrderConfirmationHandler } from './CustomEmailToKauppias';
import { customAdminOrderConfirmationHandler } from './CustomAdminConfirmation';
const myCustomOrderToKauppias = customKauppiasOrderConfirmationHandler
.addTemplate({
  channelCode: 'default',
  languageCode: LanguageCode.fi,
  templateFile: 'body.fi.hbs',
  subject: 'Uusi tilaus #{{ order.code }}',
})
const myCustomOrderToAdmin = customAdminOrderConfirmationHandler
.addTemplate({
  channelCode: 'default',
  languageCode: LanguageCode.fi,
  templateFile: 'body.fi.hbs',
  subject: 'Uusi tilaus #{{ order.code }}',
})
const myCustomOrderConfirmationHandler = customOrderConfirmationHandler
.addTemplate({
  channelCode: 'default',
  languageCode: LanguageCode.fi,
  templateFile: 'body.fi.hbs',
  subject: 'Tilausvahvistus tilaukselle #{{ order.code }}',
})
const myEmailverificationHandler = emailVerificationHandler.addTemplate({
    channelCode: 'default',
    languageCode: LanguageCode.fi,
    templateFile: 'body.fi.hbs',
    subject: 'Vahvista sähköpostiosoitteesi',
  })
const myPasswordResetHandler = passwordResetHandler.addTemplate({
    channelCode: 'default',
    languageCode: LanguageCode.fi,
    templateFile: 'body.fi.hbs',
    subject: 'Unohtuneen salasanan palautus',
  })
const myEmailAddressChangeHandler = emailAddressChangeHandler.addTemplate({
    channelCode: 'default',
    languageCode: LanguageCode.fi,
    templateFile: 'body.fi.hbs',
    subject: 'Vahvista uusi sähköpostiosoitteesi',
  })
export const EmailHandlers = [myCustomOrderConfirmationHandler,myCustomOrderToKauppias,myEmailverificationHandler,myPasswordResetHandler,myEmailAddressChangeHandler,myCustomOrderToAdmin]

