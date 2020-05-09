import { TestBed } from '@angular/core/testing';

import { ThrottleService } from './throttle.service';

describe('ThrottleService', () => {
  let service: ThrottleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThrottleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
