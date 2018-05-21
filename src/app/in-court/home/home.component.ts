import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SidebarComponent} from '../sidebar/sidebar.component';
import {HearingDataService} from '../hearing-data.service';
import {UpdateService} from '../update.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  private currentDocument: string;
  private page = 1;
  private documents = [];
  private sessionId: string;

  private currentDocumentAndPage: any;

  private subscribed: boolean;

  @ViewChild(SidebarComponent)
  public sidebar: SidebarComponent;

  constructor(private hearingDataService: HearingDataService,
              private updateService: UpdateService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.subscribed = false;
    this.route.queryParamMap.subscribe(params => {
      this.sessionId = params.get('id');
      this.updateService.connect(this.sessionId);
      this.loadHearingDetails();
    });
  }

  public subscribe() {
    this.updateService.subscribeToUpdates().subscribe(this.onNext);
  }

  @HostListener('window:beforeunload', ['$event'])
  public unsubscribe() {
    this.updateService.unsubscribe();
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  public pageChange(page: number) {
    this.page = page;
    if (this.sidebar.presenting) {
      this.updateService.broadcastDocumentChange(page, this.currentDocument);
    }
  }

  onNext = (update: any) => {
    this.currentDocumentAndPage = update;
    if (this.sidebar.following && !this.sidebar.presenting) {
      this.currentDocument = update.document;
      this.page = update.page;
    }
  }

  private loadHearingDetails() {
    this.hearingDataService.loadHearingDetails(this.sessionId).subscribe(docs => {
      this.documents = docs;
      this.currentDocument = docs[0].url;
    });
  }

  onDocumentChange(document: string) {
    this.currentDocument = document;
    this.page = 1;
  }

  setFollowing(following) {
    if (this.sidebar.following && this.currentDocumentAndPage) {
      this.currentDocument = this.currentDocumentAndPage.document;
      this.page = this.currentDocumentAndPage.page;
    }
    if (this.sidebar.following) {
      this.subscribe();
    } else {
      this.unsubscribe();
    }
  }
}
