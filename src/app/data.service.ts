import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, Recipe } from './parts/recipe/recipe.component';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'http://localhost/foodhub/backend_php/api/'; 

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Error handler function
  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      console.error('An error occurred:', error.error.message);
    } else {
      // Backend error
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`
      );
    }
    // Return an observable with a user-facing error message
    return throwError(() => new Error('Something went wrong. Please try again later.'));
  }

  // Get a recipe by ID
  getRecipe(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}recipe/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getRecipeView(
    recipeId: number, 
    userId?: number | null, 
    isUserRecipe?: boolean
  ): Observable<any> {
    const url = `${this.apiUrl}get-recipe`;
    let params = new HttpParams().set('id', recipeId.toString());
    
    if (userId !== undefined && userId !== null) {
      params = params.set('userId', userId.toString());
    }
  
    if (isUserRecipe !== undefined) {
      params = params.set('isUserRecipe', isUserRecipe.toString());
    }
  
    return this.http.get<any>(url, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getAllRecipes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}recipes`)
      .pipe(catchError(this.handleError));
  }

  getRecipesByIngredients(ingredients: string[]): Observable<any> {
    const params = new HttpParams().set('ingredients', JSON.stringify(ingredients));
    return this.http.get<any>(`${this.apiUrl}recipes`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get all available ingredients
  getAvailableIngredients(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ingredients`)
      .pipe(catchError(this.handleError));
  }

  // Search recipes
  searchRecipes(term: string, category?: string): Observable<any> {
    const params: any = { term };
    if (category) {
      params.category = category;
    }
    return this.http.get<any>(`${this.apiUrl}search`, { params })
      .pipe(catchError(this.handleError));
  }

  // Create a recipe
  createRecipe(recipeData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/recipe`, recipeData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update a recipe
  updateRecipe(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}update-recipe/${id}`, data)
      .pipe(catchError(this.handleError));
  }

  // Delete a recipe
  deleteRecipe(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}recipe/${id}`)
      .pipe(catchError(this.handleError));
  }

  createUserRecipe(recipeData: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    return this.http.post<any>(`${this.apiUrl}user-recipe`, recipeData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  } 
  
  getUserRecipes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user-recipes`)
      .pipe(catchError(this.handleError));
  }
  
  getUserRecipe(recipeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user-recipe/${recipeId}`)
      .pipe(catchError(this.handleError));
  }
  
  getRecipeById(recipeId: number, isUserRecipe: boolean, userId?: number): Observable<any> {
    const url = `${this.apiUrl}get-recipe/${recipeId}?isUserRecipe=${isUserRecipe}${userId ? `&userId=${userId}` : ''}`;
    return this.http.get<any>(url).pipe(
      catchError(this.handleError.bind(this))
    );
  }    
  // Add these methods to the DataService

// Update user profile
updateProfile(profileData: any): Observable<any> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.put<any>(`${this.apiUrl}updateProfile`, profileData, { headers })
    .pipe(catchError(this.handleError));
}

}
