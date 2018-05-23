import {TestBed, inject, async} from '@angular/core/testing';

import {DmDocDataService} from './dm-doc-data.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Observable} from 'rxjs/Observable';

describe('DmDocDataService', () => {
  let httpMock: HttpTestingController;
  let service: DmDocDataService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [DmDocDataService],
      imports: [HttpClientTestingModule]
    });
  }));

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(DmDocDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when we call the service with a document url', () => {
    const uuid = '123',
      documentUrl = `https://dm-store/documents/${uuid}`;
    let docData;

    beforeEach(async(() => {
      service.getDataFromUrls([documentUrl]).subscribe(data => {
        docData = data;
      });
    }));

    beforeEach(async(() => {
      const req = httpMock.expectOne(`/demproxy/dm/documents/${uuid}`);
      req.flush({
        mimeType: 'image/jpeg',
        originalDocumentName: 'image.jpeg',
        _links: {
          binary: {
            href: `${documentUrl}/binary`
          },
          thumbnail: {
            href: `${documentUrl}/thumbnail`
          },
          self: {
            href: `${documentUrl}`
          }
        }
      });
    }));

    it('should have one element', () => {
        expect(docData.length).toEqual(1);
    });

    it('should have mapped the data', () => {
        expect(docData[0].url).toEqual(`/demproxy/dm/documents/${uuid}`);
        expect(docData[0].thumb).toEqual(`/demproxy/dm/documents/${uuid}/thumbnail`);
        expect(docData[0].title).toEqual(`image.jpeg`);
    });
  });
});
