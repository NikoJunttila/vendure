import * as path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { PDF_PRINTER_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: PDF_PRINTER_PLUGIN_OPTIONS, useFactory: () => PdfPrinterPlugin.options }],
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
})
export class PdfPrinterPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<PdfPrinterPlugin> {
        this.options = options;
        return PdfPrinterPlugin;
    }

    static ui: AdminUiExtension = {
        id: 'pdf-printer-ui',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'pdf-printer', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
