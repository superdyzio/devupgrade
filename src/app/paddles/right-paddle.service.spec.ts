import { TestBed } from '@angular/core/testing';

import { RightPaddleService } from './right-paddle.service';

describe('RightPaddleService', () => {
  let service: RightPaddleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RightPaddleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
