import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportCustomers } from './import-customers';

describe('ImportCustomers', () => {
  let component: ImportCustomers;
  let fixture: ComponentFixture<ImportCustomers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportCustomers],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportCustomers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
