import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Username and password are required.';
      this.successMessage = '';
      this.clearMessagesAfterDelay();
      return;
    }

    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        console.log('Login Response:', response);
        const parsedResponse = (typeof response === 'string') ? JSON.parse(response) : response;

        if (parsedResponse.success) {
          this.successMessage = parsedResponse.success;
          this.errorMessage = '';
          this.clearMessagesAfterDelay();

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        } else {
          this.errorMessage = parsedResponse.error || 'Invalid username or password.';
          this.successMessage = '';
          this.clearMessagesAfterDelay();
        }
      },
      (error) => {
        console.error('Login Error:', error);
        this.errorMessage = error.message || 'An error occurred during login. Please try again later.';
        this.successMessage = '';
        this.clearMessagesAfterDelay();
      }
    );
  }

  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}
