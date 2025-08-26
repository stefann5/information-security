// src/app/components/certificate/certificate-templates/certificate-templates.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { BadgeModule } from 'primeng/badge';

import { MessageService, ConfirmationService } from 'primeng/api';

import { AuthService } from '../../../services/auth/auth-service';
import { SelectModule } from 'primeng/select';
import { CertificateListDTO, TemplateRequestDTO, TemplateResponseDTO } from '../../../dto/certificate/certificate-dtos';
import { CertificateService } from '../../../services/certificate/certificate-service';

@Component({
  selector: 'app-certificate-templates',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    ToastModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MultiSelectModule,
    ConfirmDialogModule,
    TagModule,
    ToolbarModule,
    BadgeModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "certificate-template.html",
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.75rem;
    }
    
    :host ::ng-deep .p-tag {
      font-size: 0.75rem;
    }
    
    :host ::ng-deep .p-badge {
      font-size: 0.75rem;
    }
    
    code {
      font-size: 0.75rem;
      background: var(--surface-100);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      border: 1px solid var(--surface-300);
    }
    
    .text-xs {
      font-size: 0.75rem;
    }
  `]
})
export class CertificateTemplates implements OnInit {
  @ViewChild('dt') dt!: Table;
  templates: TemplateResponseDTO[] = [];
  caCertificates: CertificateListDTO[] = [];

  loading = true;
  saving = false;

  showTemplateDialog = false;
  isEditMode = false;
  selectedTemplate: TemplateResponseDTO | null = null;

  templateForm!: FormGroup;

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
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadTemplates();
    this.loadCACertificates();
  }

  initializeForm() {
    this.templateForm = this.fb.group({
      templateName: ['', Validators.required],
      caIssuerId: [null, Validators.required],
      commonNameRegex: [''],
      sanRegex: [''],
      maxTtlDays: [365],
      defaultKeyUsageList: [['DIGITAL_SIGNATURE', 'KEY_ENCIPHERMENT']],
      defaultExtendedKeyUsageList: [[]]
    });
  }

  loadTemplates() {
    this.loading = true;
    this.certificateService.getTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load templates'
        });
        this.loading = false;
      }
    });
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

  showCreateDialog() {
    this.isEditMode = false;
    this.selectedTemplate = null;
    this.templateForm.reset();
    this.initializeForm();
    this.showTemplateDialog = true;
  }

  editTemplate(template: TemplateResponseDTO) {
    this.isEditMode = true;
    this.selectedTemplate = template;

    // Populate form with template data
    this.templateForm.patchValue({
      templateName: template.templateName,
      caIssuerId: this.getCACertificateIdByName(template.caIssuerName),
      commonNameRegex: template.commonNameRegex || '',
      sanRegex: template.sanRegex || '',
      maxTtlDays: template.maxTtlDays || 365,
      defaultKeyUsageList: template.defaultKeyUsage ? template.defaultKeyUsage.split(',') : [],
      defaultExtendedKeyUsageList: template.defaultExtendedKeyUsage ? template.defaultExtendedKeyUsage.split(',') : []
    });

    this.showTemplateDialog = true;
  }

  viewTemplate(template: TemplateResponseDTO) {
    // Navigate to template details or show read-only dialog
    this.messageService.add({
      severity: 'info',
      summary: 'Template Details',
      detail: `Template: ${template.templateName}, Max TTL: ${template.maxTtlDays || 'No limit'} days`
    });
  }

  deleteTemplate(template: TemplateResponseDTO) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete template "${template.templateName}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Note: Delete endpoint would need to be added to backend
        this.messageService.add({
          severity: 'info',
          summary: 'Note',
          detail: 'Delete functionality would be implemented with backend support'
        });
      }
    });
  }

  saveTemplate() {
    if (this.templateForm.valid) {
      this.saving = true;

      const formValue = this.templateForm.value;
      const request: TemplateRequestDTO = {
        templateName: formValue.templateName,
        caIssuerId: formValue.caIssuerId,
        commonNameRegex: formValue.commonNameRegex || undefined,
        sanRegex: formValue.sanRegex || undefined,
        maxTtlDays: formValue.maxTtlDays || undefined,
        defaultKeyUsage: formValue.defaultKeyUsageList?.length ? formValue.defaultKeyUsageList.join(',') : undefined,
        defaultExtendedKeyUsage: formValue.defaultExtendedKeyUsageList?.length ? formValue.defaultExtendedKeyUsageList.join(',') : undefined
      };

      this.certificateService.createTemplate(request).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Template "${response.templateName}" ${this.isEditMode ? 'updated' : 'created'} successfully`
          });
          this.hideDialog();
          this.loadTemplates();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} template`
          });
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  hideDialog() {
    this.showTemplateDialog = false;
    this.saving = false;
    this.isEditMode = false;
    this.selectedTemplate = null;
    this.templateForm.reset();
  }

  canManageTemplates(): boolean {
    return this.authService.IsAdmin() || this.authService.IsCA();
  }

  canEditTemplate(template: TemplateResponseDTO): boolean {
    return this.authService.IsAdmin() ||
      (this.authService.IsCA() && template.createdBy === this.authService.getCurrentUser()?.username);
  }

  canDeleteTemplate(template: TemplateResponseDTO): boolean {
    return this.canEditTemplate(template);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.templateForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getKeyUsageArray(keyUsage?: string): string[] {
    if (!keyUsage) return [];
    return keyUsage.split(',').map(usage => usage.trim());
  }

  extractCNFromDN(dn: string): string {
    if (!dn) return 'N/A';
    const match = dn.match(/CN=([^,]+)/);
    return match ? match[1].trim() : dn;
  }

  private getCACertificateIdByName(name: string): number | null {
    const cert = this.caCertificates.find(ca => ca.subjectDN === name);
    return cert ? cert.id : null;
  }

  private markFormGroupTouched() {
    Object.keys(this.templateForm.controls).forEach(key => {
      const control = this.templateForm.get(key);
      control?.markAsTouched();
    });
  }

  applyFilterGlobal($event: { target: HTMLInputElement; }, stringVal: string) {
    this.dt.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
  }
}