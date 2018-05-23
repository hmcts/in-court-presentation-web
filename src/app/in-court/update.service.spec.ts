import {TestBed} from '@angular/core/testing';

import {UpdateService} from './update.service';
import {StompServiceFactoryService} from './stomp-service-factory.service';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {StompHeaders} from '@stomp/ng2-stompjs/src/stomp-headers';

const SESSION_ID = '123-123';

class MockStompService {
  subscribe(queueName: string, headers?: StompHeaders): Observable<any> {
    return Observable.of({body: '{"document": "http://dm-store.com/documents/123-123-123", "page": 1}'});
  }

  connected() {
    return true;
  }
}

class MockStompServiceFactoryService {

  public get(sessionId: string) {
    return new MockStompService();
  }
}

describe('UpdateService', () => {
  let service: UpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateService, {
        provide: StompServiceFactoryService, useClass: MockStompServiceFactoryService
      }]
    });
  });

  beforeEach(() => {
    service = TestBed.get(UpdateService);
    service.connect(SESSION_ID);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be connected', () => {
    expect(service.isConnected()).toBeTruthy();
  });

  describe('when I subscribe to page updates', () => {
    let update;
    beforeEach(() => {
      service.subscribeToUpdates().subscribe(u => {
        update = u;
      });
    });

    it('should be subscribed', () => {
      expect(service.subscribed).toBe(true);
    });

    it('should get the update from the service', () => {
      expect(update.document).toEqual('http://dm-store.com/documents/123-123-123');
      expect(update.page).toEqual(1);
    });

    describe('when I unsubscribe', () => {
      beforeEach(() => {
        service.unsubscribe();
      });

      it('should not be subscribed', () => {
        expect(service.subscribed).toBe(false);
      });

    });
  });
});

