import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.scss']
})
export class NewSessionComponent implements OnInit {

  participants: string[] = [];
  private sessionId: string;
  private documents: string[];

  constructor(private http: HttpClient,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.documents = params.getAll("documents");
    })
  }

  addParticipant(participant: string) {
    this.participants.push(participant);
  }

  createSession() {
    this.http.post<any>("/icp/sessions", {
      description: "",
      dateOfHearing: new Date(),
      documents: this.documents,
      participants: this.participants
    }, {
      observe: 'response'
    }).subscribe(resp => {
      console.log(resp);
      this.sessionId = resp.body.id;
    });
  }

  buildMailLink() {
    return `mailto:?bcc=${this.participants.join(',')}&subject=New%20Hearing&body=${document.location.origin}?id=${this.sessionId}`
  }
}
