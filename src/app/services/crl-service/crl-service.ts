import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CRLInfo {
  caId: number;
  caName: string;
  issueDate: Date;
  nextUpdate: Date;
  revokedCount: number;
}

@Injectable({
  providedIn: 'root'
})

export class CrlService {
  private apiURL = `${environment.apiUrl}pki/crl`;
  
  constructor(private http: HttpClient) {}

  downloadCRL(caId: number): Observable<Blob> {
    return this.http.get(`${this.apiURL}/${caId}`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pkcs7-crl'
      }
    });
  }

  getCRLPEM(caId: number): Observable<string> {
    return this.http.get(`${this.apiURL}/${caId}/pem`, {
      responseType: 'text',
      headers: {
        'Accept': 'application/x-pem-file'
      }
    });
  }

  downloadCRLFile(caId: number, caName: string): void {
    this.downloadCRL(caId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ca-${caId}-${caName}.crl`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Failed to download CRL: ', error);
      }
    });
  }
}
