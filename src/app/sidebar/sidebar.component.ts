import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StompService} from '@stomp/ng2-stompjs';

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
  stompService: StompService;

  @Output()
  public followingChanged = new EventEmitter<boolean>();
  @Output()
  public documentChanged = new EventEmitter<string>();

  public following = false;
  public presenting = false;
  private name: string;

  constructor() { }

  ngOnInit() {
  }

  onDocumentChange(document: string) {
    if (this.presenting){
      this.stompService.publish(`/icp/screen-change/${this.sessionId}`,
        `{"page":  1, "document": "${document}"}`);
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
    this.stompService.publish(`/icp/participants/${this.sessionId}`,
      `{"name": "${this.name}", "status": "CONNECTED", "sessionId": "${this.sessionId}"}`);
  }

  public isConnected() {
    return this.stompService.connected();
  }

}
