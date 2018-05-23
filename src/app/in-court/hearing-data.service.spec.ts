import {TestBed, inject, async} from '@angular/core/testing';

import {HearingDataService} from './hearing-data.service';
import {DmDocDataService} from './dm-doc-data.service';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';

const DOC_OBJECT = {
  title: 'test.jpeg',
  url: '/dm/test.jpeg',
  thumb: '/dm/test.thumb.jpeg'
};

const SESSION_ID = '123-123';

class MockDmDocDataService {
  public getDataFromUrls(urls: string[]): Observable<any> {
    return Observable.of([DOC_OBJECT]);
  }
}

describe('HearingDataService', () => {

  let httpMock: HttpTestingController;
  let service: HearingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HearingDataService, {
        provide: DmDocDataService, useClass: MockDmDocDataService
      }]
    });
  });

  beforeEach(() => {
    httpMock = TestBed.get(HttpTestingController);
    service = TestBed.get(HearingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when I get hearing data', () => {
    let hearingData;
    beforeEach(async(() => {
      service.loadHearingDetails(SESSION_ID).subscribe(data => {
        hearingData = data;
      });
    }));

    beforeEach(async(() => {
      const req = httpMock.expectOne(`/icp/sessions/${SESSION_ID}`);
      req.flush({
        documents: ['https://dm-store.com/documents/123']
      });
    }));

    it('should contain docs', () => {
      expect(hearingData).toEqual([DOC_OBJECT]);
    });
  });
});

