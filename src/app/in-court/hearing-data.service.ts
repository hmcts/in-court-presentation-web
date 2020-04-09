import { Injectable } from '@angular/core';
import {DmDocDataService} from './dm-doc-data.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HearingDataService {

  constructor(private http: HttpClient,
              private docDataService: DmDocDataService) { }

  public loadHearingDetails(sessionId: string): Observable<any[]> {
    return new Observable<any[]>(observer => {
      this.http.get<any>(`/icp/sessions/${sessionId}`).subscribe(resp => {
        observer.next(resp.documents);
        observer.complete();

        // Old code used to call dm store again.
        // this.docDataService.getDataFromUrls(resp.documents).subscribe(docs => {
        //   observer.next(docs);
        //   observer.complete();
        // });
      });
    });
  }
}
