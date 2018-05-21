import {HostListener, Injectable} from '@angular/core';
import {StompConfig, StompService} from '@stomp/ng2-stompjs';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Message} from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import {StompServiceFactoryService} from './stomp-service-factory.service';

const stompConfig: StompConfig = {
  // Which server?
  // url: 'ws://127.0.0.1:15674/ws',
  url: () => {
    return new SockJS('/icp/ws') as WebSocket;
  },

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

@Injectable()
export class UpdateService {

  private stompService: StompService;

  private subscribed: boolean;
  private subscription: Subscription;
  private messages: Observable<Message>;
  private sessionId: string;

  constructor(private stompServiceFactory: StompServiceFactoryService) {

  }

  public connect(sessionId: string) {
    if (!this.stompService) {
      this.sessionId = sessionId;
      this.stompService = this.stompServiceFactory.get(sessionId);
    }
  }

  public subscribeToUpdates(): Observable<any> {
    return new Observable<any>(observer => {
      if (this.subscribed || !this.sessionId) {
        return;
      }

      this.messages = this.stompService.subscribe(`/topic/screen-change/${this.sessionId}`);
      this.subscription = this.messages.subscribe(message => {
        observer.next(JSON.parse(message.body));
      });
      this.subscribed = true;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.subscription.unsubscribe();
    this.subscription = null;
    this.messages = null;
    this.subscribed = false;
  }

  public updateDocument(page: number, document: string) {
    this.stompService.publish(`/icp/screen-change/${this.sessionId}`,
      `{"page":  ${page}, "document": "${document}"}`);
  }

  addName(name: string) {
    this.stompService.publish(`/icp/participants/${this.sessionId}`,
      `{"name": "${name}", "status": "CONNECTED", "sessionId": "${this.sessionId}"}`);
  }

  public isConnected() {
    return this.stompService.connected();
  }

}
