import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(): boolean {
    // Check if logged in and has a valid user ID
    if (this.authService.isLoggedIn()) {
      const userId = this.authService.getCurrentUserId();
      if (userId) {
        return true;
      }
    }
    
    // Redirect to login if not authenticated or no user ID
    this.router.navigate(['/login'], {
      queryParams: { 
        error: 'Authentication required. Please log in.' 
      }
    });
    return false;
  }
}
