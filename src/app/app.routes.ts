import { Routes } from '@angular/router';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';

export const routes: Routes = [
    { path: '', component: Login},
    { path: 'register', component: Register},
];
