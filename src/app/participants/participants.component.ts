import {Component, Input, OnInit} from '@angular/core';
import {StompService} from '@stomp/ng2-stompjs';
import {Message} from '@stomp/stompjs';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import {ParticipantsService} from '../participants.service';

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

  private participants = [];

  constructor(private http: HttpClient,
              private participantsService: ParticipantsService) { }

  ngOnInit() {
    this.participantsService.connect(this.sessionId);
    this.subscribe();
    this.http.get<any[]>(`/icp/sessions/${this.sessionId}/participants`).subscribe(participants => {
      this.participants = participants.filter(this.filterParticipants());
    });
  }

  public subscribe() {
    this.participantsService.subscribeToParticipants().subscribe(this.onNext);
  }

  onNext = (participants: any[]) => {
    this.participants = participants.filter(this.filterParticipants());
  }

  private filterParticipants() {
    return p =>
      p.name !== 'Anon' && p.name !== this.name && p.status !== 'DISCONNECTED';
  }
}
