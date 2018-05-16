import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {DmDocDataService} from '../dm-doc-data.service';
import * as SockJS from "sockjs-client";
import {SidebarComponent} from '../sidebar/sidebar.component';
import {HearingDataService} from '../hearing-data.service';

const stompConfig: StompConfig = {
  // Which server?
  // url: 'ws://127.0.0.1:15674/ws',
  url: () => {return new SockJS('/icp/ws') as WebSocket;},

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
export class HomeComponent implements OnInit {

  private currentDocument: string;
  private page = 1;
  private documents = [];
  private sessionId: string;

  private currentDocumentAndPage: any;
  private stompService: StompService;

  private subscribed: boolean;
  private subscription: Subscription;
  private messages: Observable<Message>;

  @ViewChild(SidebarComponent)
  public sidebar: SidebarComponent;

  constructor(private hearingDataService: HearingDataService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscribed = false;
    this.route.queryParamMap.subscribe(params => {
      this.sessionId = params.get('id');
      stompConfig.headers.sessionId = this.sessionId;
      this.stompService = new StompService(stompConfig);
      this.loadHearingDetails();
    });
  }

  public subscribe() {
    if (this.subscribed || !this.sessionId) {
      return;
    }
    this.messages = this.stompService.subscribe(`/topic/screen-change/${this.sessionId}`);
    this.subscription = this.messages.subscribe(this.onNext);
    this.subscribed = true;
  }

  @HostListener('window:beforeunload', [ '$event' ])
  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.subscription.unsubscribe();
    this.subscription = null;
    this.messages = null;
    this.subscribed = false;
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  public pageChange(page: number) {
    this.page = page;
    if (this.sidebar.presenting) {
      this.stompService.publish(`/icp/screen-change/${this.sessionId}`,
        `{"page":  ${page}, "document": "${this.currentDocument}"}`);
    }
  }

  onNext = (message: Message) => {
    // Log it to the console
    console.log(message);
    const update = JSON.parse(message.body);
    this.currentDocumentAndPage = update;
    if (this.sidebar.following && !this.sidebar.presenting) {
      this.currentDocument = update.document;
      this.page = update.page;
    }
  };

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
    if(this.sidebar.following && this.currentDocumentAndPage) {
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
