import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleDetails } from './style-details';

describe('StyleDetails', () => {
  let component: StyleDetails;
  let fixture: ComponentFixture<StyleDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(StyleDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
