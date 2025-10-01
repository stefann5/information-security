import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateValidation } from './certificate-validation';

describe('CertificateValidation', () => {
  let component: CertificateValidation;
  let fixture: ComponentFixture<CertificateValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
