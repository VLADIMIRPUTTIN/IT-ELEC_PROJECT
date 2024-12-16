// view-recipe.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
// import { Recipe } from '../parts/recipe/recipe.component';

export interface Recipe {
  name: string;
  category: string;
  created_at: string;
  description: string;
  ingredients_list: Ingredient[]; // Explicitly typed as an array of Ingredients
  preparation_steps: any[]; // Add other necessary properties
  image?: string;
}

export interface Ingredient {
  ingredient_name: string;
  amount: number | string; // Allow both number and string
  unit: string;
  is_new_ingredient?: boolean;
}

@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.component.html',
  styleUrls: ['./view-recipe.component.scss']
})
export class ViewRecipeComponent implements OnInit {
  recipe: Recipe | null = null;
  loading: boolean = false;
  error: string | null = null;
  isUserRecipe: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const recipeId = +params['id'];
      // Check if this is a user recipe from route parameters
      this.isUserRecipe = this.route.snapshot.data['isUserRecipe'] || false;
      
      if (recipeId) {
        this.loadRecipe(recipeId);
      }
    });
  }

  loadRecipe(recipeId: number): void {
    this.loading = true;
    this.error = null;
  
    const request = this.isUserRecipe ? 
      this.dataService.getRecipeView(recipeId, this.authService.getCurrentUserId(), true) :
      this.dataService.getRecipe(recipeId);
  
    request.subscribe({
      next: (response) => {
        if (response && response.success && response.recipe) {
          // Parse ingredients_list if it's a string
          let ingredientsList = [];
          if (typeof response.recipe.ingredients_list === 'string') {
            try {
              ingredientsList = JSON.parse(response.recipe.ingredients_list).map((ingredient: any) => ({
                ingredient_name: ingredient.ingredient_name || ingredient.name,
                amount: ingredient.amount || ingredient.quantity,
                unit: ingredient.unit
              }));
            } catch (error) {
              console.error('Error parsing ingredients list:', error);
              ingredientsList = [];
            }
          } else if (Array.isArray(response.recipe.ingredients_list)) {
            ingredientsList = response.recipe.ingredients_list;
          }
  
          // Parse preparation_steps if it's a string
          let preparationSteps = [];
          if (typeof response.recipe.preparation_steps === 'string') {
            try {
              preparationSteps = JSON.parse(response.recipe.preparation_steps).map((step: any, index: number) => ({
                step_number: step.step_number || (index + 1),
                instruction: step.instruction,
                preparation: step.preparation || ''
              }));
            } catch (error) {
              console.error('Error parsing preparation steps:', error);
              preparationSteps = [];
            }
          } else if (Array.isArray(response.recipe.preparation_steps)) {
            preparationSteps = response.recipe.preparation_steps;
          }
  
          // Handle image data from base64 or URL
          let imageUrl = '';
          if (response.recipe.image_data) {
            // If image_data is base64 encoded
            imageUrl = `data:image/jpeg;base64,${response.recipe.image_data}`;
          } else if (response.recipe.image) {
            // If image is a filename, construct full URL
            imageUrl = `http://localhost/FoodHub/src/assets/img/${response.recipe.image}`;
          }
  
          this.recipe = {
            ...response.recipe,
            ingredients_list: ingredientsList,
            preparation_steps: preparationSteps,
            image: imageUrl // Include the processed image URL or base64 data
          };
        } else {
          this.error = 'Recipe not found';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load recipe';
        this.loading = false;
        console.error('Error loading recipe:', error);
      }
    });
  }

  formatAmount(amount: number | string): string {
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

    if (isNaN(numAmount)) return amount.toString();

    const commonFractions: { [key: string]: string } = {
      0.25: '¼',
      0.5: '½',
      0.75: '¾',
      0.33: '⅓',
      0.67: '⅔',
      0.125: '⅛',
      0.375: '⅜',
      0.625: '⅝',
      0.875: '⅞'
    };

    if (Number.isInteger(numAmount)) {
      return numAmount.toString();
    }

    const decimal = numAmount % 1;
    const whole = Math.floor(numAmount);
    const roundedDecimal = Math.round(decimal * 100) / 100;

    if (commonFractions[roundedDecimal]) {
      return whole ? `${whole} ${commonFractions[roundedDecimal]}` : commonFractions[roundedDecimal];
    }

    return numAmount.toString();
  }

  goBack(): void {
    this.router.navigate(['/recipe']);
  }
}