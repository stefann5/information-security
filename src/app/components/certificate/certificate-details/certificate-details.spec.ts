import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateDetails } from './certificate-details';

describe('CertificateDetails', () => {
  let component: CertificateDetails;
  let fixture: ComponentFixture<CertificateDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
