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

  // private apiUrl = 'http://localhost/Foodhub/backend_php/api/';
  private apiUrl = 'https://api.foodhubrecipe.shop/';

  constructor(private http: HttpClient, private authService: AuthService) { }

  // Error handler function
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error details:', error); // Log the full error
    if (error.error instanceof ErrorEvent) {
      console.error('Client-side error:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was:`, error.error);
    }
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
    // Get authentication info
    const token = this.authService.getToken();
    
    if (!token) {
      return throwError(() => new Error('Authentication required'));
    }
    
    // Set up authorization headers
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Log what's being sent to the server for debugging
    console.log('Sending recipe data to server:');
    recipeData.forEach((value, key) => {
      console.log(`${key}: ${value instanceof Blob ? 'File data' : value}`);
    });
    
    // Make the API call
    return this.http.post<any>(`${this.apiUrl}recipe`, recipeData, {
      headers: headers
    }).pipe(
      map(response => {
        console.log('Recipe creation response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Recipe creation error:', error);
        
        // Enhance error message if possible
        let errorMessage = 'Failed to create recipe';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
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

  createUserRecipe(recipeData: FormData): Observable<any> {
    const token = this.authService.getToken();
    const userId = this.authService.getCurrentUserId();
    
    // Make sure user ID is included in the FormData
    if (userId && !recipeData.has('user_id')) {
      recipeData.append('user_id', userId.toString());
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    
    // Show what we're sending (for debugging)
    console.log('Sending user ID:', userId);
    
    return this.http.post<any>(`${this.apiUrl}user-recipe.php`, recipeData, { 
      headers: headers.delete('Content-Type')
    }).pipe(
      map(response => {
        console.log('Recipe creation response:', response);
        return response;
      }),
      catchError(error => {
        console.error('Recipe creation error details:', error);
        
        // Try to extract JSON from error response if it contains both HTML and JSON
        if (typeof error.error === 'string' && error.error.includes('{')) {
          const jsonStart = error.error.indexOf('{');
          const jsonEnd = error.error.lastIndexOf('}') + 1;
          if (jsonStart >= 0 && jsonEnd > 0) {
            try {
              const jsonStr = error.error.substring(jsonStart, jsonEnd);
              return throwError(() => JSON.parse(jsonStr));
            } catch (e) {
              // If JSON extraction fails, continue with normal error handling
            }
          }
        }
        
        return this.handleError(error);
      })
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

// In your data.service.ts or a similar service file
addToFavorites(recipeId: number, isUserRecipe: boolean = false): Observable<any> {
  const token = this.authService.getToken();
  const userId = this.authService.getCurrentUserId();
  
  if (!token || !userId) {
    return throwError(() => new Error('User not authenticated'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.post<any>(`${this.apiUrl}add-favorite`, {
    userId,
    recipeId,
    isUserRecipe
  }, { headers });
}

removeFromFavorites(recipeId: number, isUserRecipe: boolean = false): Observable<any> {
  const token = this.authService.getToken();
  const userId = this.authService.getCurrentUserId();

  if (!token || !userId) {
    return throwError(() => new Error('User not authenticated'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }); 

  const params = new HttpParams()
    .set('recipeId', recipeId.toString())
    .set('isUserRecipe', isUserRecipe.toString());

  return this.http.delete<any>(`${this.apiUrl}remove-favorite`, { headers, params })
    .pipe(catchError(this.handleError));
}

shareRecipe(recipeId: number, isUserRecipe: boolean = false): Observable<any> {
  const token = this.authService.getToken();
  const userId = this.authService.getCurrentUserId();
  
  if (!token || !userId) {
    return throwError(() => new Error('User not authenticated'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.post<any>(`${this.apiUrl}share-recipe`, {
    userId,
    recipeId,
    isUserRecipe
  }, { headers });
}

getUserFavorites(): Observable<any> {
  const token = this.authService.getToken();
  const userId = this.authService.getCurrentUserId();
  console.log('Fetching favorites for userId:', userId); // Debug log
  if (!token || !userId) {
    return throwError(() => new Error('User not authenticated'));
  }

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.get<any>(`${this.apiUrl}user-favorites`, { headers })
    .pipe(catchError(this.handleError));
}

rateRecipe(recipeId: number, rating: number): Observable<any> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  return this.http.post<any>(`${this.apiUrl}rate-recipe`, { recipeId, rating }, { headers });
}

getRecipeRating(recipeId: number): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}recipe-rating`, { params: { id: recipeId } });
}

getSharedRecipes(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}shared-recipes.php`)
    .pipe(catchError(this.handleError));
}

// shareRecipe(recipeId: number, isUserRecipe: boolean = false): Observable<{success: boolean, message: string, share_id?: number}> {
//   return this.http.post<{success: boolean, message: string, share_id?: number}>(
//     `${this.apiUrl}share-recipe`, 
//     { 
//       recipeId, 
//       isUserRecipe 
//     }
//   );
// }

// Add this to your data.service.ts file
getSharedRecipeById(recipeId: number): Observable<any> {
  // Use HttpParams for better parameter handling
  const params = new HttpParams()
    .set('id', recipeId.toString());
  
  // Make URL consistent with other endpoints (no leading slash)
  return this.http.get<any>(`${this.apiUrl}shared_recipe.php`, { params })
    .pipe(
      map(response => {
        console.log('Shared recipe response:', response);
        
        // Process the image URL if present
        if (response.success && response.recipe) {
          // Add a flag to identify this as a shared recipe explicitly
          response.recipe.isSharedRecipe = true;
          
          // Store original image name without domain
          if (response.recipe.image && !response.recipe.image.startsWith('http')) {
            // Keep the original image name in a separate property
            response.recipe.image_filename = response.recipe.image;
          }
        }
        
        return response;
      }),
      catchError(error => {
        console.error('Error fetching shared recipe:', error);
        return this.handleError(error);
      })
    );
}

}
