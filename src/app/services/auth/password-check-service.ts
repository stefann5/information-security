import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { sha1 } from 'js-sha1';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PasswordCheckService {
  constructor(private http: HttpClient) {}

  checkPwned(password: string): Observable<boolean> {
    const hash = sha1(password).toUpperCase();
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    return this.http.get(`https://api.pwnedpasswords.com/range/${prefix}`, { responseType: 'text' })
      .pipe(
        map(response => {
          return response.split('\n').some(line => line.startsWith(suffix));
        })
      );
  }
}