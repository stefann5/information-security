import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateList } from './certificate-list';

describe('CertificateList', () => {
  let component: CertificateList;
  let fixture: ComponentFixture<CertificateList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
