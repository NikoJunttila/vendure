import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

runMigrations(config)
    .then(() => bootstrap(config))
    .then((app) => { // might fix the error with x-forwarded trust
        (app as any).set("trust proxy", 1)
    })
    .catch(err => {
        console.error(err);
    });
