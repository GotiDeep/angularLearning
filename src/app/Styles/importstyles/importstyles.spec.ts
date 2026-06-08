import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Importstyles } from './importstyles';

describe('Importstyles', () => {
  let component: Importstyles;
  let fixture: ComponentFixture<Importstyles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Importstyles],
    }).compileComponents();

    fixture = TestBed.createComponent(Importstyles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
