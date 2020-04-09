import { Injectable } from '@angular/core';

@Injectable()
export class DmDocDataService {

  constructor() { }

  public formatDocumentUrls(documentUrls: string[]): any[] {
    return documentUrls.map(doc => {
      return {url: doc + '/binary', checked: false}
    });
  }
}



