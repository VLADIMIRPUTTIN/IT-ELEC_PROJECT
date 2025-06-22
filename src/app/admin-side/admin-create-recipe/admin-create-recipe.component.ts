import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '/xampp/htdocs/FoodHub/src/app/data.service';
import { AuthService } from '/xampp/htdocs/FoodHub/src/app/auth.service'
import Swal from 'sweetalert2';
import { AbstractControl, ValidationErrors } from '@angular/forms';

interface Ingredient {
  id?: number;
  name: string;
}

interface Step {
  instruction: string;
  preparation: string;
}

function fractionValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value;
    if (!value) return null;
    
    if (!isNaN(Number(value))) return null;
    
    const fractionRegex: RegExp = /^(\d*\s)?(\d+\/\d+)$/;
    if (!fractionRegex.test(value)) {
      return { invalidFraction: true };
    }
    
    const parts: string[] = value.trim().split(' ');
    let fractionalPart: string = parts[parts.length - 1];
    const [numerator, denominator]: number[] = fractionalPart.split('/').map(Number);
    
    if (denominator === 0) {
      return { divisionByZero: true };
    }
    
    return null;
  };
}

@Component({
  selector: 'app-admin-create-recipe',
  templateUrl: './admin-create-recipe.component.html',
  styleUrls: ['./admin-create-recipe.component.scss']
})
export class AdminCreateRecipeComponent implements OnInit {
  recipeForm: FormGroup;
  availableIngredients: Ingredient[] = [];
  measurementUnits: string[] = [
    'cups', 'tablespoons', 'teaspoons', 'grams', 'ounces', 
    'pounds', 'pieces', 'milliliters', 'liters', 'custom'
  ];
  recipeCategories: string[] = [
    'Appetizer', 
    'Main Course', 
    'Dessert', 
    'Salad', 
    'Soup', 
    'Breakfast', 
    'Beverage', 
    'Snack', 
    'Vegetarian', 
    'Vegan', 
    'Gluten-Free'
  ];
  showCustomUnitInput: { [key: number]: boolean } = {};
  showConfirmationModal = false;
  preparedRecipeData: any = null;
  selectedImage: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;
  submissionError: string | null = null;

  constructor(
    private fb: FormBuilder, 
    private dataService: DataService, 
    private router: Router,
    private authService: AuthService
  ) {
    this.recipeForm = this.initForm();
  }

  ngOnInit(): void {
    this.checkAdminAuth();
    this.recipeForm = this.initForm();
    this.loadIngredients();
    
    // Add initial ingredient to start with
    this.addIngredient();
  }
  
