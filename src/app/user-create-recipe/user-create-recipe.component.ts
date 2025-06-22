import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { AuthService } from '../auth.service';

interface Ingredient {
  id?: number;
  name: string;
}

interface Step {
  instruction: string;
  preparation: string;
}

function fractionValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: boolean} | null => {
    const value = control.value;
    if (!value) return null;
    
    if (!isNaN(value)) return null;
    
    const fractionRegex = /^(\d*\s)?(\d+\/\d+)$/;
    if (!fractionRegex.test(value)) {
      return { 'invalidFraction': true };
    }
    
    const parts = value.trim().split(' ');
    let fractionalPart = parts[parts.length - 1];
    const [numerator, denominator] = fractionalPart.split('/').map(Number);
    
    if (denominator === 0) {
      return { 'divisionByZero': true };
    }
    
    return null;
  };
}

@Component({
  selector: 'app-user-create-recipe',
  templateUrl: './user-create-recipe.component.html',
  styleUrls: ['./user-create-recipe.component.scss']
})
export class UserCreateRecipeComponent implements OnInit {
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
  currentUserId: number | null = null;
  selectedImage: File | null = null;
  imagePreviewUrl: string | ArrayBuffer | null = null;

  authError: string | null = null;
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
    this.checkAuthentication();
  }
  
  private async checkAuthentication(): Promise<void> {
    console.log('Checking authentication...');
    
    if (!this.authService.isLoggedIn()) {
      this.redirectToLogin('You must be logged in to access this page.');
      return;
    }

    this.currentUserId = this.authService.getCurrentUserId();
    console.log('Current user ID:', this.currentUserId);

    if (!this.currentUserId) {
      this.redirectToLogin('Unable to retrieve user information. Please log in again.');
      return;
    }

    await this.loadIngredients(); 
  }
  
  private redirectToLogin(errorMessage: string): void {
    this.authService.logout();
    this.router.navigate(['/login'], { 
      queryParams: { error: errorMessage } 
    });
  } 

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.submissionError = 'Invalid file type. Please select JPEG, PNG, GIF, or WebP image.';
        return;
      }
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.submissionError = 'File too large. Maximum size is 5MB.';
        return;
      }
      
      this.selectedImage = file;
      console.log('Image selected:', file.name);
      
      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
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
    this.ingredients.push(this.createIngredientFormGroup());
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
      ingredientGroup.patchValue({ 
        unit: '',
        customUnit: ''
      });
      ingredientGroup.get('unit')?.clearValidators();
      ingredientGroup.get('customUnit')?.setValidators(Validators.required);
    } else {
      this.showCustomUnitInput[index] = false;
    }
    
    const ingredientGroup = this.ingredients.at(index);
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

  private findExistingIngredient(name: string): Ingredient | undefined {
    return this.availableIngredients.find(
      ing => ing.name.toLowerCase() === name.toLowerCase()
    );
  }

  async loadIngredients(): Promise<void> {
    try {
      const response = await this.dataService.getAvailableIngredients().toPromise();
      console.log('Ingredients Response:', response);

      if (response && response.ingredients && Array.isArray(response.ingredients)) {
        this.availableIngredients = response.ingredients;
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  }
  
 // user-create-recipe.component.ts modifications

async onSubmit(): Promise<void> {
  // Validate form
  if (!this.recipeForm.valid) {
    this.markFormGroupTouched(this.recipeForm);
    return;
  }

  // Get form values
  const formValue = this.recipeForm.value;
  const formData = new FormData();
  
  // Add basic recipe info
  formData.append('name', formValue.name.trim());
  formData.append('category', formValue.category.trim());
  formData.append('description', formValue.description.trim());

  // Process ingredients
  const processedIngredients = formValue.ingredients.map((ing: any, index: number) => {
    return {
      ingredient_name: ing.ingredientName.trim(),
      amount: ing.amount,
      unit: ing.unit
    };
  });
  formData.append('recipe_ingredients', JSON.stringify(processedIngredients));

  // Process preparation steps
  const preparationSteps = formValue.steps.map((step: any, index: number) => {
    return {
      step_number: index + 1,
      instruction: step.instruction.trim(),
      preparation: step.preparation.trim()  // FIXED: Use the correct field name
    };
  });
  formData.append('preparation_steps', JSON.stringify(preparationSteps));

  // MODIFIED: Debug the image before appending
  if (this.selectedImage) {
    console.log('Image being attached:', this.selectedImage.name);
    formData.append('image', this.selectedImage, this.selectedImage.name);
    
    // Verify the image was added to FormData
    console.log('FormData contains image:', formData.has('image'));
  }

  // Create a readable object for the modal to display
  const recipePreviewData = {
    name: formValue.name.trim(),
    category: formValue.category.trim(),
    description: formValue.description.trim(),
    recipe_ingredients: processedIngredients,
    preparation_steps: preparationSteps,
    has_image: !!this.selectedImage,
    image_preview: this.imagePreviewUrl
  };

  // Store both the FormData (for submission) and the preview data (for display)
  this.preparedRecipeData = {
    formData: formData,
    previewData: recipePreviewData
  };

  this.showConfirmationModal = true;
}

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        (control as FormArray).controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            this.markFormGroupTouched(ctrl);
          } else {
            ctrl.markAsTouched();
          }
        });
      }
    });
  }
  
  private validateIngredients(): string[] {
    const errors: string[] = [];
    const ingredients = this.recipeForm.value.ingredients;
  
    const ingredientNames = ingredients.map((ing: any) => ing.ingredientName.toLowerCase().trim());
    const uniqueIngredients = new Set(ingredientNames);
  
    if (uniqueIngredients.size !== ingredientNames.length) {
      errors.push('Duplicate ingredients are not allowed');
    }
  
    ingredients.forEach((ing: any, index: number) => {
      const amount = this.fractionToDecimal(ing.amount);
      if (amount <= 0) {
        errors.push(`Ingredient ${index + 1}: Amount must be positive`);
      }
    });
  
    return errors;
  }

  fractionToDecimal(fraction: string): number {
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
  
  async handleModalConfirmation(confirmed: boolean): Promise<void> {
    this.showConfirmationModal = false;
    
    if (confirmed && this.preparedRecipeData) {
      try {
        const savedRecipe = await this.dataService.createUserRecipe(this.preparedRecipeData.formData).toPromise();
        console.log('Recipe saved successfully:', savedRecipe);
        
        const recipeResponse = typeof savedRecipe === 'string' ? JSON.parse(savedRecipe) : savedRecipe;
        
        if (recipeResponse.success) {
          this.router.navigate(['/home']);
        } else {
          this.submissionError = recipeResponse.error || 'Failed to save recipe';
        }
      } catch (error) {
        console.error('Error saving recipe:', error);
        this.submissionError = 'Failed to save recipe. Please try again.';
      }
    }
  }
}