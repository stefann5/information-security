import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateTemplate } from './certificate-template';

describe('CertificateTemplate', () => {
  let component: CertificateTemplate;
  let fixture: ComponentFixture<CertificateTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateTemplate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateTemplate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
