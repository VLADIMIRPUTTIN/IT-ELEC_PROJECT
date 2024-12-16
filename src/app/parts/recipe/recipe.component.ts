import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../data.service';


export interface Ingredient {
  ingredient_name: string;
  quantity: number;
  unit: string;
}

export interface PreparationStep {
  step_number: number;
  instruction: string;
  preparation: string;
}

export interface Recipe {
  id: number;
  name: string;
  category: string;
  description: string;
  ingredients_list: {
    ingredient_name: string;
    amount: number;
    unit: string;
  }[];
  preparation_steps: PreparationStep[];
  created_at: string;
  updated_at: string;
  image: string; // Add this line for the image URL
}

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  recipe?: T;
}

// Interface for /ingredients endpoint
interface IngredientsResponse {
  success: boolean;
  ingredients: {
    id: number;
    name: string;
  }[];
}

// Interface for /get-ingredients endpoint
interface DetailedIngredientsResponse {
  status: string;
  data: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }[];
}

@Component({
  selector: 'app-recipe',
  templateUrl: './recipe.component.html',
  styleUrls: ['./recipe.component.scss']
})
export class RecipeComponent implements OnInit {
ingredientPage: number = 1;
ingredientsPerPage: number = 10;
totalIngredientPages: number = 0;
  filteredRecipesForDisplay: any[] = [];
  filteredAvailableIngredientsForDisplay: string[] = [];
  isIngredientsSelected: boolean = false;
  validationMessage: string = '';  // Message to show when search is blocked
  prevIngredientPage() {
    if (this.ingredientPage > 1) {
      this.ingredientPage--;
      this.updateIngredientPagination();
    }
  

throw new Error('Method not implemented.');
}
  selectedIngredients: string[] = [];
  allRecipes: any[] = [];
  filteredRecipes: any[] = [];
  selectedRecipe: any;
  selectedRecipeId: number | null = null;
  modalVisible: boolean = false;
  availableIngredients: string[] = [];
  availableRecipesCount: number = 0;
  isLoading: boolean = false;
  error: string | null = null;
  ingredientSearchQuery: string = '';
  filteredAvailableIngredients: string[] = [];
  
  // recipes = []; // Replace with actual recipes data

  // Store full ingredient data if needed
  private ingredientsData: {
    id: number;
    name: string;
  }[] = [];

  // Pagination properties
  currentPage: number = 1;
  recipesPerPage: number = 9; // Changed from 5 to 9
  totalPages: number = 0;
   // New search properties
   searchQuery = ''; // Holds the search query
   isSearchVisible = false; // Controls search bar 
   isIngredientMenuOpen = false;
   isMobile: boolean = false;
  //  filteredAvailableIngredients: string[] = [];
   

  private apiUrl = 'http://localhost/foodhub/backend_php/api/'; // Adjust this to match your API base URL


  constructor(private http: HttpClient, private dataService: DataService) {}

