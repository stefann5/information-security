import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';

import { MessageService } from 'primeng/api';
import { CertificateService } from '../../../services/certificate/certificate-service';
import { CertificateListDTO, AutoGenerateCertificateDTO } from '../../../dto/certificate/certificate-dtos';

@Component({
  selector: 'app-certificate-autogenerate',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ToastModule,
    MessageModule,
    TabsModule,
    DatePickerModule,
    MultiSelectModule,
    PasswordModule
  ],
  providers: [MessageService],
  templateUrl: './certificate-autogenerate.html',
  styles: [`
    :host ::ng-deep .p-password {
      width: 100%;
    }
    
    :host ::ng-deep .p-password input {
      width: 100%;
    }
    
    .p-error {
      display: block;
      margin-top: 0.25rem;
      color: var(--red-500);
    }
    
    h4 {
      color: var(--primary-color);
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--surface-border);
    }
  `]
})
export class CertificateAutogenerateComponent implements OnInit {
  autogenForm!: FormGroup;
  isLoading = false;
  
  caCertificates: CertificateListDTO[] = [];
  maxValidTo?: Date;
  minValidTo?: Date;
  
  algorithms = [
    { label: 'RSA', value: 'RSA' },
    { label: 'EC (Elliptic Curve)', value: 'EC' }
  ];
  
  availableKeySizes: any[] = [];
  
  rsaKeySizes = [
    { label: '2048 bits', value: 2048 },
    { label: '3072 bits', value: 3072 },
    { label: '4096 bits', value: 4096 }
  ];
  
  ecKeySizes = [
    { label: '256 bits', value: 256 },
    { label: '384 bits', value: 384 }
  ];
  
  keyUsageOptions = [
    { label: 'Digital Signature', value: 'DIGITAL_SIGNATURE' },
    { label: 'Key Encipherment', value: 'KEY_ENCIPHERMENT' },
    { label: 'Data Encipherment', value: 'DATA_ENCIPHERMENT' },
    { label: 'Key Agreement', value: 'KEY_AGREEMENT' },
    { label: 'Non Repudiation', value: 'NON_REPUDIATION' }
  ];
  
  keystoreTypes = [
    { label: 'PKCS12 (Recommended)', value: 'PKCS12' },
    { label: 'JKS (Java KeyStore)', value: 'JKS' }
  ];

  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCACertificates();
    this.onAlgorithmChange(); // Set initial key sizes
  }

  initializeForm() {
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    this.autogenForm = this.fb.group({
      // Personal Information (X.500 Name)
      commonName: ['', Validators.required],
      emailAddress: ['', Validators.email],
      organizationName: [''],
      organizationalUnit: [''],
      locality: [''],
      state: [''],
      countryCode: ['', [Validators.pattern(/^[A-Z]{2}$/)]],
      
      // Certificate Settings
      issuerCertificateId: [null, Validators.required],
      validFrom: [now, Validators.required],
      validTo: [oneYearLater, Validators.required],
      subjectAlternativeNames: [[]],
      
      // Key Settings
      algorithm: ['RSA', Validators.required],
      keySize: [2048, Validators.required],
      keyUsage: [['DIGITAL_SIGNATURE', 'KEY_ENCIPHERMENT']],
      
      // Security
      keystoreType: ['PKCS12', Validators.required],
      alias: ['certificate'],
      keystorePassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('keystorePassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  loadCACertificates() {
    this.certificateService.getAvailableCACertificates().subscribe({
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

  onCASelect(caId: number) {
    const selectedCA = this.caCertificates.find(ca => ca.id === caId);
    if (selectedCA) {
      // Set max validity to CA's expiration date
      this.maxValidTo = new Date(selectedCA.validTo);
      
      // Update validTo if it exceeds CA validity
      const currentValidTo = this.autogenForm.get('validTo')?.value;
      if (currentValidTo && currentValidTo > this.maxValidTo) {
        this.autogenForm.patchValue({ validTo: this.maxValidTo });
      }
      
      this.messageService.add({
        severity: 'info',
        summary: 'CA Selected',
        detail: `Certificate validity cannot exceed ${this.maxValidTo.toLocaleDateString()}`
      });
    }
  }

  onAlgorithmChange() {
    const algorithm = this.autogenForm.get('algorithm')?.value;
    
    if (algorithm === 'RSA') {
      this.availableKeySizes = this.rsaKeySizes;
      this.autogenForm.patchValue({ keySize: 2048 });
    } else if (algorithm === 'EC') {
      this.availableKeySizes = this.ecKeySizes;
      this.autogenForm.patchValue({ keySize: 256 });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.autogenForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.autogenForm.valid) {
      this.isLoading = true;
      
      const formValue = this.autogenForm.value;
      
      const request: AutoGenerateCertificateDTO = {
        commonName: formValue.commonName,
        emailAddress: formValue.emailAddress || undefined,
        organizationName: formValue.organizationName || undefined,
        organizationalUnit: formValue.organizationalUnit || undefined,
        locality: formValue.locality || undefined,
        state: formValue.state || undefined,
        countryCode: formValue.countryCode || undefined,
        
        issuerCertificateId: formValue.issuerCertificateId,
        validFrom: this.formatDateToISO(formValue.validFrom),
        validTo: this.formatDateToISO(formValue.validTo),
        
        algorithm: formValue.algorithm,
        keySize: formValue.keySize,
        
        keyUsage: formValue.keyUsage || undefined,
        subjectAlternativeNames: formValue.subjectAlternativeNames?.length > 0 
          ? formValue.subjectAlternativeNames 
          : undefined,
        
        keystoreType: formValue.keystoreType,
        keystorePassword: formValue.keystorePassword,
        alias: formValue.alias
      };

      this.certificateService.autoGenerateCertificate(request).subscribe({
        next: (blob) => {
          // Download the keystore file
          const filename = `certificate-with-key.${formValue.keystoreType.toLowerCase()}`;
          this.certificateService.downloadBlob(blob, filename);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Certificate generated! Keystore downloaded with private key. Store it securely!'
          });
          
          // Redirect after 3 seconds
          setTimeout(() => {
            const certId = sessionStorage.getItem('lastGeneratedCertId');
            if (certId) {
              this.router.navigate(['/app/certificates', certId]);
              sessionStorage.removeItem('lastGeneratedCertId');
            } else {
              this.router.navigate(['/app/certificates']);
            }
          }, 3000);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error || 'Failed to generate certificate'
          });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Form',
        detail: 'Please fill in all required fields correctly'
      });
    }
  }

  clearForm() {
    this.autogenForm.reset();
    this.initializeForm();
    this.maxValidTo = undefined;
  }

  goBack() {
    this.router.navigate(['/app/certificates']);
  }

  private formatDateToISO(date: Date): string {
    return date.toISOString();
  }

  private markFormGroupTouched() {
    Object.keys(this.autogenForm.controls).forEach(key => {
      const control = this.autogenForm.get(key);
      control?.markAsTouched();
    });
  }
}