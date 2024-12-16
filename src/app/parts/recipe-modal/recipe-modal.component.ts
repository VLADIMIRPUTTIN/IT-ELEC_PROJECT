// recipe-modal.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { DataService } from '../../data.service';
import { Recipe } from '../recipe/recipe.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-modal',
  templateUrl: './recipe-modal.component.html',
  styleUrls: ['./recipe-modal.component.scss']
})
export class RecipeModalComponent implements OnChanges {
  @Input() recipeId: number | null = null;
  @Input() visible: boolean = false;
  @Input() isUserRecipe: boolean = false; 
  @Output() close = new EventEmitter<void>();
  
  recipe: Recipe | null = null;
  loading: boolean = false;
  error: string | null = null;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.visible && this.recipeId) {
      this.loadRecipe();
    }
  }

  loadRecipe(): void {
    if (!this.recipeId) return;
    
    this.loading = true;
    this.error = null;
    
    this.dataService.getRecipe(this.recipeId).subscribe({
      next: (response: any) => {
        if (response && response.success && response.recipe) {
          this.recipe = response.recipe;
        } else {
          this.error = 'Recipe not found';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load recipe';
        this.loading = false;
      }
    });
  }

  closeModal(): void {
    this.recipe = null;
    this.close.emit();
  }

  // Helper method to convert decimal to fraction
  formatAmount(amount: number): string {
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

    // Handle whole numbers
    if (Number.isInteger(amount)) {
      return amount.toString();
    }

    // Check for common fractions
    const decimal = amount % 1;
    const whole = Math.floor(amount);
    const roundedDecimal = Math.round(decimal * 100) / 100;

    if (commonFractions[roundedDecimal]) {
      return whole ? `${whole} ${commonFractions[roundedDecimal]}` : commonFractions[roundedDecimal];
    }

    // Return decimal if no fraction match
    return amount.toString();
  }

  viewFullRecipe(): void {
    if (this.recipe && this.recipeId) {
      this.closeModal();
      const route = this.isUserRecipe ? '/view-user-recipe' : '/view-recipe';
      this.router.navigate([route, this.recipeId]);
    }
  }

}