import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsrProcess } from './csr-process';

describe('CsrProcess', () => {
  let component: CsrProcess;
  let fixture: ComponentFixture<CsrProcess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CsrProcess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsrProcess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
