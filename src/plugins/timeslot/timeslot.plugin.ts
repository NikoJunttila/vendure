import * as path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';
import { TIMESLOT_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { TimeslotEntity } from './entities/timeslot.entity';
import { TimeslotEntityService } from './services/timeslot-entity.service';
import { TimeslotEntityAdminResolver } from './api/timeslot-entity-admin.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: TIMESLOT_PLUGIN_OPTIONS, useFactory: () => TimeslotPlugin.options }, TimeslotEntityService],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
    entities: [TimeslotEntity],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [TimeslotEntityAdminResolver]
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
    }
})

export class TimeslotPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<TimeslotPlugin> {
        this.options = options;
        return TimeslotPlugin;
    }

    static ui: AdminUiExtension = {
        id: 'timeslot-ui',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'timeslot', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
