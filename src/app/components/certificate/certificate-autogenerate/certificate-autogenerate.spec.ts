import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateAutogenerate } from './certificate-autogenerate';

describe('CertificateAutogenerate', () => {
  let component: CertificateAutogenerate;
  let fixture: ComponentFixture<CertificateAutogenerate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateAutogenerate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateAutogenerate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
