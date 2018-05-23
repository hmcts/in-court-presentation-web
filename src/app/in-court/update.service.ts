import {HostListener, Injectable} from '@angular/core';
import {StompService} from '@stomp/ng2-stompjs';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Message} from '@stomp/stompjs';
import {StompServiceFactoryService} from './stomp-service-factory.service';

@Injectable()
export class UpdateService {

  private stompService: StompService;

  public subscribed: boolean;
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

  public broadcastDocumentChange(page: number, document: string) {
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