  ngOnInit() {
    this.fetchIngredients();
    this.fetchAllRecipes();
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView.bind(this));
  }

  fetchIngredients() {
    this.isLoading = true;
    this.error = null;
    
    this.http.get<IngredientsResponse>(`${this.apiUrl}/ingredients`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.ingredientsData = response.ingredients;
            this.availableIngredients = response.ingredients.map(ing => ing.name);
            this.filteredAvailableIngredients = [...this.availableIngredients];
          } else {
            this.error = 'Failed to fetch ingredients';
          }
        },
        error: (error) => {
          this.error = 'Error loading ingredients. Please try again.';
          console.error('Error fetching ingredients:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  filterIngredients(searchQuery: string) {
    this.ingredientSearchQuery = searchQuery;
    if (!searchQuery) {
      this.filteredAvailableIngredients = [...this.availableIngredients];
    } else {
      this.filteredAvailableIngredients = this.availableIngredients.filter(ingredient =>
        ingredient.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    this.updateIngredientPagination();  // Update pagination whenever the ingredients are filtered

  }
  updateIngredientPagination() {
    this.totalIngredientPages = Math.ceil(this.filteredAvailableIngredients.length / this.ingredientsPerPage);
    console.log('Total Pages:', this.totalIngredientPages); // Add this line for debugging
  
    const startIndex = (this.ingredientPage - 1) * this.ingredientsPerPage;
    const endIndex = startIndex + this.ingredientsPerPage;
    this.filteredAvailableIngredientsForDisplay = this.filteredAvailableIngredients.slice(startIndex, endIndex);
  }
  updateRecipesPagination() {
    // Compute total pages based on filtered recipes
    this.totalPages = Math.ceil(this.filteredRecipes.length / this.recipesPerPage);
    
    // Get current page's recipes
    const startIndex = (this.currentPage - 1) * this.recipesPerPage;
    const endIndex = startIndex + this.recipesPerPage;
    this.filteredRecipesForDisplay = this.filteredRecipes.slice(startIndex, endIndex);
  }

  nextIngredientPage() {
    if (this.ingredientPage < this.totalIngredientPages) {
      this.ingredientPage++;
      this.updateIngredientPagination();
    }
  }


  openRecipeModal(recipeId: number): void {
    this.selectedRecipeId = recipeId;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedRecipeId = null;
  }

  // Alternative method if you need detailed ingredient data
  fetchDetailedIngredients() {
    this.http.get<DetailedIngredientsResponse>(`${this.apiUrl}/get-ingredients`)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            // Store full ingredient data
            this.ingredientsData = response.data.map(ing => ({
              id: ing.id,
              name: ing.name
            }));
            // Extract just the names for the template
            this.availableIngredients = response.data.map(ing => ing.name);
          } else {
            console.error('Failed to fetch ingredients');
          }
        },
        error: (error) => {
          console.error('Error fetching ingredients:', error);
        }
      });
  }

  // Helper method to get ingredient ID by name if needed
  getIngredientId(name: string): number | undefined {
    return this.ingredientsData.find(ing => ing.name === name)?.id;
  }

  toggleIngredient(ingredient: string) {
    const index = this.selectedIngredients.indexOf(ingredient);
    if (index === -1) {
      this.selectedIngredients.push(ingredient);
    } else {
      this.selectedIngredients.splice(index, 1);
    }
    
    // If ingredients are selected, show the validation message only when the user starts typing
    if (this.selectedIngredients.length > 0 && this.searchQuery.trim() !== '') {
      this.validationMessage = "You cannot search while ingredients are selected. Please deselect them to search.";
    } else {
      this.validationMessage = ''; // Clear message when ingredients are deselected or no search query
    }
  
    this.filterRecipes();
  }

  filterRecipes() {
    if (this.selectedIngredients.length === 0) {
      this.filteredRecipes = [...this.allRecipes];
    } else {
      // Fetch recipes from the service
      this.dataService.getRecipesByIngredients(this.selectedIngredients).subscribe({
        next: (response) => {
          if (response.success && response.recipes) {
            // Apply partial matching logic
            this.filteredRecipes = response.recipes.filter((recipe: { ingredients_list: { ingredient_name: string; }[]; }) =>
              recipe.ingredients_list.some((recipeIngredient: { ingredient_name: string; }) =>
                this.selectedIngredients.some(selectedIngredient =>
                  recipeIngredient.ingredient_name.toLowerCase().includes(selectedIngredient.toLowerCase())
                )
              )
            );
          } else {
            this.filteredRecipes = []; // Reset recipes if none match
            this.error = 'No matching recipes found';
          }
          this.updateAvailableRecipesCount();
          this.totalPages = Math.ceil(this.filteredRecipes.length / this.recipesPerPage);
          this.currentPage = 1;
        },
        error: (error) => {
          this.error = 'Error filtering recipes. Please try again.';
          console.error('Error filtering recipes:', error);
        }
      });
    }
  }
  

  fetchAllRecipes() {
    this.isLoading = true;
    this.dataService.getAllRecipes().subscribe({
      next: (response) => {
        if (response.success) {
          this.allRecipes = response.recipes;
          this.filterRecipes();
          this.totalPages = Math.ceil(this.allRecipes.length / this.recipesPerPage);
        } else {
          this.error = 'Failed to fetch recipes';
        }
      },
      error: (error) => {
        this.error = 'Error loading recipes. Please try again.';
        console.error('Error fetching recipes:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  updateAvailableRecipesCount() {
    this.availableRecipesCount = this.filteredRecipes.length;
  }
  onSearch(query: string) {
    this.searchQuery = query;
    if (!query) {
      this.filteredRecipes = [...this.allRecipes];
      this.updateAvailableRecipesCount();
      return;
    }

    this.filteredRecipes = this.allRecipes.filter(recipe =>
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.description.toLowerCase().includes(query.toLowerCase())
    );
    this.updateAvailableRecipesCount();
  }

  toggleSearchVisibility() {
    if (this.isMobile) {
      this.isSearchVisible = !this.isSearchVisible;
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.isSearchVisible = false; // Hide search bar on desktop view
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement; // Cast event.target to HTMLElement
    if (this.isMobile && !target.closest('.search-container')) {
      this.isSearchVisible = false;
    }
  }
  


  selectRecipe(recipe: Recipe) {
    this.selectedRecipeId = recipe.id;
    this.modalVisible = true;
  }

  get paginatedRecipes() {
    const startIndex = (this.currentPage - 1) * this.recipesPerPage;
    return this.filteredRecipes.slice(startIndex, startIndex + this.recipesPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateRecipesPagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateRecipesPagination();
    }
  }

  // Add these to your component class
trackByIngredient(index: number, item: string): string {
  return item;
}

trackByRecipe(index: number, item: any): number {
  return item.id; // Assuming recipes have an id property
}

// toggleLike(recipe: Recipe) {
//   recipe.isLiked = !recipe.isLiked;
//   // Optionally, you could add logic to persist the like state
// }

shareRecipe(recipe: Recipe) {
  // Implement sharing logic (could use web share API or custom modal)
  // Example:
  if (navigator.share) {
    navigator.share({
      title: recipe.name,
      text: recipe.description,
      url: window.location.href
    });
  } else {
    // Fallback for browsers that don't support web share
    // Maybe open a share modal
  }
}

checkMobileView() {
  this.isMobile = window.innerWidth <= 768;
  if (!this.isMobile) {
    this.isIngredientMenuOpen = false;
  }
}

toggleIngredientMenu() {
  if (this.isMobile) {
    this.isIngredientMenuOpen = !this.isIngredientMenuOpen;
  }
}

closeIngredientMenu() {
  if (this.isMobile) {
    this.isIngredientMenuOpen = false;
  }
}

// Get responsive list of ingredients
getResponsiveIngredientList(): string[] {
  if (this.isMobile) {
    // Limit ingredients on mobile
    return this.filteredAvailableIngredients.slice(0, 15);
  }
  return this.filteredAvailableIngredients;
}

// Clean up event listener
ngOnDestroy() {
  window.removeEventListener('resize', this.checkMobileView);
}

}