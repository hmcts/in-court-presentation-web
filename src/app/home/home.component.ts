import {Component, OnInit} from '@angular/core';
import {StompService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  baseUrl = '/demproxy/dm/documents';
  docId = 'be9f1344-d795-49a4-9946-cbf0acd74f9f';
  url = `${this.baseUrl}/${this.docId}`;
  public page = 1;

  public subscribed: boolean;
  private subscription: Subscription;
  private messages: Observable<Message>;

  constructor(private stompService: StompService) {
  }

  onEnter(value: string) {
    this.docId = value;
    this.url = `${this.baseUrl}/${this.docId}`;
  }

  ngOnInit() {
    this.subscribed = false;

    // Store local reference to Observable
    // for use with template ( | async )
    this.subscribe();
  }

  public subscribe() {
    if (this.subscribed) {
      return;
    }

    // Stream of messages
    this.messages = this.stompService.subscribe('/topic/screen-change/123');

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

  ngOnDestroy() {
    this.unsubscribe();
  }

  public pageChange(page: number) {
    this.page = page;
    this.stompService.publish('/icp/screen-change/123',
      `{"page":  ${page}}`);
  }

  onNext = (message: Message) => {
    // Log it to the console
    console.log(message);
    const update = JSON.parse(message.body);
    this.page = update.page;
  }
}
