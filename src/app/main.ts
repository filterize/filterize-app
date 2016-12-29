import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { enableProdMode } from '@angular/core';
import { AppModule } from './app.module';

import { CONFIG } from './config';

if (CONFIG.production) {
    // enableProdMode();
    console.log("production");
} else {
    console.log("dev");
}

platformBrowserDynamic().bootstrapModule(AppModule);
