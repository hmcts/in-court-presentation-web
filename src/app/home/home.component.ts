import {Component, OnInit} from '@angular/core';
import {StompService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  baseUrl = '/demproxy/dm/documents';
  currentDocument: string;
  public page = 1;

  public subscribed: boolean;
  public following = true;
  private sessionId: string;
  private subscription: Subscription;
  private messages: Observable<Message>;
  private hearingDetails: any;
  private currentDocumentAndPage: any;
  private presenting: boolean;

  constructor(private stompService: StompService,
              private http: HttpClient,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscribed = false;
    this.route.queryParamMap.subscribe(params => {
      this.sessionId = params.get('id');
      this.loadHearingDetails().then(() => {
        this.subscribe();
      });
    });
  }

  public subscribe() {
    if (this.subscribed || !this.sessionId) {
      return;
    }

    // Stream of messages
    this.messages = this.stompService.subscribe(`/topic/screen-change/${this.sessionId}`);

    // Subscribe a function to be run on_next message
    this.subscription = this.messages.subscribe(this.onNext);

    this.subscribed = true;
  }

  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }

    // This will internally unsubscribe from Stomp Broker
    // There are two subscriptions - one created explicitly, the other created in the template by use of 'async'
    this.subscription.unsubscribe();
    this.subscription = null;
    this.messages = null;

    this.subscribed = false;
  }

  public isConnected() {
    return this.stompService.connected();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  public pageChange(page: number) {
    this.page = page;
    if (this.presenting) {
      this.stompService.publish(`/icp/screen-change/${this.sessionId}`,
        `{"page":  ${page}, "document": "${this.currentDocument}"}`);
    }
  }

  onNext = (message: Message) => {
    // Log it to the console
    console.log(message);
    const update = JSON.parse(message.body);
    this.currentDocumentAndPage = update;
    if (this.following && !this.presenting) {
      this.currentDocument = update.document;
      this.page = update.page;
    }
  }

  private loadHearingDetails() {
    return new Promise((resolve, reject) => {
      this.http.get<any>(`/icp/sessions/${this.sessionId}`).subscribe(resp => {
        this.hearingDetails = resp;
        this.currentDocument = this.hearingDetails.documents[0]
        resolve();
      }, reject);
    });
  }

  onDocumentChange(document: string) {
    this.currentDocument = document;
    this.page = 1;
    if (this.presenting){
      this.stompService.publish(`/icp/screen-change/${this.sessionId}`,
        `{"page":  ${this.page}, "document": "${document}"}`);
    }
  }

  setFollowing(following) {
    console.log(following);
    this.following = following;
    if(this.following && this.currentDocumentAndPage) {
      this.currentDocument = this.currentDocumentAndPage.document;
      this.page = this.currentDocumentAndPage.page;
    }
  }

  setPresenting(checked: boolean) {
    this.presenting = checked;
  }
}
