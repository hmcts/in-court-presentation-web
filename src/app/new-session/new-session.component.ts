import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {DmDocDataService} from '../in-court/dm-doc-data.service';

@Component({
  selector: 'app-new-session',
  templateUrl: './new-session.component.html',
  styleUrls: ['./new-session.component.scss']
})

export class NewSessionComponent implements OnInit {

  participants: string[] = [];
  private sessionId: string;
  private documents = [];

  constructor(private http: HttpClient,
              private docDataService: DmDocDataService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      // const documentUrls = params.getAll('documents');
      // this.docDataService.getDataFromUrls(documentUrls).subscribe((docs) => {
      //   this.documents = docs;
      // });

      // hardcoded currently.
      const documentUrls = ['/documents/39875d67-4f2a-409d-9193-68d1f50a37a4'];
      this.documents = this.docDataService.formatDocumentUrls(documentUrls);
    });
  }

  addParticipant(participant: string) {
    this.participants.push(participant);
  }

  createSession() {
    this.http.post<any>('/icp/sessions', {
      description: '',
      dateOfHearing: new Date(),
      documents: this.documents.filter(doc => doc.checked).map(doc => doc.url),
      participants: this.participants
    }, {
      observe: 'response'
    }).subscribe(resp => {
      console.log(resp);
      this.sessionId = resp.body.id;
    });
  }

  buildMailLink() {
    return `mailto:?bcc=${this.participants.join(',')}&subject=New%20Hearing&body=${document.location.origin}?id=${this.sessionId}`;
  }
}
