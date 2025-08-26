// src/app/components/certificate/certificate-list/certificate-list.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';

import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { CertificateListDTO } from '../../../dto/certificate/certificate-dtos';
import { CertificateService } from '../../../services/certificate/certificate-service';
import { AuthService } from '../../../services/auth/auth-service';


@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToastModule,
    TagModule,
    ConfirmDialogModule,
    CardModule,
    ToolbarModule,
    InputTextModule,
    SelectModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "certificate-list.html",
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.75rem;
    }
    
    :host ::ng-deep .p-tag {
      font-size: 0.75rem;
    }
    
    .text-orange-500 {
      color: #f97316;
    }
  `]
})
export class CertificateList implements OnInit {
  certificates: CertificateListDTO[] = [];
  loading = true;

  constructor(
    private certificateService: CertificateService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCertificates();
  }

  loadCertificates() {
    this.loading = true;
    this.certificateService.getCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load certificates'
        });
        this.loading = false;
      }
    });
  }

  canIssue(): boolean {
    return this.authService.IsAdmin() || this.authService.IsCA();
  }

  canManageTemplates(): boolean {
    return this.authService.IsAdmin() || this.authService.IsCA();
  }

  canRevoke(certificate: CertificateListDTO): boolean {
    return this.authService.IsAdmin() || this.authService.IsCA() || this.authService.IsC();
  }

  getCertTypeSeverity(type: string): string {
    switch (type) {
      case 'ROOT_CA': return 'danger';
      case 'INTERMEDIATE_CA': return 'warning';
      case 'END_ENTITY': return 'info';
      default: return 'secondary';
    }
  }

  isExpiringSoon(validTo: Date): boolean {
    const now = new Date();
    const expiryDate = new Date(validTo);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }

  viewCertificate(id: number) {
    this.router.navigate(['/app/certificates', id]);
  }

  downloadCertificate(certificate: CertificateListDTO) {
    this.certificateService.downloadCertificate(certificate.id).subscribe({
      next: (blob) => {
        this.certificateService.downloadBlob(blob, `${certificate.commonName || certificate.serialNumber}.p12`);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Certificate downloaded successfully'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to download certificate'
        });
      }
    });
  }

  revokeCertificate(certificate: CertificateListDTO) {
    this.confirmationService.confirm({
      message: `Are you sure you want to revoke certificate "${certificate.commonName || certificate.serialNumber}"?`,
      header: 'Confirm Revocation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const request = {
          certificateId: certificate.id,
          revocationReason: 'UNSPECIFIED',
          reasonText: 'Revoked by user'
        };

        this.certificateService.revokeCertificate(request).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Certificate revoked successfully'
            });
            this.loadCertificates();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to revoke certificate'
            });
          }
        });
      }
    });
  }

  navigateToIssue() {
    this.router.navigate(['/app/certificates/issue']);
  }

  navigateToCSR() {
    this.router.navigate(['/app/certificates/csr']);
  }

  navigateToTemplates() {
    this.router.navigate(['/app/certificates/templates']);
  }
}