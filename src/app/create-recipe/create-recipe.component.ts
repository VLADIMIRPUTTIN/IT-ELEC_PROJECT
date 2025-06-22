import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

interface Ingredient {
  id?: number;
  name: string;
}

interface Step {
  instruction: string;
  preparation: string;
}

interface FractionValidationErrors {
  invalidFraction?: boolean;
  divisionByZero?: boolean;
}

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

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.scss']
})
export class CreateRecipeComponent implements OnInit {
  recipeForm!: FormGroup;
  availableIngredients: Ingredient[] = [];
  measurementUnits: string[] = ['cups', 'tablespoons', 'teaspoons', 'grams', 'ounces', 'pounds', 'pieces', 'milliliters', 'liters'];
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

  constructor(private fb: FormBuilder, private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.initForm();
    this.loadIngredients();
  }

  private initForm(): void {
    this.recipeForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
      image: [null]
    });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB
  
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        return;
      }
  
      if (file.size > maxFileSize) {
        alert('Image size exceeds 5MB. Please choose a smaller image.');
        return;
      }
  
      this.selectedImage = file;
  
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        // Use type assertion to handle potential null
        this.imagePreviewUrl = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
    // Clear file input
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
    this.ingredients.push(this.createIngredientFormGroup());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
    delete this.showCustomUnitInput[index];
  }

  onUnitChange(index: number, event: any): void {
    const selectedValue = event.value || event.target.value;
    if (selectedValue === 'custom') {
      this.showCustomUnitInput[index] = true;
      const ingredientGroup = this.ingredients.at(index);
      ingredientGroup.patchValue({ 
        unit: '',
        customUnit: ''
      });
      ingredientGroup.get('unit')?.clearValidators();
      ingredientGroup.get('customUnit')?.setValidators(Validators.required);
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
      if (Array.isArray(response)) {
        this.availableIngredients = response;
      } else {
        console.error('Unexpected response format:', response);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    }
  }
  
  async onSubmit(): Promise<void> {
    // Mark form as touched to trigger validation display
    this.markFormGroupTouched(this.recipeForm);
  
    // Check form validity
    if (!this.recipeForm.valid) {
      return;
    }
  
    // Validate ingredients
    const ingredientErrors = this.validateIngredients();
    if (ingredientErrors.length > 0) {
      // You might want to display these errors to the user
      console.error('Ingredient Validation Errors:', ingredientErrors);
      return;
    }
  
    // Prepare recipe data
    const formValue = this.recipeForm.value;
    
    const processedIngredients = formValue.ingredients.map((ing: any, index: number) => {
      const existingIngredient = this.findExistingIngredient(ing.ingredientName);
      
      return {
        ingredient_name: ing.ingredientName,
        amount: this.fractionToDecimal(ing.amount),
        unit: this.getEffectiveUnit(index),
        is_new_ingredient: !existingIngredient
      };
    });
  
    // Prepare recipe data object
    const formData = new FormData();
    formData.append('name', formValue.name);
    formData.append('category', formValue.category);
    formData.append('description', formValue.description);
    formData.append('recipe_ingredients', JSON.stringify(processedIngredients));
    formData.append('preparation_steps', JSON.stringify(
      formValue.steps.map((step: any, index: number) => ({
        step_number: index + 1,
        instruction: step.instruction,
        preparation: step.preparation
      }))
    ));

    // Append image if selected
    if (this.selectedImage) {
      formData.append('image', this.selectedImage, this.selectedImage.name);
    }
  
    // Set prepared data and show confirmation modal
    this.preparedRecipeData = formData;
    this.showConfirmationModal = true;
  }
  
  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
  
  // Custom ingredient validation method
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
  
  prepareRecipeData() {
    const formValue = this.recipeForm.value;
    
    const processedIngredients = formValue.ingredients.map((ing: any, index: number) => ({
      ingredient_name: ing.ingredientName,
      amount: this.fractionToDecimal(ing.amount),
      unit: this.getEffectiveUnit(index),
      is_new_ingredient: true
    }));

    return {
      name: formValue.name,
      category: formValue.category,
      description: formValue.description,
      preparation_steps: formValue.steps.map((step: any, index: number) => ({
        step_number: index + 1,
        instruction: step.instruction,
        preparation: step.preparation
      })),
      recipe_ingredients: processedIngredients
    };
  }
  
  async handleModalConfirmation(confirmed: boolean): Promise<void> {
    this.showConfirmationModal = false;
    
    if (confirmed) {
      try {
        // Add admin flag to FormData
        if (this.preparedRecipeData instanceof FormData) {
          this.preparedRecipeData.append('is_admin_recipe', 'true');
        }
        
        const savedRecipe = await this.dataService.createRecipe(this.preparedRecipeData).toPromise();
        console.log('Full saved recipe response:', savedRecipe);
        
        // Parse the response if it's a JSON string
        const recipeResponse = typeof savedRecipe === 'string' ? JSON.parse(savedRecipe) : savedRecipe;
        
        const recipeId = recipeResponse.recipe_id || recipeResponse.id;
        
        if (recipeId) {
          // Navigate back to admin with success parameter
          this.router.navigate(['/admin'], { 
            queryParams: { 
              recipeCreated: 'true' 
            } 
          });
        } else {
          console.error('No recipe ID found in response:', recipeResponse);
        }
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    }
  }
}
