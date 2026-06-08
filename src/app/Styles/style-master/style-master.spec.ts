import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StyleMaster } from './style-master';

describe('StyleMaster', () => {
  let component: StyleMaster;
  let fixture: ComponentFixture<StyleMaster>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StyleMaster],
    }).compileComponents();

    fixture = TestBed.createComponent(StyleMaster);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
