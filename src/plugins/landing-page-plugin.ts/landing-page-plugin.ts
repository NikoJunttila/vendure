import { VendurePlugin } from '@vendure/core';
import { RequestHandler } from 'express';

/**
 * This plugin just serves the index.html file at the root.
 */
@VendurePlugin({
    configuration: config => {
        const handler: RequestHandler = (req, res, next) => {
            if (req.url.indexOf('/health') !== 0 &&
                req.url.indexOf('/admin-api') !== 0 &&
                req.url.indexOf('/shop-api') !== 0 &&
                req.url.indexOf('/admin') !== 0 &&
                req.url.indexOf('/graphiql') !== 0 &&
                req.url.indexOf('/mailbox') !== 0 &&
                req.url.indexOf('/assets') !== 0 &&
                req.url.indexOf('/stripe') !== 0 &&
                req.url.indexOf('/payments') !== 0 &&
                req.url.indexOf('/popularity-scores') !== 0 &&
                req.url.indexOf('/storefront') !== 0) {
                // redirecting to Admin UI by default
                return res.redirect('/admin')
            } else {
                next();
            }
        };
        config.apiOptions.middleware.push({
            handler,
            route: '/',
        });
        return config;
    }
})
export class LandingPagePlugin {}