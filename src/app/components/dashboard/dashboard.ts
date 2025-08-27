// src/app/components/dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

// PrimeNG imports
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ToastModule } from 'primeng/toast';
import { DrawerModule } from 'primeng/drawer';
import { MenuItem, MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth-service';
import { CertificateService } from '../../services/certificate/certificate-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MenubarModule,
    ButtonModule,
    CardModule,
    BadgeModule,
    AvatarModule,
    RippleModule,
    DrawerModule,
    PanelMenuModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: "dashboard.html",
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    :host ::ng-deep .p-menubar {
      border-radius: 0;
      border: none;
      border-bottom: 1px solid var(--surface-border);
    }

    .layout-content {
      flex: 1;
      padding: 1.5rem;
      background: var(--surface-ground);
      min-height: calc(100vh - 4rem);
    }

    :host ::ng-deep .p-card {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border: 1px solid var(--surface-border);
    }

    :host ::ng-deep .p-card .p-card-body {
      padding: 1.5rem;
    }
  `]
})
export class Dashboard implements OnInit {
  menuItems: MenuItem[] = [];

  // Quick stats
  certificateCount = 0;
  activeCertificates = 0;
  expiringSoon = 0;
  templateCount = 0;

  constructor(
    private authService: AuthService,
    private certificateService: CertificateService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initializeMenu();
    this.loadQuickStats();
  }

  initializeMenu() {
    this.menuItems = [
      {
        label: 'Certificates',
        icon: 'pi pi-file',
        routerLink: '/app/certificates'
      }
    ];

    if (this.csrAvailable()) {
      this.menuItems.push({
        label: 'Process CSR',
        icon: 'pi pi-upload',
        routerLink: '/app/certificates/csr'
      });
    }

    // Add role-specific menu items
    if (this.canIssue()) {
      this.menuItems.push({
        label: 'Issue Certificate',
        icon: 'pi pi-plus',
        routerLink: '/app/certificates/issue'
      });


    }



    if (this.canManageTemplates()) {
      this.menuItems.push({
        label: 'Templates',
        icon: 'pi pi-bookmark',
        routerLink: '/app/certificates/templates'
      });
    }

    if (this.authService.IsAdmin()) {
      this.menuItems.push({
        label: 'Admin',
        icon: 'pi pi-cog',
        items: [
          {
            label: 'CA User Management',
            icon: 'pi pi-users',
            routerLink: '/app/admin/ca-users'
          },
          {
            label: 'System Settings',
            icon: 'pi pi-sliders-h',
            command: () => {
              this.messageService.add({
                severity: 'info',
                summary: 'Coming Soon',
                detail: 'System settings functionality'
              });
            }
          }
        ]
      });
    }
  }

  loadQuickStats() {
    if (this.showQuickStats()) {
      this.certificateService.getCertificates().subscribe({
        next: (certificates) => {
          this.certificateCount = certificates.length;
          this.activeCertificates = certificates.filter(cert => !cert.revoked).length;

          // Calculate expiring soon (within 30 days)
          const now = new Date();
          this.expiringSoon = certificates.filter(cert => {
            if (cert.revoked) return false;
            const expiryDate = new Date(cert.validTo);
            const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
          }).length;
        },
        error: (error) => {
          console.error('Failed to load certificate stats:', error);
        }
      });

      // Load template count if user can manage templates
      if (this.canManageTemplates()) {
        this.certificateService.getTemplates().subscribe({
          next: (templates) => {
            this.templateCount = templates.length;
          },
          error: (error) => {
            console.error('Failed to load template stats:', error);
          }
        });
      }
    }
  }

  showQuickStats(): boolean {
    return this.router.url === '/app/certificates';
  }

  canIssue(): boolean {
    return this.authService.IsAdmin() || this.authService.IsCA();
  }

  csrAvailable():boolean{
    return !this.authService.IsCA();
  }

  canManageTemplates(): boolean {
    return this.authService.IsAdmin() || this.authService.IsCA();
  }

  getCurrentUserName(): string {
    const user = this.authService.getCurrentUser();
    return user ? `${user.name} ${user.surname}` : 'User';
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user) {
      const firstInitial = user.name?.charAt(0) || '';
      const lastInitial = user.surname?.charAt(0) || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    return 'U';
  }

  logout() {
    this.authService.logout();
  }
}