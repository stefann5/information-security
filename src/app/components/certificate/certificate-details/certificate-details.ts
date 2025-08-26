// src/app/components/certificate/certificate-details/certificate-details.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';

import { MessageService, ConfirmationService } from 'primeng/api';

import { AuthService } from '../../../services/auth/auth-service';
import { SelectModule } from 'primeng/select';
import { CertificateService } from '../../../services/certificate/certificate-service';
import { CertificateResponseDTO, KeystoreDownloadDTO, RevocationRequestDTO } from '../../../dto/certificate/certificate-dtos';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-certificate-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TabsModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    DialogModule,
    SkeletonModule,
    DividerModule,
    FieldsetModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "certificate-details.html",
  styles: [`
    .field-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 0.75rem;
      word-break: break-all;
    }

    .field-content {
      padding: 0.5rem;
      background: var(--surface-100);
      border-radius: 4px;
      word-break: break-all;
    }

    .break-word {
      word-break: break-all;
      white-space: pre-wrap;
    }

    .subject-components {
      background: var(--surface-50);
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid var(--primary-color);
    }

    .component-item {
      margin-bottom: 0.5rem;
    }

    .component-item:last-child {
      margin-bottom: 0;
    }

    .certificate-data textarea {
      font-family: 'Courier New', monospace;
      background: var(--surface-100);
      border: 1px solid var(--surface-300);
    }

    .text-orange-500 {
      color: #f97316;
    }

    h6 {
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }

    :host ::ng-deep .p-fieldset-legend {
      font-weight: 600;
    }

    :host ::ng-deep .p-fieldset-content {
      padding: 1rem;
    }
  `]
})
export class CertificateDetails implements OnInit {
  certificate: CertificateResponseDTO | null = null;
  loading = true;
  downloadLoading = false;
  revocationLoading = false;

  showDownloadDialog = false;
  showRevocationDialog = false;

  downloadForm!: FormGroup;
  revocationForm!: FormGroup;

  keystoreTypes = [
    { label: 'PKCS12 (.p12)', value: 'PKCS12' },
    { label: 'Java KeyStore (.jks)', value: 'JKS' }
  ];

  revocationReasons = [
    { label: 'Unspecified', value: 'UNSPECIFIED' },
    { label: 'Key Compromise', value: 'KEY_COMPROMISE' },
    { label: 'CA Compromise', value: 'CA_COMPROMISE' },
    { label: 'Affiliation Changed', value: 'AFFILIATION_CHANGED' },
    { label: 'Superseded', value: 'SUPERSEDED' },
    { label: 'Cessation of Operation', value: 'CESSATION_OF_OPERATION' },
    { label: 'Certificate Hold', value: 'CERTIFICATE_HOLD' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadCertificate(id);
      }
    });
  }

  initializeForms() {
    this.downloadForm = this.fb.group({
      keystoreType: ['PKCS12', Validators.required],
      keystorePassword: ['', Validators.required],
      alias: ['certificate', Validators.required]
    });

    this.revocationForm = this.fb.group({
      revocationReason: ['UNSPECIFIED', Validators.required],
      reasonText: ['']
    });
  }

  loadCertificate(id?: number) {
    this.loading = true;
    const certificateId = id || +this.route.snapshot.params['id'];

    this.certificateService.getCertificate(certificateId).subscribe({
      next: (certificate) => {
        this.certificate = certificate;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Failed to load certificate'
        });
        this.loading = false;
      }
    });
  }

  downloadKeystore() {
    if (this.downloadForm.valid && this.certificate) {
      this.downloadLoading = true;
      
      const request: KeystoreDownloadDTO = {
        certificateId: this.certificate.id,
        keystorePassword: this.downloadForm.get('keystorePassword')?.value,
        keystoreType: this.downloadForm.get('keystoreType')?.value,
        alias: this.downloadForm.get('alias')?.value
      };

      this.certificateService.downloadKeystore(request).subscribe({
        next: (blob) => {
          const extension = request.keystoreType.toLowerCase() === 'pkcs12' ? 'p12' : 'jks';
          this.certificateService.downloadBlob(blob, `${request.alias}.${extension}`);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Keystore downloaded successfully'
          });
          this.showDownloadDialog = false;
          this.downloadLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to download keystore'
          });
          this.downloadLoading = false;
        }
      });
    }
  }

  downloadCertificateOnly() {
    if (this.certificate) {
      this.certificateService.downloadCertificate(this.certificate.id).subscribe({
        next: (blob) => {
          const filename = this.extractCNFromDN(this.certificate!.subjectDN) || 'certificate';
          this.certificateService.downloadBlob(blob, `${filename}.p12`);
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
  }

  revokeCertificate() {
    if (this.revocationForm.valid && this.certificate) {
      this.revocationLoading = true;
      
      const request: RevocationRequestDTO = {
        certificateId: this.certificate.id,
        revocationReason: this.revocationForm.get('revocationReason')?.value,
        reasonText: this.revocationForm.get('reasonText')?.value
      };

      this.certificateService.revokeCertificate(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Certificate revoked successfully'
          });
          this.showRevocationDialog = false;
          this.loadCertificate();
          this.revocationLoading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to revoke certificate'
          });
          this.revocationLoading = false;
        }
      });
    }
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied',
        detail: 'Certificate data copied to clipboard'
      });
    });
  }

  canRevoke(): boolean {
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

  formatCertificateType(type: string): string {
    switch (type) {
      case 'ROOT_CA': return 'Root Certificate Authority';
      case 'INTERMEDIATE_CA': return 'Intermediate Certificate Authority';
      case 'END_ENTITY': return 'End Entity Certificate';
      default: return type;
    }
  }

  formatRevocationReason(reason: string): string {
    return reason.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  isExpiringSoon(validTo: Date): boolean {
    const now = new Date();
    const expiryDate = new Date(validTo);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  }

  getDaysUntilExpiry(): number {
    if (!this.certificate) return 0;
    const now = new Date();
    const expiryDate = new Date(this.certificate.validTo);
    return Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  parseDistinguishedName(dn: string): {name: string, value: string}[] {
    if (!dn) return [];
    
    const components: {name: string, value: string}[] = [];
    const parts = dn.split(',').map(part => part.trim());
    
    for (const part of parts) {
      const [key, ...valueParts] = part.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        components.push({
          name: this.getComponentDisplayName(key.trim()),
          value: value
        });
      }
    }
    
    return components;
  }

  private getComponentDisplayName(component: string): string {
    const mapping: {[key: string]: string} = {
      'CN': 'Common Name',
      'O': 'Organization',
      'OU': 'Organizational Unit',
      'C': 'Country',
      'L': 'Locality',
      'ST': 'State',
      'E': 'Email',
      'EMAILADDRESS': 'Email Address'
    };
    
    return mapping[component.toUpperCase()] || component;
  }

  private extractCNFromDN(dn: string): string {
    if (!dn) return 'certificate';
    const match = dn.match(/CN=([^,]+)/);
    return match ? match[1].trim() : 'certificate';
  }

  goBack() {
    this.router.navigate(['/app/certificates']);
  }
}