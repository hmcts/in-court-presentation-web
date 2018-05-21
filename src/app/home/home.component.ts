import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import {ActivatedRoute} from '@angular/router';
import * as SockJS from 'sockjs-client';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {HearingDataService} from '../hearing-data.service';
import {UpdateService} from '../update.service';

const stompConfig: StompConfig = {
  // Which server?
  // url: 'ws://127.0.0.1:15674/ws',
  url: () => new SockJS('/icp/ws') as WebSocket,

  // Headers
  // Typical keys: login, passcode, host
  headers: {
    login: 'guest',
    passcode: 'guest',
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

const baseUrl = '/demproxy/dm/documents';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private currentDocument: string;
  private page = 1;
  private documents = [];
  private sessionId: string;

  private currentDocumentAndPage: any;
  private stompService: StompService;

  private subscribed: boolean;

  @ViewChild(SidebarComponent)
  public sidebar: SidebarComponent;

  constructor(private hearingDataService: HearingDataService,
              private updateService: UpdateService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscribed = false;
    this.route.queryParamMap.subscribe(params => {
      this.sessionId = params.get('id');
      stompConfig.headers.sessionId = this.sessionId;
      this.stompService = new StompService(stompConfig);
      this.updateService.connect(this.sessionId);
      this.loadHearingDetails();
    });
  }

  public subscribe() {
    this.updateService.subscribeToUpdates().subscribe(this.onNext);
  }

  @HostListener('window:beforeunload', ['$event'])
  public unsubscribe() {
    this.updateService.unsubscribe();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  public pageChange(page: number) {
    this.page = page;
    if (this.sidebar.presenting) {
      this.updateService.updateDocument(page, this.currentDocument);
    }
  }

  onNext = (update: any) => {
    this.currentDocumentAndPage = update;
    if (this.sidebar.following && !this.sidebar.presenting) {
      this.currentDocument = update.document;
      this.page = update.page;
    }
  }

  private loadHearingDetails() {
    this.hearingDataService.loadHearingDetails(this.sessionId).subscribe(docs => {
      this.documents = docs;
      this.currentDocument = docs[0].url;
    });
  }

  onDocumentChange(document: string) {
    this.currentDocument = document;
    this.page = 1;
  }

  setFollowing(following) {
    if (this.sidebar.following && this.currentDocumentAndPage) {
      this.currentDocument = this.currentDocumentAndPage.document;
      this.page = this.currentDocumentAndPage.page;
    }
    if (this.sidebar.following) {
      this.subscribe();
    } else {
      this.unsubscribe();
    }
  }
}
