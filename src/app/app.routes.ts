// import { Routes } from '@angular/router';
// import { Login } from './components/auth/login/login';
// import { Register } from './components/auth/register/register';
// import { AuthGuard } from './services/auth/auth-guard';
// import { CAGuard } from './services/auth/ca-guard';
// import { CGuard } from './services/auth/c-guard';
// import { CertificateIssue } from './components/certificate/certificate-issue/certificate-issue';
// import { CertificateList } from './components/certificate/certificate-list/certificate-list';
// import { CSRProcess } from './components/certificate/csr-process/csr-process';
// import { CertificateDetails } from './components/certificate/certificate-details/certificate-details';
// import { CertificateTemplates } from './components/certificate/certificate-template/certificate-template';

// export const routes: Routes = [
//     { path: '', component: Login},
//     { path: 'register', component: Register},
//     { path: 'certificate-list', component: CertificateList},
//     { path: 'certificate-details/:id', component: CertificateDetails},
//     { path: 'certificate-templates', component:CertificateTemplates}


    
// ];

import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { AuthGuard } from './services/auth/auth-guard';
import { CAGuard } from './services/auth/ca-guard';
import { CGuard } from './services/auth/c-guard';
import { AdminGuard } from './services/auth/admin-guard';

// Layout components
import { Dashboard } from './components/dashboard/dashboard';

// Certificate components
import { CertificateList } from './components/certificate/certificate-list/certificate-list';
import { CertificateIssue } from './components/certificate/certificate-issue/certificate-issue';
import { CSRProcess } from './components/certificate/csr-process/csr-process';
import { CertificateDetails } from './components/certificate/certificate-details/certificate-details';
import { CertificateTemplates } from './components/certificate/certificate-template/certificate-template';

export const routes: Routes = [
    // Public routes
    { path: '', component: Login },
    { path: 'register', component: Register },
    
    // Protected routes with dashboard layout
    { 
        path: 'app',
        component: Dashboard,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: 'certificates', pathMatch: 'full' },
            { 
                path: 'certificates', 
                component: CertificateList
            },
            { 
                path: 'certificates/issue', 
                component: CertificateIssue
            },
            { 
                path: 'certificates/csr', 
                component: CSRProcess
            },
            { 
                path: 'certificates/templates', 
                component: CertificateTemplates
            },
            { 
                path: 'certificates/:id', 
                component: CertificateDetails
            },
        ]
    },
    
    // Direct protected routes (without layout) - for backward compatibility
    { 
        path: 'certificates', 
        redirectTo: '/app/certificates',
        pathMatch: 'full'
    },
    { 
        path: 'certificates/issue', 
        redirectTo: '/app/certificates/issue',
        pathMatch: 'full'
    },
    { 
        path: 'certificates/csr', 
        redirectTo: '/app/certificates/csr',
        pathMatch: 'full'
    },
    { 
        path: 'certificates/templates', 
        redirectTo: '/app/certificates/templates',
        pathMatch: 'full'
    },
    
    // Admin only routes
    {
        path: 'admin',
        component: Dashboard,
        canActivate: [AuthGuard, AdminGuard],
        children: [
            // Admin-specific routes can be added here
        ]
    },
    
    // CA user routes
    {
        path: 'ca',
        component: Dashboard,
        canActivate: [AuthGuard, CAGuard],
        children: [
            // CA-specific routes can be added here
        ]
    },
    
    // Default redirect
    { path: '**', redirectTo: '/app', pathMatch: 'full' }
];