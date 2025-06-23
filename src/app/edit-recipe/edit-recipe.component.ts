import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileService } from '../user-service.service';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
<<<<<<< HEAD
import Swal from 'sweetalert2';
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

function fractionValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const value = control.value;
    if (!value) return null;
    
    if (!isNaN(value)) return null;
    
    const fractionRegex = /^(\d*\s)?(\d+\/\d+)$/;
    if (!fractionRegex.test(value)) {
      return { invalidFraction: true };
    }
    
    // Validate the fraction parts
    const parts = value.trim().split(' ');
    let fractionalPart = parts[parts.length - 1];
    const [numerator, denominator] = fractionalPart.split('/').map(Number);
    
    if (denominator === 0) {
      return { divisionByZero: true };
    }
    
    return null;
  };
}

function fractionToDecimal(fraction: string): number {
  if (!fraction || !isNaN(Number(fraction))) {
    return Number(fraction);
  }
  
  const parts = fraction.trim().split(' ');
  let wholeNumber = 0;
  let fractionalPart = parts[parts.length - 1];
  
  if (parts.length > 1) {
    wholeNumber = parseInt(parts[0]);
  }
  
  const [numerator, denominator] = fractionalPart.split('/').map(Number);
  return wholeNumber + (numerator / denominator);
}

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.scss']
})
export class EditRecipeComponent implements OnInit {
  recipeForm!: FormGroup;
  recipeId: number = 0;
  isUserRecipe: boolean = false;
  availableIngredients: any[] = [];
  measurementUnits: string[] = ['cups', 'tablespoons', 'teaspoons', 'grams', 'ounces', 'pounds', 'pieces', 'milliliters', 'liters'];
  recipeCategories: string[] = [
    'Appetizer', 'Main Course', 'Dessert', 'Salad', 'Soup', 
    'Breakfast', 'Beverage', 'Snack', 'Vegetarian', 'Vegan', 'Gluten-Free'
  ];
  showCustomUnitInput: { [key: number]: boolean } = {};
  showConfirmationModal = false;
  preparedRecipeData: any = null;
<<<<<<< HEAD
  selectedImageFile: File | null = null;
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userProfileService: UserProfileService,
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.recipeId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (isNaN(this.recipeId)) {
      console.error('Invalid recipe ID');
      this.router.navigate(['/recipes']);
      return;
    }

    this.initForm();
    this.loadIngredients();
    this.fetchRecipeDetails();
  }

  private initForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: this.fb.array([]),
      steps: this.fb.array([])
    });
  }

<<<<<<< HEAD
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
  
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed types are JPEG, PNG, GIF, and WebP.');
        return;
      }
  
      if (file.size > maxFileSize) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
  
      this.selectedImageFile = file;
    }
  }

