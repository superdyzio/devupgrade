import { TestBed } from '@angular/core/testing';

import { BrakeService } from './brake.service';

describe('BrakeService', () => {
  let service: BrakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
