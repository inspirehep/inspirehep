export * from './app.component';
export * from './app.routes';

import { AppService } from './app.service';

export const APP_PROVIDERS = [
    AppService
];
