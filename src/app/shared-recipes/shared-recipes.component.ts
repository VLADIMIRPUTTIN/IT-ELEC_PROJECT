import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../data.service';

@Component({
  selector: 'app-shared-recipes',
  templateUrl: './shared-recipes.component.html',
  styleUrls: ['./shared-recipes.component.scss']
})
export class SharedRecipesComponent implements OnInit {
  sharedRecipes: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSharedRecipes();
  }

  loadSharedRecipes() {
    this.isLoading = true;
    this.dataService.getSharedRecipes().subscribe(
      (response) => {
        this.isLoading = false;
        if (response.success) {
          this.sharedRecipes = response.recipes;
        } else {
          this.errorMessage = response.error || 'Failed to load shared recipes';
        }
      },
      (error) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while loading shared recipes';
        console.error('Error loading shared recipes:', error);
      }
    );
  }

  viewRecipe(recipeId: number) {
    // Navigate with extra state to indicate this is a shared recipe
    this.router.navigate(['/view-shared-recipe', recipeId], { 
      state: { isSharedRecipe: true }
    });
  }

  getRecipeImage(recipe: any): string {
    // If no image provided
    if (!recipe.image) {
      return 'assets/images/default-recipe.jpg';
    }
    
    // If image is base64 data
    if (recipe.image_data) {
      return `data:image/jpeg;base64,${recipe.image_data}`;
    }
    
    // If full URL from database
    if (recipe.image.startsWith('http://') || recipe.image.startsWith('https://')) {
      return recipe.image;
    }
    
    // For shared recipes, always use this domain
    return `https://userirecipeimage.foodhubrecipe.shop/${recipe.image}`;
  }

  onImgError(event: Event) {
    const img = event.target as HTMLImageElement;
    const currentSrc = img.src;
    
    // Don't enter infinite loop if already using fallback
    if (currentSrc.includes('default-recipe.jpg')) {
      return;
    }
    
    // Extract the image filename
    const imageName = currentSrc.split('/').pop();
    console.log('Image failed to load:', currentSrc);
    
    // Check which domain the failed image was from
    if (currentSrc.includes('foodimage.foodhubrecipe.shop')) {
      // Try user recipe image domain as fallback for system images
      console.log('Trying user image domain for system image:', imageName);
      img.onerror = () => {
        // If that fails, try the API proxy
        img.onerror = () => {
          // If API proxy fails too, use default
          img.onerror = null;
          img.src = 'assets/images/default-recipe.jpg';
        };
        img.src = `https://api.foodhubrecipe.shop/images/recipes/${imageName}`;
      };
      img.src = `https://userirecipeimage.foodhubrecipe.shop/${imageName}`;
    } else {
      // For other domains, try the API proxy directly
      img.onerror = () => {
        // If second attempt fails, use default
        img.onerror = null;
        img.src = 'assets/images/default-recipe.jpg';
      };
      
      // Use the right subfolder based on image source
      const imageFolder = currentSrc.includes('userirecipeimage') ? 'user_recipes' : 'recipes';
      img.src = `https://api.foodhubrecipe.shop/images/${imageFolder}/${imageName}`;
    }
  }
}