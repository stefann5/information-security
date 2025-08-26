// src/app/components/certificate/certificate-issue/certificate-issue.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { StepsModule } from 'primeng/steps';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';

import { MessageService, MenuItem } from 'primeng/api';

import { AuthService } from '../../../services/auth/auth-service';
import { CertificateListDTO, CertificateRequestDTO, TemplateResponseDTO } from '../../../dto/certificate/certificate-dtos';
import { CertificateService } from '../../../services/certificate/certificate-service';

@Component({
  selector: 'app-certificate-issue',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    CheckboxModule,
    InputNumberModule,
    ToastModule,
    StepsModule,
    TabsModule
  ],
  providers: [MessageService],
  templateUrl: "certificate-issue.html",
  styles: [`
    :host ::ng-deep .p-tabview-nav-link {
      padding: 1rem 1.5rem;
    }
    
    :host ::ng-deep .p-tabview-panel {
      padding: 0;
    }
    
    .p-error {
      display: block;
      margin-top: 0.25rem;
    }
    
    h4 {
      color: var(--primary-color);
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
  `]
})
export class CertificateIssue implements OnInit {
  certificateForm!: FormGroup;
  isLoading = false;
  
  caCertificates: CertificateListDTO[] = [];
  templates: TemplateResponseDTO[] = [];

  certificateTypes = [
    { label: 'End Entity', value: 'END_ENTITY' },
    { label: 'Intermediate CA', value: 'INTERMEDIATE_CA' },
    { label: 'Root CA', value: 'ROOT_CA' }
  ];

  algorithms = [
    { label: 'RSA', value: 'RSA' },
    { label: 'EC', value: 'EC' }
  ];

  keySizes = [
    { label: '2048 bits', value: 2048 },
    { label: '3072 bits', value: 3072 },
    { label: '4096 bits', value: 4096 }
  ];

  keyUsageOptions = [
    { label: 'Digital Signature', value: 'DIGITAL_SIGNATURE' },
    { label: 'Key Encipherment', value: 'KEY_ENCIPHERMENT' },
    { label: 'Key Agreement', value: 'KEY_AGREEMENT' },
    { label: 'Key Cert Sign', value: 'KEY_CERT_SIGN' },
    { label: 'CRL Sign', value: 'CRL_SIGN' },
    { label: 'Non Repudiation', value: 'NON_REPUDIATION' },
    { label: 'Data Encipherment', value: 'DATA_ENCIPHERMENT' }
  ];

  extendedKeyUsageOptions = [
    { label: 'Server Authentication', value: 'SERVER_AUTH' },
    { label: 'Client Authentication', value: 'CLIENT_AUTH' },
    { label: 'Code Signing', value: 'CODE_SIGNING' },
    { label: 'Email Protection', value: 'EMAIL_PROTECTION' },
    { label: 'Time Stamping', value: 'TIME_STAMPING' }
  ];

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
    this.loadTemplates();
    this.filterCertificateTypes();
  }

  initializeForm() {
    const now = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(now.getFullYear() + 1);

    this.certificateForm = this.fb.group({
      certificateType: ['END_ENTITY', Validators.required],
      issuerCertificateId: [null],
      templateId: [null],
      commonName: ['', Validators.required],
      organizationName: [''],
      organizationalUnit: [''],
      countryCode: [''],
      emailAddress: ['', Validators.email],
      locality: [''],
      state: [''],
      subjectAlternativeNames: [''], // Changed from array to string
      validFrom: [now, Validators.required],
      validTo: [oneYearLater, Validators.required],
      algorithm: ['RSA'],
      keySize: [2048],
      keyUsage: [['DIGITAL_SIGNATURE', 'KEY_ENCIPHERMENT']],
      extendedKeyUsage: [[]],
      isCA: [false],
      pathLenConstraint: [null]
    });

    // Set validators based on certificate type
    this.certificateForm.get('certificateType')?.valueChanges.subscribe(type => {
      this.updateFormValidators(type);
    });
  }

  updateFormValidators(type: string) {
    const issuerControl = this.certificateForm.get('issuerCertificateId');
    
    if (type === 'ROOT_CA') {
      issuerControl?.clearValidators();
      this.certificateForm.get('isCA')?.setValue(true);
    } else {
      issuerControl?.setValidators([Validators.required]);
      this.certificateForm.get('isCA')?.setValue(type === 'INTERMEDIATE_CA');
    }
    
    issuerControl?.updateValueAndValidity();
  }

  filterCertificateTypes() {
    if (!this.authService.IsAdmin()) {
      this.certificateTypes = this.certificateTypes.filter(type => type.value !== 'ROOT_CA');
    }
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

  loadTemplates() {
    this.certificateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
      },
      error: (error) => {
        console.error('Failed to load templates:', error);
      }
    });
  }

  onTemplateSelect(templateId: number) {
    if (!templateId) return;

    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      // Apply template defaults
      if (template.defaultKeyUsage) {
        this.certificateForm.get('keyUsage')?.setValue(template.defaultKeyUsage.split(','));
      }
      if (template.defaultExtendedKeyUsage) {
        this.certificateForm.get('extendedKeyUsage')?.setValue(template.defaultExtendedKeyUsage.split(','));
      }
      if (template.maxTtlDays) {
        const validFrom = this.certificateForm.get('validFrom')?.value || new Date();
        const validTo = new Date(validFrom.getTime() + (template.maxTtlDays * 24 * 60 * 60 * 1000));
        this.certificateForm.get('validTo')?.setValue(validTo);
      }

      this.messageService.add({
        severity: 'info',
        summary: 'Template Applied',
        detail: `Template "${template.templateName}" settings applied`
      });
    }
  }

  showIssuerSelection(): boolean {
    return this.certificateForm.get('certificateType')?.value !== 'ROOT_CA';
  }

  isCACertificate(): boolean {
    const type = this.certificateForm.get('certificateType')?.value;
    return type === 'ROOT_CA' || type === 'INTERMEDIATE_CA';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.certificateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit() {
    if (this.certificateForm.valid) {
      this.isLoading = true;
      const formValue = this.certificateForm.value;
      
      // Convert comma-separated SAN string to array
      const sanString = formValue.subjectAlternativeNames;
      const sanArray = sanString ? 
        sanString.split(',').map((san: string) => san.trim()).filter((san: string) => san.length > 0) : 
        [];

      const request: CertificateRequestDTO = {
        ...formValue,
        subjectAlternativeNames: sanArray
      };

      this.certificateService.issueCertificate(request).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Certificate issued successfully!'
          });
          this.router.navigate(['/certificates', response.id]);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to issue certificate'
          });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  resetForm() {
    this.certificateForm.reset();
    this.initializeForm();
  }

  goBack() {
    this.router.navigate(['/certificates']);
  }

  private markFormGroupTouched() {
    Object.keys(this.certificateForm.controls).forEach(key => {
      const control = this.certificateForm.get(key);
      control?.markAsTouched();
    });
  }
}