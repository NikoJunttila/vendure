import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import path from 'path';
import { FeedbackPlugin } from './plugins/feedback-plugin/feedback.plugin';
import { PdfPrinterPlugin } from './plugins/pdf-printer-plugin/pdf-printer.plugin';

if (require.main === module) {
    // Called directly from command line
    customAdminUi({ recompile: true, devMode: false })
        .compile?.()
        .then(() => {
            process.exit(0);
        });
}

export function customAdminUi(options: { recompile: boolean; devMode: boolean }) {
    const compiledAppPath = path.join(__dirname, '../admin-ui');
    if (options.recompile) {
        return compileUiExtensions({
            outputPath: compiledAppPath,
            extensions: [
                //PdfPrinterPlugin.ui,
                //FeedbackPlugin.ui,
                {
                    translations:{
                        fi: path.join(__dirname, 'translations/fi.json'),
                    }
                }
            ],
            devMode: options.devMode,
        });
    } else {
        return {
            path: path.join(compiledAppPath, 'dist'),
        };
    }
}