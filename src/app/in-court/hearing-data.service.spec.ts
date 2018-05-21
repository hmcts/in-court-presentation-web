import { TestBed, inject } from '@angular/core/testing';

import { HearingDataService } from './hearing-data.service';

describe('HearingDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HearingDataService]
    });
  });

  it('should be created', inject([HearingDataService], (service: HearingDataService) => {
    expect(service).toBeTruthy();
  }));
});
