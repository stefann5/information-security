import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { AuthGuard } from './services/auth/auth-guard';
import { CAGuard } from './services/auth/ca-guard';
import { CGuard } from './services/auth/c-guard';

export const routes: Routes = [
    { path: '', component: Login},
    { path: 'register', component: Register}
];