=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  private createIngredientFormGroup(): FormGroup {
    return this.fb.group({
      ingredientName: ['', Validators.required],
      amount: ['', [Validators.required, fractionValidator()]],
      unit: ['', Validators.required],
      customUnit: [''], 
      isNewIngredient: [true]
    });
  }

  async loadIngredients(): Promise<void> {
    try {
      const response = await this.dataService.getAvailableIngredients().toPromise();
      if (response && response.ingredients && Array.isArray(response.ingredients)) {
        this.availableIngredients = response.ingredients;
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  }

  fetchRecipeDetails(): void {
    this.isUserRecipe = true;
    const userId = this.isUserRecipe ? this.authService.getCurrentUserId() || undefined : undefined;

    this.userProfileService.getRecipeById(this.recipeId, this.isUserRecipe, userId).subscribe({
      next: (response) => {
        if (response.success) {
          const recipe = response.recipe;
          
          // Populate form with recipe details
          this.recipeForm.patchValue({
            name: recipe.name,
            category: recipe.category,
            description: recipe.description
          });

          // Parse and populate ingredients
          const parsedIngredients = JSON.parse(recipe.ingredients_list || '[]');
          parsedIngredients.forEach((ing: any, index: number) => {
            const ingredientGroup = this.createIngredientFormGroup();
            
            // Determine if this is a custom unit
            const isCustomUnit = !this.measurementUnits.includes(ing.unit);
            
            ingredientGroup.patchValue({
              ingredientName: ing.ingredient_name,
              amount: ing.amount.toString(),
              unit: isCustomUnit ? 'custom' : ing.unit,
              customUnit: isCustomUnit ? ing.unit : ''
            });

            // Add custom unit handling if needed
            if (isCustomUnit) {
              this.showCustomUnitInput[index] = true;
            }

            this.ingredients.push(ingredientGroup);
          });

          // Parse and populate steps
          const parsedSteps = JSON.parse(recipe.preparation_steps || '[]');
          parsedSteps.forEach((step: any) => {
            const stepForm = this.fb.group({
              instruction: [step.instruction, Validators.required],
              preparation: [step.preparation, Validators.required]
            });
            this.steps.push(stepForm);
          });
        } else {
          console.error('Error:', response.error);
          this.router.navigate(['/recipes']);
        }
      },
      error: (err) => console.error('Error fetching recipe details:', err),
    });
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredientFormGroup());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
    delete this.showCustomUnitInput[index];
  }

  onUnitChange(index: number, event: any): void {
    const selectedValue = event.value || event.target.value;
    const ingredientGroup = this.ingredients.at(index);
    
    if (selectedValue === 'custom') {
      this.showCustomUnitInput[index] = true;
      ingredientGroup.patchValue({ 
        unit: '',
        customUnit: ''
      });
      ingredientGroup.get('unit')?.clearValidators();
      ingredientGroup.get('customUnit')?.setValidators(Validators.required);
    }
    
    ingredientGroup.get('unit')?.updateValueAndValidity();
    ingredientGroup.get('customUnit')?.updateValueAndValidity();
  }

  toggleCustomUnit(index: number): void {
    this.showCustomUnitInput[index] = false;
    const ingredientGroup = this.ingredients.at(index);
    
    ingredientGroup.patchValue({
      unit: '',
      customUnit: ''
    });
    
    ingredientGroup.get('unit')?.setValidators(Validators.required);
    ingredientGroup.get('customUnit')?.clearValidators();
    
    ingredientGroup.get('unit')?.updateValueAndValidity();
    ingredientGroup.get('customUnit')?.updateValueAndValidity();
  }

  getEffectiveUnit(index: number): string {
    const ingredientGroup = this.ingredients.at(index);
    return this.showCustomUnitInput[index] ? 
           ingredientGroup.get('customUnit')?.value : 
           ingredientGroup.get('unit')?.value;
  }

  addStep(): void {
    const stepForm = this.fb.group({
      instruction: ['', Validators.required],
      preparation: ['', Validators.required]
    });
    this.steps.push(stepForm);
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  private validateIngredients(): string[] {
    const errors: string[] = [];
    const ingredients = this.recipeForm.value.ingredients;

    // Check for duplicate ingredients
    const ingredientNames = ingredients.map((ing: any) => ing.ingredientName.toLowerCase().trim());
    const uniqueIngredients = new Set(ingredientNames);

    if (uniqueIngredients.size !== ingredientNames.length) {
      errors.push('Duplicate ingredients are not allowed');
    }

    // Validate ingredient amounts
    ingredients.forEach((ing: any, index: number) => {
      const amount = fractionToDecimal(ing.amount);
      if (amount <= 0) {
        errors.push(`Ingredient ${index + 1}: Amount must be positive`);
      }
    });

    return errors;
  }

  onSubmit(): void {
    // Mark form as touched to trigger validation display
    this.markFormGroupTouched(this.recipeForm);

    // Check form validity
    if (!this.recipeForm.valid) {
      return;
    }

    // Validate ingredients
    const ingredientErrors = this.validateIngredients();
    if (ingredientErrors.length > 0) {
      console.error('Ingredient Validation Errors:', ingredientErrors);
      return;
    }

    // Prepare recipe data
    const formValue = this.recipeForm.value;
    
    const processedIngredients = formValue.ingredients.map((ing: any, index: number) => ({
      ingredient_name: ing.ingredientName,
      amount: fractionToDecimal(ing.amount),
      unit: this.getEffectiveUnit(index),
      is_new_ingredient: true
    }));

    // Prepare recipe data object
    const recipeData = {
      name: formValue.name,
      category: formValue.category,
      description: formValue.description,
      ingredients_list: JSON.stringify(processedIngredients),
      preparation_steps: JSON.stringify(formValue.steps.map((step: any, index: number) => ({
        step_number: index + 1,
        instruction: step.instruction,
        preparation: step.preparation
      })))
    };

    // Set prepared data and show confirmation modal
    this.preparedRecipeData = recipeData;
    this.showConfirmationModal = true;
  }

  async handleModalConfirmation(confirmed: boolean): Promise<void> {
    this.showConfirmationModal = false;
<<<<<<< HEAD

    if (confirmed) {
      const result = await Swal.fire({
        title: 'Update Recipe?',
        text: 'Are you sure you want to update this recipe?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#aaa',
        confirmButtonText: 'Yes, update it!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        try {
          // Add user ID if it's a user recipe
          if (this.isUserRecipe) {
            this.preparedRecipeData.user_id = this.authService.getCurrentUserId();
          }

          this.userProfileService.updateRecipe(this.recipeId, this.preparedRecipeData, this.isUserRecipe).subscribe({
            next: (response) => {
              Swal.fire({
                icon: 'success',
                title: 'Recipe updated!',
                text: 'Your recipe was updated successfully.',
                timer: 1800,
                showConfirmButton: false
              });
              this.router.navigate(['/user-profile']);
            },
            error: (err) => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error updating recipe. Please try again.'
              });
            },
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error preparing recipe update.'
          });
        }
=======
    
    if (confirmed) {
      try {
        // Add user ID if it's a user recipe
        if (this.isUserRecipe) {
          this.preparedRecipeData.user_id = this.authService.getCurrentUserId();
        }

        // Update recipe
        this.userProfileService.updateRecipe(this.recipeId, this.preparedRecipeData, this.isUserRecipe).subscribe({
          next: (response) => {
            alert('Recipe updated successfully!');
            this.router.navigate(['/user-profile']);
          },
          error: (err) => {
            console.error('Error updating recipe:', err);
            // Optional: Add user-friendly error handling
          },
        });
      } catch (error) {
        console.error('Error preparing recipe update:', error);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
      }
    }
  }
}