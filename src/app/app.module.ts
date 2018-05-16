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
import { NewSessionComponent } from './new-session/new-session.component';
import {DmDocDataService} from './dm-doc-data.service';
import { ParticipantsComponent } from './participants/participants.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import {HearingDataService} from './hearing-data.service';
import {UpdateService} from './update.service';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'new', component: NewSessionComponent }
];



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NewSessionComponent,
    ParticipantsComponent,
    SidebarComponent
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
    DmDocDataService,
    HearingDataService,
    UpdateService
    ],
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
