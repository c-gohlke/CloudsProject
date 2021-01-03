import { TestBed } from '@angular/core/testing';

import { covidDataService } from './covid-data.service';

describe('covidDataService', () => {
  let service: covidDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(covidDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
