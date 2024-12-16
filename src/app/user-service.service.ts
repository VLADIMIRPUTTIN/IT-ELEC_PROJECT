import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost/foodhub/backend_php/api/';

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {}

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  getUserProfile(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}user-profile`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateProfile(profileData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  
    console.log('Sending Data:', profileData);
  
    return this.http.put<any>(`${this.apiUrl}update-profile`, profileData, { headers })
      .pipe(
        tap(response => console.log('Response:', response)),
        catchError(this.handleError)
      );
  }
  

  getUserRecipes(): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
    if (!userId || !token) {
      throw new Error('No user ID or authentication token available');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.get(`${this.apiUrl}user-recipes?user_id=${userId}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  deleteUserRecipe(recipeId: number): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
    if (!userId || !token) {
      throw new Error('No user ID or authentication token available');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.delete(`${this.apiUrl}delete-user-recipe?user_id=${userId}&recipe_id=${recipeId}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getRecipeById(recipeId: number, isUserRecipe: boolean, userId?: number): Observable<any> {
    const url = `${this.apiUrl}get-recipe-by-id?id=${recipeId}&isUserRecipe=${isUserRecipe}${userId ? `&userId=${userId}` : ''}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }  

  updateRecipe(recipeId: number, recipeData: any, isUserRecipe: boolean): Observable<any> {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token available');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.put<any>(
      `${this.apiUrl}update-recipe/${recipeId}?isUserRecipe=${isUserRecipe}`, 
      recipeData, 
      { headers }
    ).pipe(
      tap(response => console.log('Update Recipe Response:', response)),
      catchError(this.handleError.bind(this))
    );
}
  
}
