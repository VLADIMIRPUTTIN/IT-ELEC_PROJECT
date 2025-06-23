// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Observable, throwError } from 'rxjs';
// import { catchError, finalize } from 'rxjs/operators';
// import { HttpClient } from '@angular/common/http';
// import { DataService } from '../data.service';

// interface Ingredient {
//   amount: number;
//   unit: string;
//   ingredient_name: string;
// }

// interface PreparationStep {
//   step_number: number;
//   instruction: string;
//   preparation: string;
// }

// interface Recipe {
//   id: number;
//   name: string;
//   category: string;
//   description: string;
//   ingredients_list: Ingredient[];
//   preparation_steps: PreparationStep[];
//   created_at: string;
//   updated_at: string;
// }

// @Component({
//   selector: 'app-recipe-view',
//   templateUrl: './recipe-view.component.html',
//   styleUrls: ['./recipe-view.component.scss']
// })
// export class RecipeViewComponent implements OnInit {
//   recipe: Recipe | null = null;
//   loading: boolean = true;
//   error: string | null = null;
//   isUserRecipe?: boolean

//   constructor(
//     private route: ActivatedRoute,
//     private http: HttpClient,
//     private dataService: DataService,
//     private router: Router, 
//   ) {}

//   // ngOnInit() {
//   //   const recipeId = this.route.snapshot.paramMap.get('id');
//   //   const isUserRecipe = this.route.snapshot.paramMap.get('type') === 'user';

//   //   if (recipeId) {
//   //     this.fetchRecipe(+recipeId, isUserRecipe);
//   //   } else {
//   //     this.error = 'Invalid recipe ID. Please check the URL and try again.';
//   //     this.loading = false;
//   //   }
//   // }

//   // fetchRecipe(recipeId: number, isUserRecipe: boolean) {
//   //   console.log(`Fetching recipe: ID ${recipeId}, User Recipe: ${isUserRecipe}`);
    
//   //   // this.dataService.getUserRecipe(recipeId, null, isUserRecipe)
//   //     .pipe(
//   //       finalize(() => this.loading = false)
//   //     )
//   //     .subscribe({
//   //       next: (response) => {
//   //         console.log('Received response:', response);
          
//   //         if (response && response.success) {
//   //           this.recipe = response.recipe;
//   //           console.log('Recipe loaded successfully:', this.recipe);
//   //         } else {
//   //           const errorMessage = response?.error || 'Failed to fetch recipe';
//   //           console.error('API Error:', errorMessage);
//   //           this.error = errorMessage;
//   //         }
//   //       },
//   //       error: (error) => {
//   //         console.error('Full error details:', error);
//   //         this.error = error.message || 'Failed to fetch recipe. Please try again later.';
//   //       }
//   //     });
//   // }

//   handleHttpError(error: any) {
//     if (error.status === 404) {
//       this.error = 'Recipe not found. Please check the recipe ID and try again.';
//     } else if (error.status === 403) {
//       this.error = 'You do not have permission to view this recipe.';
//     } else if (error.status === 500) {
//       this.error = 'A server error occurred. Please try again later.';
//     } else {
//       this.error = `An error occurred: ${error.message || 'Unknown error'}`;
//     }
//     console.error('HTTP Error:', error);
//   }

//   formatAmount(amount: number): string {
//     const fractions: { decimal: number; display: string; }[] = [
//       { decimal: 0.25, display: '¼' },
//       { decimal: 0.33, display: '⅓' },
//       { decimal: 0.5, display: '½' },
//       { decimal: 0.66, display: '⅔' },
//       { decimal: 0.75, display: '¾' }
//     ];

//     const matchedFraction = fractions.find(f => Math.abs(amount - f.decimal) < 0.01);
//     return matchedFraction ? matchedFraction.display : amount.toString();
//   }
//   viewRecipe(recipeId: number) {
//     this.router.navigate(['/recipe', recipeId]);
// }
// }
