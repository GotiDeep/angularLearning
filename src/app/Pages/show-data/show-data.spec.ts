import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowData } from './show-data';

describe('ShowData', () => {
  let component: ShowData;
  let fixture: ComponentFixture<ShowData>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowData],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowData);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
