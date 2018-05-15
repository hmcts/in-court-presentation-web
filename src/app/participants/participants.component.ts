import {Component, Input, OnInit} from '@angular/core';
import {StompService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-participants',
  templateUrl: './participants.component.html',
  styleUrls: ['./participants.component.scss']
})
export class ParticipantsComponent implements OnInit {

  @Input()
  sessionId: string;

  @Input()
  name: string;

  @Input()
  stompService: StompService;

  private subscribed: boolean;
  private messages: Observable<Message>;
  private subscription: Subscription;
  private participants = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.subscribe();
    this.http.get<any[]>(`/icp/sessions/${this.sessionId}/participants`).subscribe(participants => {
      this.participants = participants;
    });
  }

  public subscribe() {
    if (this.subscribed || !this.sessionId) {
      return;
    }

    // Stream of messages
    this.messages = this.stompService.subscribe(`/topic/participants/${this.sessionId}`);

    // Subscribe a function to be run on_next message
    this.subscription = this.messages.subscribe(this.onNext);

    this.subscribed = true;

  }

  onNext = (message: Message) => {
    // Log it to the console
    console.log(message);
    this.participants = JSON.parse(message.body);
  }

}
