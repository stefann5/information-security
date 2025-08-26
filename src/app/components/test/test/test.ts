import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { AuthService } from '../../../services/auth/auth-service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-test',
  imports: [Button],
  templateUrl: './test.html',
  styleUrl: './test.scss',
})
export class Test {
  private destroy$ = new Subject<void>();
  constructor(private authService: AuthService) {}
  test() {
    this.authService
      .test()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {},
        error: (error) => {},
        complete: () => {},
      });
  }
}
