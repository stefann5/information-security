import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginRequest } from '../../dto/auth/LoginRequest';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { TokensDto } from '../../dto/auth/TokensDTO';
import { RegisterRequestDto } from '../../dto/auth/RegisterRequestDTO';
import { RegisterResponseDto } from '../../dto/auth/RegisterResponseDTO';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private httpClient: HttpClient, private router: Router) { }

  IsLogged(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return true;
  }

  getToken(): string | null {
    if (this.isLocalStorageAvailable()) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }

  isTokenValid(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return false;
    }
    return true;
  }

  login(dto: LoginRequest): Observable<TokensDto> {
    return this.httpClient.post<TokensDto>(
      `${environment.apiUrl}auth/login`,
      dto
    );
  }

  register(dto: RegisterRequestDto): Observable<RegisterResponseDto> {
    let url = `${environment.apiUrl}auth/register`;

    return this.httpClient.post<RegisterResponseDto>(url, dto);
  }

  IsLoggedIn(): boolean {
    let token = localStorage.getItem('access_token');
    if (token != null) return this.isTokenValid(token);
    return false;
  }

  IsAdmin(): boolean {
    return this.getRoleFromToken() == 'A';
  }

  IsAu(): boolean {
    return this.getRoleFromToken() == 'AU';
  }

  IsSp(): boolean {
    return this.getRoleFromToken() == 'SP';
  }

  IsEo(): boolean {
    return this.getRoleFromToken() == 'EO';
  }

  getRoleFromToken(): string {
    let token = localStorage.getItem('access_token');
    if (token != null) {
      const tokenInfo = this.decodeToken(token);
      const role = tokenInfo.role;
      return role;
    }
    return '';
  }

  getIdFromToken(): number {
    if (this.isLocalStorageAvailable()){
      let token = localStorage.getItem('access_token');
    if (token != null) {
      const tokenInfo = this.decodeToken(token);
      const id = tokenInfo.id;
      return parseInt(id, 10);
    }
    }
    return -1;

  }

  Logout(): void {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
  refreshToken(refreshToken: string): Observable<TokensDto> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${refreshToken}`, // Add the refresh token to Authorization header
    });

    return this.httpClient.post<TokensDto>(`${environment.apiUrl}auth/refresh_token`,{}, {headers});
  }

  setTokens(response: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
  }

  private isLocalStorageAvailable(): boolean {
    return typeof localStorage !== 'undefined';
  }
}

