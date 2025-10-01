import { TestBed } from '@angular/core/testing';

import { OcspService } from './ocsp-service';

describe('OcspService', () => {
  let service: OcspService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OcspService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
