import { TestBed } from '@angular/core/testing';

import { LeftPaddleService } from './left-paddle.service';

describe('LeftPaddleService', () => {
  let service: LeftPaddleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeftPaddleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
