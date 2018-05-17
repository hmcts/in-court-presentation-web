import { TestBed, inject } from '@angular/core/testing';

import { StompServiceFactoryService } from './stomp-service-factory.service';

describe('StompServiceFactoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StompServiceFactoryService]
    });
  });

  it('should be created', inject([StompServiceFactoryService], (service: StompServiceFactoryService) => {
    expect(service).toBeTruthy();
  }));
});
