import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaManagement } from './ca-management';

describe('CaManagement', () => {
  let component: CaManagement;
  let fixture: ComponentFixture<CaManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
