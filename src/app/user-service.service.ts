import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
<<<<<<< HEAD
import { Observable, throwError, of } from 'rxjs';
=======
import { Observable, throwError } from 'rxjs';
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
<<<<<<< HEAD
  private apiUrl = 'https://api.foodhubrecipe.shop/';
=======
  private apiUrl = 'http://localhost/foodhub/backend_php/api/';
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

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

<<<<<<< HEAD
  // Update getUserProfile to handle profile image
  getUserProfile(): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
    
    if (!userId) {
      return of({ success: false, error: 'No user ID found' });
    }
    
    // Add authorization header
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    // Pass user_id as a query parameter
    return this.http.get<any>(`${this.apiUrl}user-profile.php?user_id=${userId}`, { headers }).pipe(
      tap(response => {
        console.log('Raw user profile response:', response);
        // If profile has an image, save it to authService
        if (response.success && response.user && response.user.profile_image) {
          this.authService.setProfileImage(response.user.profile_image);
        }
      }),
      catchError(error => {
        console.error('Error getting user profile:', error);
        return of({ success: false, error: 'Failed to load profile data' });
      })
    );
  }

  updateProfile(profileData: any): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
    
    if (!userId) {
      return of({ success: false, error: 'No user ID found' });
    }
    
=======
  getUserProfile(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}user-profile`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateProfile(profileData: any): Observable<any> {
    const token = this.authService.getToken();
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
<<<<<<< HEAD

    // Add userId to the profileData object
    const updatedData = {
      ...profileData,
      user_id: userId
    };
    
    console.log('Sending Data:', updatedData);

    // Pass user_id as a query parameter
    return this.http.put<any>(`${this.apiUrl}update-profile.php?user_id=${userId}`, updatedData, { headers })
      .pipe(
        tap(response => console.log('Response:', response)),
        catchError(error => {
          console.error('Profile update error:', error);
          return of({ success: false, error: 'Failed to update profile' });
        })
=======
  
    console.log('Sending Data:', profileData);
  
    return this.http.put<any>(`${this.apiUrl}update-profile`, profileData, { headers })
      .pipe(
        tap(response => console.log('Response:', response)),
        catchError(this.handleError)
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
      );
  }
  

  getUserRecipes(): Observable<any> {
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
<<<<<<< HEAD
    
    if (!userId || !token) {
      return of({ success: false, error: 'No user ID or authentication token available' });
    }
    
=======
    if (!userId || !token) {
      throw new Error('No user ID or authentication token available');
    }
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
<<<<<<< HEAD
    
    // Use the dedicated endpoint with user_id as query parameter
    return this.http.get<any>(`${this.apiUrl}user-recipes.php?user_id=${userId}`, { headers })
      .pipe(
        tap(response => console.log('User recipes response:', response)),
        catchError(error => {
          console.error('Error fetching user recipes:', error);
          return of({ success: false, error: 'Failed to load recipes' });
        })
      );
=======
    return this.http.get(`${this.apiUrl}user-recipes?user_id=${userId}`, { headers })
      .pipe(catchError(this.handleError.bind(this)));
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
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
<<<<<<< HEAD

// Add this method to handle profile image upload
// uploadProfileImage(userId: number, imageFile: File): Observable<any> {
//   const formData = new FormData();
//   formData.append('user_id', userId.toString());
//   formData.append('profile_image', imageFile);
  
//   const token = this.authService.getToken();
//   const headers = new HttpHeaders({
//     'Authorization': `Bearer ${token}`
//   });
  
//   return this.http.post<any>(`${this.apiUrl}profile-image.php`, formData, { 
//     headers: headers.delete('Content-Type')  // Remove Content-Type for FormData
//   }).pipe(
//     tap(response => {
//       if (response.success && response.image_path) {
//         // Update the profile image path in auth service
//         this.authService.setProfileImage(response.image_path);
//       }
//     }),
//     catchError(error => {
//       console.error('Error uploading profile image:', error);
//       return of({ success: false, error: 'Failed to upload profile image' });
//     })
//   );
// }

uploadProfileImage(userId: number, imageFile: File): Observable<any> {
  const formData = new FormData();
  formData.append('profile_image', imageFile);
  formData.append('user_id', userId.toString());
  
  return this.http.post<any>('https://api.foodhubrecipe.shop/profile-image.php', formData)
    .pipe(
      tap(response => console.log('Profile image upload response:', response)),
      catchError(error => {
        console.error('Error uploading profile image:', error);
        return throwError(() => error);
      })
    );
}

// uploadProfileImage(userId: number, imageFile: File): Observable<any> {
//   const formData = new FormData();
//   formData.append('profile_image', imageFile);
//   formData.append('user_id', userId.toString());

//   return this.http.post<any>(
//     `${this.apiUrl}profile-image.php`, 
//     formData
//   ).pipe(
//     catchError(this.handleError)
//   );
// }

    // updateRecipe(
    //   recipeId: number, 
    //   recipeData: any, 
    //   isUserRecipe: boolean, 
    //   imageFile?: File | null
    // ): Observable<any> {
    //   const token = this.authService.getToken();
    //   if (!token) {
    //     throw new Error('No authentication token available');
    //   }

    //   // Create FormData for multipart upload
    //   const formData = new FormData();
      
    //   // Append recipe data as JSON
    //   formData.append('recipeData', JSON.stringify(recipeData));
    //   formData.append('isUserRecipe', isUserRecipe.toString());

    //   // Append image if provided and not null
    //   if (imageFile) {
    //     formData.append('image', imageFile, imageFile.name);
    //   }

    //   const headers = new HttpHeaders({
    //     'Authorization': `Bearer ${token}`
    //   });

    //   return this.http.put<any>(
    //     `${this.apiUrl}update-recipe/${recipeId}`, 
    //     formData, 
    //     { 
    //       headers: headers 
    //     }
    //   ).pipe(
    //     tap(response => console.log('Update Recipe Response:', response)),
    //     catchError(error => {
    //       console.error('Update Recipe Error:', error);
    //       return throwError(error);
    //     })
    //   );
    // }

shareUserRecipe(recipeId: number): Observable<any> {
  const token = this.authService.getToken();
  const userId = this.authService.getCurrentUserId();
  
  if (!token || !userId) {
    return throwError(() => new Error('No authentication token or user ID available'));
  }
  
  // For debugging
  console.log('Sharing recipe:', recipeId);
  console.log('User ID:', userId);
  console.log('Token:', token);
  
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  
  // Ensure we're sending integers, not strings
  const payload = {
    user_id: Number(userId),
    recipe_id: Number(recipeId)
  };
  
  console.log('Sending payload:', payload);
  
  return this.http.post<any>(`${this.apiUrl}share-recipe.php`, payload, { headers })
    .pipe(
      tap(response => console.log('Share recipe response:', response)),
      catchError(error => {
        console.error('Error sharing recipe:', error);
        
        // Extract the error message if available
        let errorMessage = 'An error occurred while sharing the recipe';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
}
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  
}
