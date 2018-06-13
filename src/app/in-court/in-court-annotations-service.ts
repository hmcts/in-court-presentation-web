import {AnnotationsService} from 'em-viewer-web';
import {Observable} from 'rxjs/Observable';
import {HostListener, Injectable} from '@angular/core';
import 'rxjs/add/observable/of';
import {StompService} from '@stomp/ng2-stompjs';
import {Subscription} from 'rxjs/Subscription';
import {Message} from '@stomp/stompjs';
import {StompServiceFactoryService} from './stomp-service-factory.service';
import {HttpClient} from '@angular/common/http';
import { UUID } from 'angular2-uuid';
import {SidebarComponent} from './sidebar/sidebar.component';
import {HomeComponent} from './home/home.component';

@Injectable()
export class InCourtAnnotationsService implements AnnotationsService {

  private stompService: StompService;
  public subscribed: boolean;
  private subscription: Subscription;
  private messages: Observable<Message>;
  private sessionId: string;
  private home: HomeComponent;

  constructor(private stompServiceFactory: StompServiceFactoryService,
              private http: HttpClient) {
  }

  public connect(sessionId: string, home: HomeComponent) {
    if (!this.stompService) {
      this.sessionId = sessionId;
      this.stompService = this.stompServiceFactory.get(sessionId);
    }
    this.home = home;
  }

  public subscribeToUpdates(): Observable<any> {
    return new Observable<any>(observer => {
      if (this.subscribed || !this.sessionId) {
        return;
      }

      this.messages = this.stompService.subscribe(`/topic/annotations/${this.sessionId}`);
      this.subscription = this.messages.subscribe(message => {
        observer.next(JSON.parse(message.body));
      });
      this.subscribed = true;
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  public unsubscribe() {
    if (!this.subscribed) {
      return;
    }
    this.subscription.unsubscribe();
    this.subscription = null;
    this.messages = null;
    this.subscribed = false;
  }

  getAnnotations(documentId, pageNumber): Promise<any> {
    console.log('getting annotations');
    console.log(arguments);
    return new Promise<any>(resolve => {
      this.http.get<any[]>(`/icp/annotations/${this.sessionId}`).subscribe(annotations => {
        resolve({
          documentId,
          pageNumber,
          annotations: annotations.map(a => a.annotation).filter(a => a.page === pageNumber && (this.home.isFollowing() || this.home.isPresenting()))
        });
      });
    });
  }

  addAnnotation(page: number, annotation: any): Observable<any> {
    console.log('Add an annotation');
    console.log(arguments);
    annotation.page = page;
    annotation.uuid = UUID.UUID();

    if (this.home.isPresenting()) {
      return new Observable<any>((observer) => {
        this.http.post<any>(`/icp/annotations/${this.sessionId}`, {annotation}).subscribe((a) => {
          this.stompService.publish(`/icp/annotations/${this.sessionId}`,
            `{"annotation": {}}`);
          observer.next(a.annotation);
        });
      });
    }
  }

  deleteAnnotation(annotationUrl: string) {
    this.http.delete<any>(`icp/annotations/${this.sessionId}/${annotationUrl}`).subscribe(() => {
      this.stompService.publish(`/icp/annotations/${this.sessionId}`,
        `{"annotation": {}}`);
    })
  }
}
