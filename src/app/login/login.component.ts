import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Load Google script and render button when page loads
    this.loadGoogleScript();
  }

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

  // Initialize Google Sign-In
  initGoogleSignIn() {
    // Make sure window.google is available (added by the Google script)
    window.onload = () => {
      if (typeof google !== 'undefined') {
        google.accounts.id.initialize({
          client_id: '209979773198-25s0s393sceitste72jnh3583dldq8fr.apps.googleusercontent.com',
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    };
  }

  // New method to sign in with Google
  signInWithGoogle() {
    console.log("Google Sign-In requested");
    
    if (typeof google !== 'undefined' && google.accounts) {
      // Clear any previous button
      const buttonContainer = document.getElementById('google-button-container');
      if (buttonContainer) buttonContainer.innerHTML = '';
      
      // Initialize with your client ID
      google.accounts.id.initialize({
        client_id: '209979773198-25s0s393sceitste72jnh3583dldq8fr.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Render the button with enhanced styling
      google.accounts.id.renderButton(
        buttonContainer, 
        { 
          type: 'standard',
          theme: 'outline', 
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'center'
        }
      );
    } else {
      console.error("Google Sign-In API not loaded properly");
      this.errorMessage = 'Google Sign-In API not loaded. Please try again later.';
    }
  }

  // Handle the credential response from Google
  handleCredentialResponse(response: any) {
    console.log("Credential Response:", response);
    
    if (response && response.credential) {
      console.log("Google token received successfully");
      
      // Send the token to your backend
      this.authService.loginWithGoogle(response.credential).subscribe(
        (backendResponse: any) => {
          console.log('Google Login Response:', backendResponse);
          
          if (backendResponse && backendResponse.success) {
            // No need to manually handle localStorage here, it's done in the service
            
            this.ngZone.run(() => {
              this.successMessage = 'Successfully logged in with Google!';
              
              // Add a delay to ensure localStorage is updated before navigation
              setTimeout(() => {
                this.router.navigate(['/home']);
              }, 500);
            });
          } else {
            this.ngZone.run(() => {
              this.errorMessage = backendResponse?.error || 'Google login failed.';
            });
          }
        },
        (error) => {
          console.error('Google Login Error:', error);
          this.ngZone.run(() => {
            this.errorMessage = 'An error occurred during Google login.';
          });
        }
      );
    } else {
      console.error("No credential received from Google");
      this.errorMessage = 'Failed to authenticate with Google.';
    }
  }

  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  // Add this new method for better Google script loading
  loadGoogleScript() {
    // Check if Google API is already loaded
    if (typeof google !== 'undefined') {
      console.log('Google API already loaded, rendering button');
      this.renderGoogleButton();
      return;
    }

    console.log('Loading Google API script');
    // If not loaded, create script element
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google API script loaded');
      this.renderGoogleButton();
    };
    document.body.appendChild(script);
  }

  // Add this new method to render the button
  renderGoogleButton() {
    const buttonContainer = document.getElementById('google-button-container');
    
    if (!buttonContainer) {
      console.error('Button container not found');
      return;
    }
    
    if (typeof google !== 'undefined' && google.accounts) {
      // Clear any previous button
      buttonContainer.innerHTML = '';
      
      // Initialize with your client ID
      google.accounts.id.initialize({
        client_id: '209979773198-25s0s393sceitste72jnh3583dldq8fr.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      // Render the button with enhanced styling
      google.accounts.id.renderButton(
        buttonContainer, 
        { 
          type: 'standard',
          theme: 'outline', 
          size: 'large',
          width: 280,
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'center'
        }
      );
      console.log('Google button rendered');
    } else {
      console.error('Google accounts API not available');
    }
  }
}

// Add this to make TypeScript recognize google as a global variable
declare var google: any;

declare global {
  interface Window {
    google: any;
  }
}
