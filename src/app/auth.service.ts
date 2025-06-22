import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Fix the API URL to use the routes.php endpoint
  private apiUrl = 'https://api.foodhubrecipe.shop/'; // Base URL
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  // Register user - Use router
  register(email: string, username: string, password: string): Observable<any> {
    console.log('Registering user with:', { email, username });
    
    return this.http.post(
      `${this.apiUrl}/index.php?request=register`, // Use the router with request parameter
      { email, username, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  } 

  saveAuthDetails(token: string, userId: number, profileImage?: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', userId.toString());
    
    if (profileImage) {
      localStorage.setItem('profile_image', profileImage);
    }
  }


  // Login user - Use router
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/index.php?request=login`, { email, password })
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response && response.success) {
            const userData = {
              id: response.user_id,
              email: email,
              auth_token: response.token,
              profile_image: response.profile_image
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user_id', response.user_id.toString());
            
            if (response.profile_image) {
              localStorage.setItem('profile_image', response.profile_image);
            }
            
            this.currentUserSubject.next(userData);
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  } 

  // Admin login method
  adminLogin(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}admin-login`, body).pipe(
      map((response) => {
        // Handle both string and object responses
        const parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;

        console.log('Parsed Admin Login Response:', parsedResponse);

        // Check for successful login
        if (parsedResponse.success) {
          const token = parsedResponse.token;
          const userId = parsedResponse.user_id;

          if (token && userId) {
            this.saveAdminAuthDetails(token, userId);
            return parsedResponse;
          } else {
            throw new Error('Missing token or user ID in admin login response');
          }
        }

        return parsedResponse;
      }),
      catchError((error) => {
        console.error('Admin login error:', error);
        return throwError(error);
      })
    );
  }

  // Update the adminRegister method
  adminRegister(email: string, username: string, password: string): Observable<any> {
    const body = { email, username, password };
    
    // Use the dedicated admin-register endpoint
    return this.http.post<any>(`${this.apiUrl}/admin-register.php`, body).pipe(
      map(response => {
        console.log('Admin registration response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Admin registration error:', error);
        
        if (error.status === 200 && error.error && typeof error.error === 'string') {
          // Try to extract JSON from response with non-JSON content
          try {
            const jsonStart = error.error.indexOf('{');
            const jsonEnd = error.error.lastIndexOf('}') + 1;
            
            if (jsonStart >= 0 && jsonEnd > 0) {
              const jsonStr = error.error.substring(jsonStart, jsonEnd);
              return of(JSON.parse(jsonStr));
            }
          } catch (e) {
            console.error('Failed to parse response:', e);
          }
        }
        
        return throwError('Registration failed due to server error. Please try again later.');
      })
    );
  }

  // Save admin auth details
  saveAdminAuthDetails(token: string, userId: number): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', userId.toString());
    localStorage.setItem('is_admin', 'true');
  }

  // Check if current user is admin
  isAdmin(): boolean {
    return localStorage.getItem('is_admin') === 'true';
  }

  private getUserIdFromLocalStorage(): number | null {
    return this.getCurrentUserId();
  }

  // Save token to localStorage
  saveToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  // Get the stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
 

  // New method to get current user ID
  getCurrentUserId(): number | null {
    const userId = localStorage.getItem('user_id');
    return userId ? Number(userId) : null;
  }
  //   try {
  //     // First, try parsing as JSON
  //     const tokenData = JSON.parse(token);
      
  //     // Check if the token contains a user ID
  //     if (tokenData && (tokenData.userId || tokenData.id)) {
  //       return tokenData.userId || tokenData.id;
  //     }
  
  //     console.log('No user ID found in token');
  //     return null;
  //   } catch (error) {
  //     console.error('Error parsing token:', error);
  //     return null;
  //   }
  // }

   // New method to validate token with backend
   validateToken(): Observable<boolean> {
    const token = this.getToken();
    const userId = this.getCurrentUserId();

    if (!token || !userId) {
      return of(false);
    }

    return this.http.post<any>(`${this.apiUrl}validate-token`, { token, user_id: userId }).pipe(
      map(response => {
        // Validate token with backend
        if (response && response.valid) {
          return true;
        }
        this.logout();
        return false;
      }),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_admin');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Add this method to help with debugging
  getCurrentUserIdDebug(): any {
    const token = localStorage.getItem('auth_token');  // Changed from 'token' to 'auth_token'
    console.log('Current auth_token:', token);
    
    const userId = localStorage.getItem('user_id');
    console.log('Current user_id from localStorage:', userId);
    
    try {
      const parsedUserId = this.getCurrentUserId();
      console.log('Parsed user ID:', parsedUserId);
      return parsedUserId;
    } catch (e) {
      console.error('Error parsing token:', e);
      return null;
    }
  }

  // Add these methods to manage profile image

  // Get the profile image path
  getProfileImage(): string | null {
    const profileImage = localStorage.getItem('profile_image');
    return profileImage;
  }

  // Set the profile image path
  setProfileImage(imagePath: string): void {
    if (imagePath) {
      console.log('Setting profile image in localStorage:', imagePath);
      localStorage.setItem('profile_image', imagePath);
      
      // Store the timestamp of when the image was last updated
      localStorage.setItem('profile_image_updated', Date.now().toString());
      
      // Add a small delay before dispatching the event
      setTimeout(() => {
        // Dispatch an event to notify components that the profile has been updated
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        console.log('profileUpdated event dispatched from AuthService');
      }, 100);
    }
  }

  // FIXED: Google login with correct path
  loginWithGoogle(idToken: string): Observable<any> {
    // Fix path by removing 'backend_php/' segment
    return this.http.post<any>(`https://api.foodhubrecipe.shop/google-login.php`, { idToken })
      .pipe(
        tap(response => {
          console.log("Google login response:", response);
          if (response && response.success && response.data) {
            // Store the complete user object
            const userData = {
              id: response.data.id,
              username: response.data.username,
              email: response.data.email,
              auth_token: response.data.auth_token,
              profile_image: response.data.profile_image
            };
            
            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('auth_token', response.data.auth_token);
            localStorage.setItem('user_id', response.data.id.toString());
            
            // Make sure profile image is stored
            if (response.data.profile_image) {
              localStorage.setItem('profile_image', response.data.profile_image);
              console.log('Stored profile image:', response.data.profile_image);
            }
            
            this.currentUserSubject.next(userData);
          }
        }),
        catchError(error => {
          console.error('Google login error:', error);
          return throwError(() => error);
        })
      );
  }

  // Add this method to the AuthService class

  // Get a hash of the profile image to detect changes
  getProfileImageHash(): string | null {
    const profileImage = this.getProfileImage();
    
    if (!profileImage) {
      return null;
    }
    
    // Create a simple hash by combining the image path with a timestamp
    // This ensures we only update when the actual image changes
    const timestamp = localStorage.getItem('profile_image_updated') || Date.now().toString();
    
    return btoa(profileImage + timestamp);
  }

}