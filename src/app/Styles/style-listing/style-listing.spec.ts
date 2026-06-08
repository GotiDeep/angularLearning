import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleListing } from './style-listing';

describe('StyleListing', () => {
  let component: StyleListing;
  let fixture: ComponentFixture<StyleListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleListing],
    }).compileComponents();

    fixture = TestBed.createComponent(StyleListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
