import { AuthService } from './../auth.service';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email: string = '';
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    if (!this.email || !this.username || !this.password) {
      this.errorMessage = 'All fields are required.';
      this.successMessage = '';
      return;
    }
  
    this.authService.register(this.email, this.username, this.password).subscribe(
      (response: any) => {
        console.log('Registration Response:', response);
        const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
  
        if (parsedResponse.success) {
          this.successMessage = parsedResponse.success;
          this.errorMessage = '';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1000);
        } else {
          this.errorMessage = parsedResponse.error || 'Registration failed. Please try again.';
          this.successMessage = '';
        }
      },
      (error) => {
        console.error('Registration Error:', error);
        this.errorMessage = 'An error occurred during registration. Please try again later.';
        this.successMessage = '';
      }
    );
  }
}
