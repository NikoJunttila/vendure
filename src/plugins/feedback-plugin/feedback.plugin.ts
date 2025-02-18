import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { FeedbackEntity } from './entities/feedback.entity';
import { FeedbackService } from './service/feedback.service';
import { FeedbackAdminResolver, FeedbackShopResolver } from './api/feedback.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import * as path from 'path';

@VendurePlugin({
  compatibility: '^3.0.0',
  imports: [PluginCommonModule],
  entities: [FeedbackEntity],
  providers: [FeedbackService],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [FeedbackAdminResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [FeedbackShopResolver],
  },
})
export class FeedbackPlugin {
  static init() {
    return FeedbackPlugin;
  }
    static ui: AdminUiExtension = {
        id: 'feedback-ui',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'feedback', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