  private checkAdminAuth(): void {
    if (!this.authService.isAdmin()) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'You need admin privileges to access this page'
      });
      this.router.navigate(['/login']);
    }
  }

  private initForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      recipeImage: [null],
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.submissionError = 'Invalid image format. Please use JPEG, PNG, GIF, or WebP.';
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.submissionError = 'Image size exceeds 5MB limit.';
        return;
      }
      
      this.selectedImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
      
      this.submissionError = null;
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

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

  addIngredient(): void {
    console.log('Adding new ingredient');
    const ingredientForm = this.createIngredientFormGroup();
    this.ingredients.push(ingredientForm);
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
    delete this.showCustomUnitInput[index];
  }

  onUnitChange(index: number, event: any): void {
    const selectedValue = event.target.value;
    if (selectedValue === 'custom') {
      this.showCustomUnitInput[index] = true;
      
      const ingredientGroup = this.ingredients.at(index);
      ingredientGroup.get('unit')?.clearValidators();
      ingredientGroup.get('customUnit')?.setValidators(Validators.required);
    } else {
      this.showCustomUnitInput[index] = false;
      
      const ingredientGroup = this.ingredients.at(index);
      ingredientGroup.get('unit')?.setValidators(Validators.required);
      ingredientGroup.get('customUnit')?.clearValidators();
    }
    
    const ingredientGroup = this.ingredients.at(index);
    ingredientGroup.get('unit')?.updateValueAndValidity();
    ingredientGroup.get('customUnit')?.updateValueAndValidity();
  }

  getEffectiveUnit(index: number): string {
    const ingredientGroup = this.ingredients.at(index);
    return ingredientGroup.get('unit')?.value === 'custom' 
      ? ingredientGroup.get('customUnit')?.value 
      : ingredientGroup.get('unit')?.value;
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

  private createStepFormGroup(): FormGroup {
    return this.fb.group({
      instruction: ['', Validators.required],
      preparation: ['', Validators.required]
    });
  }

  addStep(): void {
    this.steps.push(this.createStepFormGroup());
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  private findExistingIngredient(name: string): Ingredient | undefined {
    return this.availableIngredients.find(ing => 
      ing.name.toLowerCase() === name.toLowerCase()
    );
  }

  async loadIngredients(): Promise<void> {
    try {
      const response = await this.dataService.getAvailableIngredients().toPromise();
      this.availableIngredients = response.ingredients || [];
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      this.submissionError = 'Failed to load ingredients. Please try refreshing the page.';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.recipeForm.invalid) {
      this.markFormGroupTouched(this.recipeForm);
      return;
    }

    const validationErrors = this.validateIngredients();
    if (validationErrors.length > 0) {
      this.submissionError = validationErrors.join('\n');
      return;
    }

    // Prepare recipe data for preview
    const formData = this.recipeForm.value;
    
    interface IngredientFormData {
        ingredientName: string;
        amount: string;
        unit: string;
        customUnit: string;
        isNewIngredient: boolean;
    }

    interface RecipeIngredient {
        ingredient_name: string;
        amount: number;
        unit: string;
    }

    const recipeIngredients: RecipeIngredient[] = formData.ingredients.map((ing: IngredientFormData) => ({
        ingredient_name: ing.ingredientName,
        amount: this.fractionToDecimal(ing.amount),
        unit: ing.unit === 'custom' ? ing.customUnit : ing.unit
    }));

    const previewData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      recipe_ingredients: recipeIngredients,
      preparation_steps: formData.steps,
      has_image: !!this.selectedImage,
      image_preview: this.imagePreviewUrl
    };

    this.preparedRecipeData = {
      formData: formData,
      previewData: previewData,
      selectedImage: this.selectedImage
    };

    this.showConfirmationModal = true;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          const group = control.at(i);
          if (group instanceof FormGroup) {
            this.markFormGroupTouched(group);
          }
        }
      }
    });
  }

  private validateIngredients(): string[] {
    const errors: string[] = [];
    const ingredientNames = new Set<string>();
    
    for (let i = 0; i < this.ingredients.length; i++) {
      const ingredient = this.ingredients.at(i).value;
      const ingredientName = ingredient.ingredientName.trim().toLowerCase();
      
      if (ingredientNames.has(ingredientName)) {
        errors.push(`Duplicate ingredient: ${ingredient.ingredientName}`);
      } else {
        ingredientNames.add(ingredientName);
      }
    }
    
    return errors;
  }

  fractionToDecimal(fraction: string): number {
    if (!isNaN(Number(fraction))) {
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

  async handleModalConfirmation(confirmed: boolean): Promise<void> {
    this.showConfirmationModal = false;
    
    if (!confirmed) {
      return;
    }
    
    try {
      // Create FormData object to send to server
      const formData = new FormData();
      
      // Add recipe data as JSON
      const formValue = this.recipeForm.value;

      // Process ingredients
      const processedIngredients = formValue.ingredients.map((ing: any, index: number) => {
        return {
          ingredient_name: ing.ingredientName.trim(),
          amount: this.fractionToDecimal(ing.amount),
          unit: ing.unit === 'custom' ? ing.customUnit : ing.unit
        };
      });

      // Process preparation steps
      const preparationSteps = formValue.steps.map((step: any, index: number) => {
        return {
          step_number: index + 1,
          instruction: step.instruction.trim(),
          preparation: step.preparation.trim()
        };
      });
      
      // Create a clean recipe object
      const recipeData = {
        name: formValue.name.trim(),
        category: formValue.category.trim().toLowerCase(), // Ensure lowercase category
        description: formValue.description.trim(),
        ingredients_list: processedIngredients,
        preparation_steps: preparationSteps,
        is_admin_recipe: true, // Include this in the JSON as well
        image_domain: 'https://userirecipeimage.foodhubrecipe.shop' // Always use the same domain for consistency
      };
      
      console.log('Sending recipe data:', recipeData); // Debug log
        
      formData.append('recipeData', JSON.stringify(recipeData));
      
      // Add image if it exists
      if (this.selectedImage) {
        formData.append('image', this.selectedImage, this.selectedImage.name);
      }
      
      // Mark this as an admin recipe
      formData.append('is_admin_recipe', 'true');
      formData.append('image_domain', 'https://userirecipeimage.foodhubrecipe.shop'); // Consistently use the same domain in form data

      // Send to server
      const response = await this.dataService.createRecipe(formData).toPromise();
      
      console.log('Server response:', response); // Debug log
      
      if (response && response.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Recipe created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        // Navigate to the recipe listing page to show the new recipe
        this.router.navigate(['/recipe'], { 
          queryParams: { recipeAdded: 'success' } 
        });
      } else {
        throw new Error(response?.message || 'Failed to create recipe');
      }
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      const errorMessage = error.message || 'Failed to create recipe. Please try again.';
      
      Swal.fire({
        title: 'Error!',
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  }

  navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }

  cancelAndReturn(): void {
    this.router.navigate(['/admin']);
  }
}