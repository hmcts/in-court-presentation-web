import { TestBed, inject } from '@angular/core/testing';

import { DmDocDataService } from './dm-doc-data.service';

describe('DmDocDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DmDocDataService]
    });
  });

  it('should be created', inject([DmDocDataService], (service: DmDocDataService) => {
    expect(service).toBeTruthy();
  }));
});
