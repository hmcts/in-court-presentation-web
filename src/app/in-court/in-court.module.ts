import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home/home.component';
import {ParticipantsService} from './participants.service';
import {ParticipantsComponent} from './participants/participants.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {UpdateService} from './update.service';
import {StompServiceFactoryService} from './stomp-service-factory.service';
import {HearingDataService} from './hearing-data.service';
import {DmDocDataService} from './dm-doc-data.service';
import {EmViewerModule} from 'em-viewer-web';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    EmViewerModule
  ],
  declarations: [HomeComponent, ParticipantsComponent, SidebarComponent],
  providers: [UpdateService, ParticipantsService, StompServiceFactoryService, HearingDataService, DmDocDataService]
})
export class InCourtModule { }
