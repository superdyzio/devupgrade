import { TestBed } from '@angular/core/testing';

import { GearboxService } from './gearbox.service';

describe('GearboxService', () => {
  let service: GearboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GearboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
