import { TestBed } from '@angular/core/testing';

import { HttpsCommService } from './https-comm.service';

describe('HttpsCommServiceService', () => {
  let service: HttpsCommService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpsCommService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
