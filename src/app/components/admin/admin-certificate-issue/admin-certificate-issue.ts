// src/app/components/admin/certificate-issue/admin-certificate-issue.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { MessageService } from 'primeng/api';

import { AdminService } from '../../../services/admin/admin-service';
import { CertificateService } from '../../../services/certificate/certificate-service';
import { CAUserResponseDTO, AdminCertificateRequestDTO } from '../../../dto/admin/admin-dtos';
import { CertificateListDTO } from '../../../dto/certificate/certificate-dtos';

@Component({
  selector: 'app-admin-certificate-issue',
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
    TabsModule,
    TextareaModule
  ],
  providers: [MessageService],
  templateUrl: "admin-certificate-issue.html",
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
export class AdminCertificateIssue implements OnInit {
  certificateForm!: FormGroup;
  isLoading = false;
  
  caUsers: CAUserResponseDTO[] = [];
  caCertificates: CertificateListDTO[] = [];
  selectedCAUser: CAUserResponseDTO | null = null;

  certificateTypes = [
    { label: 'Root CA', value: 'ROOT_CA' },
    { label: 'Intermediate CA', value: 'INTERMEDIATE_CA' }
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
    private adminService: AdminService,
    private certificateService: CertificateService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCAUsers();
    this.loadCACertificates();
    
    // Check if CA user ID is provided in query params
    this.route.queryParams.subscribe(params => {
      if (params['caUserId']) {
        this.preSelectCAUser(+params['caUserId']);
      }
    });
  }

  initializeForm() {
    const now = new Date();
    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(now.getFullYear() + 2);

    this.certificateForm = this.fb.group({
      caUserId: [null, Validators.required],
      certificateType: ['INTERMEDIATE_CA', Validators.required],
      issuerCertificateId: [null], // Required for intermediate CA
      commonName: ['', Validators.required],
      organizationName: [''],
      organizationalUnit: [''],
      countryCode: [''],
      emailAddress: ['', Validators.email],
      locality: [''],
      state: [''],
      subjectAlternativeNames: [''],
      validFrom: [now, Validators.required],
      validTo: [twoYearsLater, Validators.required],
      algorithm: ['RSA'],
      keySize: [2048],
      keyUsage: [['KEY_CERT_SIGN', 'CRL_SIGN']],
      extendedKeyUsage: [[]],
      isCA: [true],
      pathLenConstraint: [null],
      description: ['']
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
      this.certificateForm.get('isCA')?.setValue(true);
    }
    
    issuerControl?.updateValueAndValidity();
  }

  loadCAUsers() {
    this.adminService.getCAUsers().subscribe({
      next: (users) => {
        this.caUsers = users;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load CA users'
        });
      }
    });
  }

  loadCACertificates() {
    this.certificateService.getCertificates().subscribe({
      next: (certificates) => {
        console.log(certificates);
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

  preSelectCAUser(userId: number) {
    const user = this.caUsers.find(u => u.id === userId);
    if (user) {
      this.selectedCAUser = user;
      this.certificateForm.get('caUserId')?.setValue(userId);
      
      // Auto-populate organization info
      this.certificateForm.patchValue({
        organizationName: user.organization
      });
    }
  }

  onCAUserSelect(userId: number) {
    const user = this.caUsers.find(u => u.id === userId);
    if (user) {
      this.selectedCAUser = user;
      this.certificateForm.patchValue({
        organizationName: user.organization
      });
    }
  }

  showIssuerSelection(): boolean {
    return this.certificateForm.get('certificateType')?.value !== 'ROOT_CA';
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

      const request: AdminCertificateRequestDTO = {
        ...formValue,
        subjectAlternativeNames: sanArray
      };

      this.adminService.issueCACertificate(request).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'CA Certificate issued successfully!'
          });
          this.router.navigate(['/app/certificates', response.id]);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to issue CA certificate'
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
    this.selectedCAUser = null;
  }

  goBack() {
    this.router.navigate(['/app/admin/ca-users']);
  }

  private markFormGroupTouched() {
    Object.keys(this.certificateForm.controls).forEach(key => {
      const control = this.certificateForm.get(key);
      control?.markAsTouched();
    });
  }
}