import { TestBed } from '@angular/core/testing';

import { DynamicWebTWAINService } from './dynamic-web-twain.service';

describe('DynamicWebTWAINService', () => {
  let service: DynamicWebTWAINService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicWebTWAINService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
