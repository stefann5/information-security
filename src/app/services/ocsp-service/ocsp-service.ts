import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OCSPStatusResponse {
  status: 'GOOD' | 'REVOKED' | 'UNKOWN';
  serialNumber: string;
  revocationDate?: string;
  revocationReason?: string;
}

@Injectable({
  providedIn: 'root'
})

export class OcspService {
  private apiURL = `${environment.apiUrl}pki/ocsp`;

  constructor(private http: HttpClient) {}

  checkCertificateStatus(serialNumber: string): Observable<string> {
    return this.http.get(`${this.apiURL}/status/${serialNumber}`, {responseType: 'text'});
  }

  processOCSPRequest(ocspRequestBytes: ArrayBuffer): Observable<ArrayBuffer> {
    return this.http.post(this.apiURL, ocspRequestBytes, {
      headers: {
        'Content-Type': 'application/ocsp-request'
      },
      responseType: 'arraybuffer'
    });
  }

  processOCSPRequestBase64(encodedRequest: string): Observable<ArrayBuffer> {
    return this.http.get(`${this.apiURL}/${encodedRequest}`, {
      responseType: 'arraybuffer'
    });
  }
}
