import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost/foodhub/backend_php/api/'; // Adjust with your API path

  constructor(private http: HttpClient) { }

  // Register user
  register(email: string, username: string, password: string): Observable<any> {
    const body = { email, username, password };
    return this.http.post<any>(`${this.apiUrl}register`, body);
  } 

  saveAuthDetails(token: string, userId: number): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_id', userId.toString());
  }


  // Login user
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post<any>(`${this.apiUrl}login`, body).pipe(
      map((response) => {
        // Handle both string and object responses
        const parsedResponse = typeof response === 'string' 
          ? JSON.parse(response) 
          : response;

        console.log('Parsed Login Response:', parsedResponse);

        // Check for successful login
        if (parsedResponse.success) {
          const token = parsedResponse.token;
          const userId = parsedResponse.user_id;

          if (token && userId) {
            this.saveAuthDetails(token, userId);
            return parsedResponse;
          } else {
            throw new Error('Missing token or user ID in login response');
          }
        }

        return parsedResponse;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(error);
      })
    );
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
    const token = localStorage.getItem('auth_token');
    return !!token;
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
  }

}