import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent {
  email: string = '';
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  adminRegister() {
    // Validate form inputs
    if (!this.email || !this.username || !this.password) {
      this.errorMessage = 'All fields are required.';
      this.clearMessagesAfterDelay();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.clearMessagesAfterDelay();
      return;
    }

    this.authService.adminRegister(this.email, this.username, this.password).subscribe(
      (response: any) => {
        console.log('Admin Registration Response:', response);
        const parsedResponse = (typeof response === 'string') ? JSON.parse(response) : response;

        if (parsedResponse.success) {
          this.successMessage = 'Admin registration successful!';
          this.errorMessage = '';
          
          // Redirect to admin login page after successful registration
          setTimeout(() => {
            this.router.navigate(['/admin-login']);
          }, 2000);
        } else {
          this.errorMessage = parsedResponse.error || 'Registration failed.';
          this.successMessage = '';
          this.clearMessagesAfterDelay();
        }
      },
      (error) => {
        console.error('Admin Registration Error:', error);
        this.errorMessage = error.message || 'An error occurred during registration.';
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