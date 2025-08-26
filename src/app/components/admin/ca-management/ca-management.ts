// src/app/components/admin/ca-management/ca-management.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

import { AdminService } from '../../../services/admin/admin-service';
import { CAUserResponseDTO, CreateCAUserRequestDTO } from '../../../dto/admin/admin-dtos';

@Component({
  selector: 'app-ca-management',
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
    PasswordModule,
    TagModule,
    ToolbarModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: "ca-management.html",
  styles: [`
    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 0.75rem;
    }
    
    :host ::ng-deep .p-tag {
      font-size: 0.75rem;
    }
  `]
})
export class CAManagement implements OnInit {
  caUsers: CAUserResponseDTO[] = [];
  loading = true;
  saving = false;

  showCreateDialog = false;
  createUserForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadCAUsers();
  }

  initializeForm() {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      surname: ['', [Validators.required, Validators.minLength(2)]],
      organization: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  loadCAUsers() {
    this.loading = true;
    this.adminService.getCAUsers().subscribe({
      next: (users) => {
        this.caUsers = users;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load CA users'
        });
        this.loading = false;
      }
    });
  }

  showCreateUserDialog() {
    this.createUserForm.reset();
    this.showCreateDialog = true;
  }

  createCAUser() {
    if (this.createUserForm.valid) {
      this.saving = true;
      const request: CreateCAUserRequestDTO = this.createUserForm.value;

      this.adminService.createCAUser(request).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `CA user "${response.username}" created successfully`
          });
          this.showCreateDialog = false;
          this.loadCAUsers();
          this.saving = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create CA user'
          });
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  issueCertificate(caUser: CAUserResponseDTO) {
    this.router.navigate(['/app/admin/issue-certificate'], { 
      queryParams: { caUserId: caUser.id } 
    });
  }

  viewCAUser(caUser: CAUserResponseDTO) {
    this.messageService.add({
      severity: 'info',
      summary: 'CA User Details',
      detail: `${caUser.name} ${caUser.surname} - ${caUser.organization}`
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createUserForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const control = this.createUserForm.get(fieldName);
    if (control?.errors?.['required']) {
      return `${this.getFieldDisplayName(fieldName)} is required`;
    }
    if (control?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    if (control?.errors?.['minlength']) {
      return `${this.getFieldDisplayName(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Email',
      password: 'Password',
      name: 'Name',
      surname: 'Surname',
      organization: 'Organization'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched() {
    Object.keys(this.createUserForm.controls).forEach(key => {
      const control = this.createUserForm.get(key);
      control?.markAsTouched();
    });
  }
}