// src/app/components/certificate/csr-process/csr-process.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../../services/auth/auth-service';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { CertificateListDTO, CSRRequestDTO, TemplateResponseDTO } from '../../../dto/certificate/certificate-dtos';
import { CertificateService } from '../../../services/certificate/certificate-service';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-csr-process',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    InputNumberModule,
    ToastModule,
    FileUploadModule,
    DividerModule,
    MessageModule,
    TabsModule,
    TextareaModule
  ],
  providers: [MessageService],
  templateUrl: "csr-process.html",
  styles: [`
    :host ::ng-deep .p-fileupload-choose {
      width: 100%;
    }
    
    :host ::ng-deep .p-inputtextarea {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
    
    .p-error {
      display: block;
      margin-top: 0.25rem;
    }
    
    h4, h5 {
      color: var(--primary-color);
      margin-bottom: 1rem;
    }
    
    h4 {
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0.5rem;
    }
    
    .font-mono {
      font-family: 'Courier New', monospace;
    }
  `]
})
export class CSRProcess implements OnInit {
  csrForm!: FormGroup;
  isLoading = false;
  
  caCertificates: CertificateListDTO[] = [];

  
  csrInfo: any = null;

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCACertificates();
  }

  initializeForm() {
    this.csrForm = this.fb.group({
      csrData: ['', [Validators.required, this.validateCSRFormat]],
      issuerCertificateId: [null, Validators.required],
      validityDays: [365, [Validators.required, Validators.min(1), Validators.max(3650)]],
      templateId: [null]
    });
  }

  validateCSRFormat(control: any) {
    if (!control.value) return null;
    
    const csrPattern = /-----BEGIN CERTIFICATE REQUEST-----[\s\S]*-----END CERTIFICATE REQUEST-----/;
    return csrPattern.test(control.value) ? null : { invalidCSRFormat: true };
  }

  loadCACertificates() {
    this.certificateService.getCertificates().subscribe({
      next: (certificates) => {
        this.caCertificates = certificates;
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


  onCSRFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csrContent = e.target.result;
        this.csrForm.get('csrData')?.setValue(csrContent);
        this.parseCSRInfo(csrContent);
      };
      reader.readAsText(file);
    }
  }

  parseCSRInfo(csrData: string) {
    try {
      // This is a simplified CSR parsing - in real implementation,
      // you would use a proper ASN.1/X.509 parser
      
      // For demo purposes, we'll extract basic info using regex
      const subjectMatch = csrData.match(/Subject:(.+)/);
      const publicKeyMatch = csrData.match(/Public Key Algorithm: (.+)/);
      
      this.csrInfo = {
        subject: subjectMatch ? subjectMatch[1].trim() : 'Unable to parse subject',
        publicKeyAlgorithm: publicKeyMatch ? publicKeyMatch[1].trim() : 'RSA',
        keySize: '2048' // Default assumption
      };
    } catch (error) {
      this.csrInfo = null;
    }
  }

 


  isFieldInvalid(fieldName: string): boolean {
    const field = this.csrForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.csrForm.valid) {
      this.isLoading = true;
      const request: CSRRequestDTO = {
        csrData: this.csrForm.get('csrData')?.value.trim(),
        issuerCertificateId: this.csrForm.get('issuerCertificateId')?.value,
        validityDays: this.csrForm.get('validityDays')?.value,
        templateId: this.csrForm.get('templateId')?.value || undefined
      };

      this.certificateService.processCSR(request).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'CSR processed successfully! Certificate has been issued.'
          });
          this.router.navigate(['/app/certificates', response.id]);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to process CSR'
          });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fill in all required fields'
      });
    }
  }

  clearForm() {
    this.csrForm.reset();
    this.csrInfo = null;
    this.initializeForm();
  }

  goBack() {
    this.router.navigate(['/app/certificates']);
  }

  private markFormGroupTouched() {
    Object.keys(this.csrForm.controls).forEach(key => {
      const control = this.csrForm.get(key);
      control?.markAsTouched();
    });
  }
}