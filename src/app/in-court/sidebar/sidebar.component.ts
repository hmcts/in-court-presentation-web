import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UpdateService} from '../update.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input()
  public documents: any[];
  @Input()
  public sessionId: string;
  @Input()
  private currentDocument: string;

  @Output()
  public followingChanged = new EventEmitter<boolean>();
  @Output()
  public documentChanged = new EventEmitter<string>();

  public following = false;
  public presenting = false;
  private name: string;

  constructor(private updateService: UpdateService) {
  }

  ngOnInit() {
    this.updateService.connect(this.sessionId);
  }

  onDocumentChange(document: string) {
    if (this.presenting) {
      this.updateService.broadcastDocumentChange(1, document);
    }
    this.documentChanged.emit(document);
  }

  setFollowing(following) {
    this.following = following;
    this.followingChanged.emit(following);
  }

  setPresenting(checked: boolean) {
    this.presenting = checked;
  }

  addName(name: string) {
    this.name = name;
    this.updateService.addName(name);
  }

  public isConnected() {
    return this.updateService.isConnected();
  }

  isDocumentChecked(url: any) {
    return url === this.currentDocument;
  }
}
