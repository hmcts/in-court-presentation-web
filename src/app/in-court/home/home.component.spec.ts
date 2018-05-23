import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HomeComponent} from './home.component';
import {ParticipantsComponent} from '../participants/participants.component';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {EmViewerModule} from 'em-viewer-web';
import {UpdateService} from '../update.service';
import {Mock} from 'protractor/built/driverProviders';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import {HearingDataService} from '../hearing-data.service';
import {ActivatedRoute, convertToParamMap} from '@angular/router';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {ParticipantsService} from '../participants.service';
import {DmDocDataService} from '../dm-doc-data.service';
import {StompServiceFactoryService} from '../stomp-service-factory.service';
import {StompService} from '@stomp/ng2-stompjs';
import {StompHeaders} from '@stomp/ng2-stompjs/src/stomp-headers';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

const SESSION_ID = '123-123-123';

function getDocumentBody(documentName: string, documentUrl: string) {
  return {
    mimeType: 'image/jpeg',
    originalDocumentName: documentName,
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
  };
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;
  let element: DebugElement;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent, ParticipantsComponent, SidebarComponent],
      imports: [EmViewerModule, HttpClientTestingModule],
      providers: [
        HearingDataService, UpdateService, ParticipantsService, DmDocDataService,
        {
          provide: StompServiceFactoryService, useClass: MockStompServiceFactoryService
        },
        {
          provide: ActivatedRoute, useClass: ActivatedRouteMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;

    httpMock = TestBed.get(HttpTestingController);

    element = fixture.debugElement;
    fixture.detectChanges();
  });

  beforeEach(async(() => {
    const req = httpMock.expectOne(`/icp/sessions/${SESSION_ID}`);
    req.flush({
      documents: ['https://dm-store.com/documents/123', 'https://dm-store.com/documents/345']
    });
  }));

  beforeEach(async(() => {
    const req = httpMock.expectOne(`/demproxy/dm/documents/123`);
    req.flush(getDocumentBody('image.jpeg', 'https://dm-store.com/documents/123'));

    const req2 = httpMock.expectOne(`/demproxy/dm/documents/345`);
    req2.flush(getDocumentBody('image2.jpeg', 'https://dm-store.com/documents/345'));
  }));

  beforeEach(async(() => {
    fixture.whenStable().then(() => {
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the documents', () => {
    expect(element.nativeElement.querySelectorAll('div[data-hook="icp-sidebar-document"]').length).toEqual(2);
  });

  describe('when I add my name', () => {
    beforeEach(async(() => {
      const nameElement = element.query(By.css('input[data-hook="icp-sidebar-name"]'));
      nameElement.nativeElement.value = 'Louis';
      nameElement.triggerEventHandler('change', nameElement.nativeElement.value);
    }));

    beforeEach(async(() => {
      fixture.whenStable().then(() => {
        fixture.detectChanges();
      });
    }));

    it('should display presenting radio', () => {
      expect(element.nativeElement.querySelector('input[data-hook="icp-sidebar-presenting"]')).toBeTruthy();
    });

    it('should display following radio', () => {
      expect(element.nativeElement.querySelector('input[data-hook="icp-sidebar-following"]')).toBeTruthy();
    });

    describe('when I start following and receive an update from the server', () => {
      beforeEach(async(() => {
        element.nativeElement.querySelector('input[data-hook="icp-sidebar-following"]').click();
      }));

      beforeEach(async(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
        });
      }));

      it('should select the second document', () => {
        expect(element.nativeElement.querySelectorAll('div[data-hook="icp-sidebar-document"] input')[1].checked).toBe(true);
      });
    });

    describe('when I start presenting', () => {
      beforeEach(async(() => {
        element.nativeElement.querySelector('input[data-hook="icp-sidebar-presenting"]').click();
      }));

      beforeEach(async(() => {
        fixture.whenStable().then(() => {
          fixture.detectChanges();
        });
      }));

      it('should show all connected participants', () => {
        expect(element.nativeElement.querySelector('li[data-hook="icp-participants-participant"] span').innerHTML).toEqual('Sameer');
      });
    });
  });
});

class MockStompServiceFactoryService {
  public get() {
    return new MockStompService();
  }
}

class MockStompService {
  subscribe(queueName: string, headers?: StompHeaders): Observable<any> {
    if (queueName.match(new RegExp('.*screen-change.*'))) {
      return Observable.of({body: '{"document": "/demproxy/dm/documents/345", "page": 2}'});
    }
    if (queueName.match(new RegExp('.*participants.*'))) {
      return Observable.of({body: '[{"name": "Sameer", "status": "CONNECTED"}]'});
    }
  }

  publish() {

  }

  connected() {
    return true;
  }
}



class ActivatedRouteMock {
  public queryParamMap = Observable.of(convertToParamMap({
    id: SESSION_ID
  }));
}
