import {BrowserModule, BrowserTransferStateModule} from '@angular/platform-browser';
import {APP_ID, Inject, NgModule, PLATFORM_ID} from '@angular/core';

import {HttpClientModule} from '@angular/common/http';
import {RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {AppComponent} from './app.component';
import {isPlatformBrowser} from '@angular/common';
import {AppRoutingModule} from './/app-routing.module';
import {HomeComponent} from './in-court/home/home.component';
import {NewSessionComponent} from './new-session/new-session.component';
import {InCourtModule} from './in-court/in-court.module';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'new', component: NewSessionComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    NewSessionComponent,
  ],
  imports: [
      BrowserModule.withServerTransition({ appId: 'jui' }),
      BrowserTransferStateModule,
      AppRoutingModule,
      RouterModule.forRoot(routes),
      HttpClientModule,
      InCourtModule,
      FormsModule
  ],
  providers: [],
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
