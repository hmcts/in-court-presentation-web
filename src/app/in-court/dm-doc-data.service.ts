import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DmDocDataService {

  constructor(private http: HttpClient) { }

  public getDataFromUrls(documentUrls: string[]): Observable<any> {
    return new Observable(observer => {
      Promise.all(this.getDocumentPromises(documentUrls)).then(docs => {
        observer.next(docs.map(doc => {
          return {
            thumb: this.fixDmUrl(doc._links.thumbnail.href),
            url: this.fixDmUrl(doc._links.self.href),
            title: doc.originalDocumentName
          };
        }));
        observer.complete();
      });
    });
  }

  private getDocumentPromises(documentUrls: string[]) {
    return documentUrls.map(url => {
      return this.convertToPromise(url);
    });
  }

  private fixDmUrl(url) {
    return url.replace(new RegExp('.*(documents/.*)'), '/demproxy/dm/$1');
  }

  private convertToPromise(url) {
    return this.http.get<any>(this.fixDmUrl(url)).toPromise();
  }
}



