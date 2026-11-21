import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

(window as unknown as { DATA_READY: Promise<boolean> }).DATA_READY = Promise.resolve(true);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
