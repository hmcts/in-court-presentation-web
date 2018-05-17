import { Injectable } from '@angular/core';
import {StompServiceFactoryService} from './stomp-service-factory.service';
import {StompService} from '@stomp/ng2-stompjs';
import {Observable} from 'rxjs/Observable';
import {Message} from '@stomp/stompjs';
import {Subscription} from 'rxjs/Subscription';

@Injectable()
export class ParticipantsService {
  private stompService: StompService;
  private sessionId: string;
  private subscribed: boolean;
  private messages: Observable<Message>;
  private subscription: Subscription;

  constructor(private stompServiceFactory: StompServiceFactoryService) {
  }

  public connect(sessionId: string) {
    if (!this.stompService) {
      this.sessionId = sessionId;
      this.stompService = this.stompServiceFactory.get(sessionId);
    }
  }

  public subscribeToParticipants() {
    return new Observable(observer => {
      if (this.subscribed || !this.sessionId) {
        return;
      }

      // Stream of messages
      this.messages = this.stompService.subscribe(`/topic/participants/${this.sessionId}`);

      // Subscribe a function to be run on_next message
      this.subscription = this.messages.subscribe(message => {
        observer.next(JSON.parse(message.body));
      });

      this.subscribed = true;
    });
  }
}
