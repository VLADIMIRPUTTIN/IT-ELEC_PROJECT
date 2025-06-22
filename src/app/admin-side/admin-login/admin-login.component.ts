import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  adminLogin() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      this.successMessage = '';
      this.clearMessagesAfterDelay();
      return;
    }

    this.authService.adminLogin(this.email, this.password).subscribe(
      (response: any) => {
        console.log('Admin Login Response:', response);
        const parsedResponse = (typeof response === 'string') ? JSON.parse(response) : response;

        if (parsedResponse.success) {
          this.successMessage = 'Admin login successful!';
          this.errorMessage = '';
          
          // Navigate immediately to admin dashboard
          this.router.navigate(['/admin']).then(() => {
            console.log('Navigation to admin dashboard complete');
          }).catch(err => {
            console.error('Navigation error:', err);
            this.errorMessage = 'Failed to navigate to admin dashboard';
          });
        } else {
          this.errorMessage = parsedResponse.error || 'Invalid admin credentials.';
          this.successMessage = '';
          this.clearMessagesAfterDelay();
        }
      },
      (error) => {
        console.error('Admin Login Error:', error);
        this.errorMessage = error.message || 'An error occurred during admin login.';
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