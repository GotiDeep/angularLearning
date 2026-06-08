import { TestBed } from '@angular/core/testing';

import { Exportshared } from './exportshared';

describe('Exportshared', () => {
  let service: Exportshared;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Exportshared);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
