import { BrowserModule, BrowserTransferStateModule  } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AppRoutingModule } from './/app-routing.module';
import { HomeComponent } from './home/home.component';
import { EmViewerModule } from 'em-viewer-web';
import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import * as SockJS from "sockjs-client";

const routes: Routes = [
    { path: '', component: HomeComponent }
];

const stompConfig: StompConfig = {
  // Which server?
  // url: 'ws://127.0.0.1:15674/ws',
  url: () => {return new SockJS('/icp/ws') as WebSocket;},

  // Headers
  // Typical keys: login, passcode, host
  headers: {
    login: 'guest',
    passcode: 'guest'
  },

  // How often to heartbeat?
  // Interval in milliseconds, set to 0 to disable
  heartbeat_in: 0, // Typical value 0 - disabled
  heartbeat_out: 20000, // Typical value 20000 - every 20 seconds
  // Wait in milliseconds before attempting auto reconnect
  // Set to 0 to disable
  // Typical value 5000 (5 seconds)
  reconnect_delay: 5000,

  // Will log diagnostics on console
  debug: true
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
      BrowserModule.withServerTransition({ appId: 'jui' }),
      BrowserTransferStateModule,
      AppRoutingModule,
      RouterModule.forRoot(routes),
      HttpClientModule,
      EmViewerModule
  ],
  providers: [
    StompService,
    {
      provide: StompConfig,
      useValue: stompConfig
    }],
  bootstrap: [AppComponent]
})
export class AppModule {
    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(APP_ID) private appId: string) {
        const platform = isPlatformBrowser(platformId) ?
            'in the browser' : 'on the server';
        console.log(`Running ${platform} with appId=${appId}`);
    }
}
