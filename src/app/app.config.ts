import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    // provideHttpClient(withInterceptorsFromDi())
    //, { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          // Set darkModeSelector to false to disable dark mode
          darkModeSelector: false
        }
      },

    })
  ]
};
