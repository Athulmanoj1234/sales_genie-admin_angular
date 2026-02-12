import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { authReducer } from './features/store/auth.redcuer';
import { provideHttpClient } from '@angular/common/http';
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideStore({ auth: authReducer }),
    provideHttpClient(),
    provideStoreDevtools({
      maxAge: 25, // devtools will keep only last 25 snapshots like last 25 states, ie last 25 dispatched actions
      logOnly: !isDevMode(), //returns whether angular is in development mode if logOnly false then devtools can dispatch, time travel and read state, if logonly true devtools can only view logs
      autoPause: true, // When the Redux DevTools window is closed: NgRx stops recording actions, when we open it again: the recording gets resumes again
     //Why this exists:
     // large apps dispatch a LOT of actions
     // recording everything costs memory
     trace: false, //if true then traces from where the action is dispatche from 
     connectInZone: true, //need to leaen
    }),
]
};

