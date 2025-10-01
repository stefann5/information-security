// src/app/components/certificate/certificate-validation/certificate-validation.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';

// Services
import { OcspService } from '../../../services/ocsp-service/ocsp-service';
import { CrlService } from '../../../services/crl-service/crl-service';
import { CertificateService } from '../../../services/certificate/certificate-service';

interface Certificate {
  id: number;
  serialNumber: string;
  commonName: string;
  certificateType: string;
}

@Component({
  selector: 'app-certificate-validation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
    DividerModule,
    TagModule,
    ToastModule,
    SelectModule,
    AccordionModule
  ],
  providers: [MessageService],
  templateUrl: './certificate-validation.html'
})
export class CertificateValidation implements OnInit {
  // Active section tracking
  activeSection: 'ocsp' | 'crl' | 'upload' = 'ocsp';

  // OCSP Check
  ocspSerialNumber: string = '';
  ocspStatus: string | null = null;
  ocspLoading: boolean = false;

  // CRL Download
  selectedCA: Certificate | null = null;
  caCertificates: Certificate[] = [];
  crlPemContent: string = '';
  crlLoading: boolean = false;
  crlDownloadLoading: boolean = false;

  // Certificate Upload for Validation
  uploadedCertificate: string = '';
  validationResult: any = null;
  validationLoading: boolean = false;

  constructor(
    private ocspService: OcspService,
    private crlService: CrlService,
    private certificateService: CertificateService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadCACertificates();
  }

  loadCACertificates(): void {
    this.certificateService.getCertificates().subscribe({
      next: (certificates) => {
        this.caCertificates = certificates.filter(cert => 
          cert.certificateType === 'ROOT_CA' || cert.certificateType === 'INTERMEDIATE_CA'
        );
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load CA certificates'
        });
      }
    });
  }

  // OCSP Methods
  checkOCSPStatus(): void {
    if (!this.ocspSerialNumber || this.ocspSerialNumber.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a certificate serial number'
      });
      return;
    }

    this.ocspLoading = true;
    this.ocspStatus = null;

    this.ocspService.checkCertificateStatus(this.ocspSerialNumber.trim()).subscribe({
      next: (status) => {
        this.ocspStatus = status;
        this.ocspLoading = false;

        const severity = status === 'GOOD' ? 'success' : 
                        status === 'REVOKED' ? 'error' : 'warn';
        
        this.messageService.add({
          severity: severity,
          summary: 'OCSP Status',
          detail: `Certificate status: ${status}`
        });
      },
      error: (error) => {
        this.ocspLoading = false;
        this.ocspStatus = 'ERROR';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to check OCSP status'
        });
      }
    });
  }

  clearOCSPCheck(): void {
    this.ocspSerialNumber = '';
    this.ocspStatus = null;
  }

  getOCSPStatusSeverity(): string {
    if (!this.ocspStatus) return 'info';
    switch (this.ocspStatus) {
      case 'GOOD': return 'success';
      case 'REVOKED': return 'danger';
      case 'UNKNOWN': return 'warn';
      default: return 'danger';
    }
  }

  // CRL Methods
  viewCRL(): void {
    if (!this.selectedCA) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a CA certificate'
      });
      return;
    }

    this.crlLoading = true;
    this.crlPemContent = '';

    this.crlService.getCRLPEM(this.selectedCA.id).subscribe({
      next: (pemContent) => {
        this.crlPemContent = pemContent;
        this.crlLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'CRL loaded successfully'
        });
      },
      error: (error) => {
        this.crlLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load CRL'
        });
      }
    });
  }

  downloadCRL(): void {
    if (!this.selectedCA) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a CA certificate'
      });
      return;
    }

    this.crlDownloadLoading = true;
    this.crlService.downloadCRLFile(this.selectedCA.id, this.selectedCA.commonName);
    
    setTimeout(() => {
      this.crlDownloadLoading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'CRL download started'
      });
    }, 1000);
  }

  clearCRLView(): void {
    this.selectedCA = null;
    this.crlPemContent = '';
  }

  // Certificate Upload Validation
  onCertificateFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedCertificate = e.target.result;
      };
      reader.readAsText(file);
    }
  }

  validateUploadedCertificate(): void {
    if (!this.uploadedCertificate || this.uploadedCertificate.trim() === '') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please upload or paste a certificate'
      });
      return;
    }

    this.validationLoading = true;
    this.validationResult = null;

    // Basic validation - check if it's a valid PEM format
    setTimeout(() => {
      const isValidPEM = this.uploadedCertificate.includes('-----BEGIN CERTIFICATE-----') &&
                         this.uploadedCertificate.includes('-----END CERTIFICATE-----');

      if (isValidPEM) {
        this.validationResult = {
          valid: true,
          message: 'Certificate format is valid',
          details: 'Certificate is in valid PEM format'
        };
        this.messageService.add({
          severity: 'success',
          summary: 'Valid',
          detail: 'Certificate format validated successfully'
        });
      } else {
        this.validationResult = {
          valid: false,
          message: 'Invalid certificate format',
          details: 'Certificate must be in PEM format'
        };
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid',
          detail: 'Certificate format is invalid'
        });
      }

      this.validationLoading = false;
    }, 500);
  }

  clearCertificateValidation(): void {
    this.uploadedCertificate = '';
    this.validationResult = null;
  }

  // Helper for CA display
  getCADisplayName(ca: Certificate): string {
    return ca.commonName;
  }
}