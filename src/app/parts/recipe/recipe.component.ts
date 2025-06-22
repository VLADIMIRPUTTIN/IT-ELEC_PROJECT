import { Component, HostListener, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
// Make sure to import HammerManager if you haven't already
import * as Hammer from 'hammerjs';
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

export interface Favorite {
  recipe_id: number;
  // Add other properties as needed
}

interface ShareRecipeResponse {
  success: boolean;
  message: string;
  share_id?: number;
  error?: string; // Add this optional error property
}

interface FavoritesResponse {
  success: boolean;
  favorites?: Favorite[]; // Use the existing Favorite interface
  error?: string; // Add an optional error property
  message?: string; // Sometimes APIs use 'message' instead of 'error'
}

interface FavoriteToggleResponse {
  success: boolean;
  message: string; // Since the type shows a 'message' property exists
}

interface NotificationState {
  show: boolean;
  message: string;
  type: string;
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
export class RecipeComponent implements OnInit, AfterViewInit {
  globalNotification: { show: boolean; message: string; type: 'success' | 'error' } = {
    show: false,
    message: '',
    type: 'success'
  };
  notificationTimer: any = null;
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
  recipesPerPage: number = 8; // Changed from 5 to 9
  totalPages: number = 0;
   // New search properties
   searchQuery = ''; // Holds the search query
   isSearchVisible = false; // Controls search bar 
   isIngredientMenuOpen = false;
   isMobile: boolean = false;
  //  filteredAvailableIngredients: string[] = [];
  favoriteRecipes: Favorite[] = [];
   
  recipeCategories: string[] = ['appetizer', 'breakfast', 'main Course', 'dessert', 'dinner',]; // Add your categories here
  isCategoryDropdownOpen: boolean = false;
  selectedCategory: string = 'All'; // Default category

  private apiUrl = 'https://api.foodhubrecipe.shop/'; // Adjust this to match your API base URL

  minPrice: number | null = null;
  maxPrice: number | null = null;

  ratingInfo: { [key: number]: { avg: number, count: number } } = {};

  favoriteNotification = {
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
    recipeId: null as number | null
  };
  private favoriteNotificationTimer: any = null;

  @ViewChild('recipeList') recipeListElement?: ElementRef;

  constructor(private http: HttpClient, private dataService: DataService) {}

  ngOnInit() {
    this.fetchIngredients();
    this.fetchAllRecipes();
    this.checkMobileView();
    this.loadFavorites();
    window.addEventListener('resize', this.checkMobileView.bind(this));
  }

  ngAfterViewInit() {
    // Configure Hammer.js to allow normal scrolling while still enabling horizontal swipes
    if (this.recipeListElement && typeof Hammer !== 'undefined') {
      const hammerManager = new Hammer.Manager(this.recipeListElement.nativeElement);
      
      // Create a horizontal swipe recognizer
      const swipe = new Hammer.Swipe({ 
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 10, // Lower threshold for easier recognition
        velocity: 0.3  // Lower velocity requirement
      });
      
      // Add the recognizer to the manager
      hammerManager.add(swipe);
      
      // Listen for swipe events
      hammerManager.on('swipeleft', () => this.nextPage());
      hammerManager.on('swiperight', () => this.prevPage());
    }
  }

  fetchIngredients() {
    this.isLoading = true;
    this.error = null;

    this.dataService.getAvailableIngredients().subscribe({
      next: (response: IngredientsResponse) => {
        if (response.success && response.ingredients) {
          this.availableIngredients = response.ingredients.map(ing => ing.name);
          this.filteredAvailableIngredients = [...this.availableIngredients];
        } else {
          this.error = 'Failed to fetch ingredients';
          console.error('Unexpected response format:', response);
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
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
    
    // Get current page's recipes
    const startIndex = (this.currentPage - 1) * this.recipesPerPage;
    const endIndex = startIndex + this.recipesPerPage;
    this.filteredRecipesForDisplay = this.filteredRecipes.slice(startIndex, endIndex);
    
    console.log(`Updated pagination: ${this.filteredRecipes.length} recipes, page ${this.currentPage}/${this.totalPages}`);
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
      // When no ingredients selected, reset to all recipes
      this.filteredRecipes = [...this.allRecipes];
      this.updateAvailableRecipesCount();
      this.updateRecipesPagination(); // Ensure pagination is updated
      this.currentPage = 1; // Reset to first page
      return;
    } 
    
    // If ingredients are selected, fetch matching recipes
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
        this.updateRecipesPagination(); // Update pagination after filtering
        this.currentPage = 1; // Reset to first page when filters change
      },
      error: (error) => {
        this.error = 'Error filtering recipes. Please try again.';
        console.error('Error filtering recipes:', error);
      }
    });
  }

  fetchAllRecipes() {
    this.isLoading = true;
    this.dataService.getAllRecipes().subscribe({
      next: (response) => {
        if (response.success) {
          this.allRecipes = response.recipes;
          this.filterRecipes();
          this.totalPages = Math.ceil(this.allRecipes.length / this.recipesPerPage);
          this.fetchAllRatings(); // <-- Fetch ratings after loading recipes
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

  fetchAllRatings() {
    this.allRecipes.forEach(recipe => {
      this.dataService.getRecipeRating(recipe.id).subscribe(res => {
        if (res.success) {
          this.ratingInfo[recipe.id] = { avg: res.avg_rating, count: res.total_ratings };
        }
      });
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
  
  isRecipeFavorite(recipeId: number): boolean {
    return this.favoriteRecipes.some(fav => fav.recipe_id === recipeId);
  }
  

  toggleFavorite(recipe: Recipe) {
    const isCurrentlyFavorite = this.isRecipeFavorite(recipe.id);
  
    if (isCurrentlyFavorite) {
      this.dataService.removeFromFavorites(recipe.id, recipe.name.includes('User Recipe'))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.favoriteRecipes = this.favoriteRecipes.filter(fav => fav.recipe_id !== recipe.id);
              this.showFavoriteNotification("Removed from favorites", "error", recipe.id);
            } else {
              this.showFavoriteNotification(response.message || "Failed to remove from favorites", "error", recipe.id);
            }
          },
          error: (error) => {
            this.showFavoriteNotification("Please log in to manage favorites", "error", recipe.id);
          }
        });
    } else {
      this.dataService.addToFavorites(recipe.id, recipe.name.includes('User Recipe'))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.favoriteRecipes.push({ recipe_id: recipe.id });
              this.showFavoriteNotification("Added to favorites", "success", recipe.id);
            } else {
              this.showFavoriteNotification(response.message || "Failed to add to favorites", "error", recipe.id);
            }
          },
          error: (error) => {
            this.showFavoriteNotification("Please log in to add favorites", "error", recipe.id);
          }
        });
    }
  }
  
  showGlobalNotification(message: string, type: 'success' | 'error') {
    // Always clear any existing timer
    if (this.notificationTimer) {
      clearTimeout(this.notificationTimer);
    }
    // Hide first to force re-render if spamming
    this.globalNotification.show = false;
  
    setTimeout(() => {
      this.globalNotification = {
        show: true,
        message,
        type
      };
      this.notificationTimer = setTimeout(() => {
        this.globalNotification.show = false;
      }, 3500);
    }, 50); // Small delay to allow DOM update
  }
  
  showFavoriteNotification(message: string, type: 'success' | 'error', recipeId: number) {
    // Always clear any existing timer
    if (this.favoriteNotificationTimer) {
      clearTimeout(this.favoriteNotificationTimer);
    }
    
    // First hide the notification to force re-render
    this.favoriteNotification.show = false;
    
    // Use setTimeout with minimal delay to set it back to visible
    setTimeout(() => {
      this.favoriteNotification = {
        show: true,
        message,
        type,
        recipeId
      };
      
      // Set longer timeout to keep notification visible
      this.favoriteNotificationTimer = setTimeout(() => {
        this.favoriteNotification.show = false;
        this.favoriteNotification.recipeId = null;
      }, 2000);
    }, 10);  // Small delay to ensure DOM update
  }

  loadFavorites() {
    this.dataService.getUserFavorites()
      .subscribe({
        next: (response: FavoritesResponse) => {
          if (response.success) {
            this.favoriteRecipes = response.favorites || [];
          } else {
            console.error('Failed to load favorites:', response.error || response.message);
            this.favoriteRecipes = []; // Ensure it's an empty array on error
          }
        },
        error: (error) => {
          console.error('Error loading favorites:', error);
          this.favoriteRecipes = []; // Ensure it's an empty array on error
        }
      });
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
  this.dataService.shareRecipe(recipe.id, recipe.name.includes('User Recipe'))
    .subscribe({
      next: (response) => {
        if (response.success) {
          // Show success message to user
          console.log('Recipe shared successfully:', response.message);
        } else {
          console.error('Failed to share recipe:', response.message);
        }
      },
      error: (error) => console.error('Error sharing recipe:', error)
    });
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
  if (this.notificationTimer) {
    clearTimeout(this.notificationTimer);
  }
}

toggleCategoryDropdown() {
  this.isCategoryDropdownOpen = !this.isCategoryDropdownOpen;
}

filterByCategory(category: string) {
  this.selectedCategory = category;
  this.isCategoryDropdownOpen = false;

  if (category === 'All') {
    this.filteredRecipes = [...this.allRecipes];
  } else {
    this.filteredRecipes = this.allRecipes.filter(recipe => recipe.category === category);
  }

  this.updateAvailableRecipesCount();
  this.updateRecipesPagination();
}

applyPriceFilter() {
  this.filteredRecipes = this.allRecipes.filter(recipe => {
    const price = recipe.estimated_price;
    const meetsMinPrice = this.minPrice !== null ? price >= this.minPrice : true;
    const meetsMaxPrice = this.maxPrice !== null ? price <= this.maxPrice : true;
    return meetsMinPrice && meetsMaxPrice;
  });

  this.updateAvailableRecipesCount();
  this.updateRecipesPagination();
}

  // Handle swipe gestures
  onSwipe(event: any): void {
    const direction = event.direction;
    // Swipe left (next page)
    if (direction === 2) {
      this.nextPage();
    }
    // Swipe right (previous page)
    if (direction === 4) {
      this.prevPage();
    }
  }

  ratingModalVisible: boolean = false;
  ratingModalRecipeId: number | null = null;

  openRatingModal(recipeId: number) {
    this.ratingModalRecipeId = recipeId;
    this.ratingModalVisible = true;
  }

  closeRatingModal() {
    this.ratingModalVisible = false;
    this.ratingModalRecipeId = null;
  }

  onRecipeRated(rating: number) {
    // Optionally refresh rating info here
    if (this.ratingModalRecipeId) {
      this.dataService.getRecipeRating(this.ratingModalRecipeId).subscribe(res => {
        if (res.success) {
          this.ratingInfo[this.ratingModalRecipeId!] = { avg: res.avg_rating, count: res.total_ratings };
        }
      });
    }
  }

  // Add this method to handle image loading errors
  handleImageError(event: any, recipe: any): void {
    console.log('Image failed to load:', recipe.name);
    const img = event.target;
    
    // Try the image directly from userirecipeimage.foodhubrecipe.shop
    if (!img.src.includes('userirecipeimage.foodhubrecipe.shop')) {
      img.src = `https://userirecipeimage.foodhubrecipe.shop/${recipe.image}`;
      return;
    }
    
    // If that also fails, try the API proxy
    if (!img.src.includes('api.foodhubrecipe.shop')) {
      img.src = `https://api.foodhubrecipe.shop/images/recipes/${recipe.image}`;
      return;
    }
    
    
}
}