import {Component, OnInit} from '@angular/core';
// import {MockServiceService} from '../mock-service.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    baseUrl = '/demproxy/dm/documents';
    docId = 'be9f1344-d795-49a4-9946-cbf0acd74f9f';
    url = `${this.baseUrl}/${this.docId}`;

    constructor() {
    }

    onEnter(value: string) {
        this.docId = value;
        this.url = `${this.baseUrl}/${this.docId}`;
    }

    ngOnInit() {
        // this.getData();
    }

}
