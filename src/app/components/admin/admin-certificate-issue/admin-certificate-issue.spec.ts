import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCertificateIssue } from './admin-certificate-issue';

describe('AdminCertificateIssue', () => {
  let component: AdminCertificateIssue;
  let fixture: ComponentFixture<AdminCertificateIssue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCertificateIssue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCertificateIssue);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
