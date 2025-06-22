import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../auth.service';
import { DataService } from '../../data.service';
import Swal from 'sweetalert2'; // Import SweetAlert
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser'; // Add this to your imports

interface Recipe {
  id: number;
  name: string;
  category: string;
  description: string;
  ingredients_list: {
    ingredient_name: string;
    amount: number;
    unit: string;
  }[];
  preparation_steps: string[];
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  // Recipe management properties
  allRecipes: Recipe[] = [];
  filteredRecipes: Recipe[] = [];
  
  // Pagination properties
  currentPage: number = 1;
  recipesPerPage: number = 5;
  totalPages: number = 0;
  
  // Search and filter properties
  searchQuery: string = '';
  availableRecipesCount: number = 0;
  categoryFilter: string = '';
  uniqueCategories: string[] = [];
  
  // State management
  isLoading: boolean = false;
  error: string | null = null;
  
  // Mobile responsiveness
  isMobile = window.innerWidth <= 768;
  isSearchVisible = false;
  recipes: Recipe[] = [];
  loading = false;

  selectedRecipeId: number | null = null;
  modalVisible: boolean = false;

  constructor(
    private router: Router,
    private dataService: DataService,
    private authService: AuthService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
    
    // Check for redirect from recipe creation
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['recipeCreated'] === 'true') {
        this.showSuccessToast('Recipe created successfully and added to system recipes!');
      }
    });
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.error = null;

    this.dataService.getAllRecipes().subscribe({
      next: (response) => {
        if (response.success) {
          this.recipes = response.recipes;
          this.allRecipes = [...this.recipes];
          this.filterRecipes();
          this.updateUniqueCategories();
          this.showSuccessToast('Recipes loaded successfully!');
        } else {
          this.error = 'Failed to fetch recipes';
          this.showErrorToast('Failed to fetch recipes');
        }
      },
      error: (error) => {
        this.error = 'Error loading recipes. Please try again.';
        console.error('Error fetching recipes:', error);
        this.showErrorToast('Error loading recipes. Please try again.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  updateUniqueCategories(): void {
    const categories = new Set<string>();
    this.recipes.forEach(recipe => {
      if (recipe.category) {
        categories.add(recipe.category);
      }
    });
    this.uniqueCategories = Array.from(categories);
  }

  filterRecipes() {
    let filtered = [...this.allRecipes];

    // Apply search term
    if (this.searchQuery) {
      const term = this.searchQuery.toLowerCase();
      filtered = filtered.filter(recipe =>
        recipe.name.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term) ||
        recipe.category.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(recipe => 
        recipe.category === this.categoryFilter
      );
    }

    this.filteredRecipes = filtered;
    this.updateAvailableRecipesCount();
    this.totalPages = Math.ceil(this.filteredRecipes.length / this.recipesPerPage);
    this.currentPage = 1;
  }

  updateAvailableRecipesCount() {
    this.availableRecipesCount = this.filteredRecipes.length;
  }

  onSearch(query: string) {
    this.searchQuery = query;
    this.filterRecipes();
  }

  get paginatedRecipes() {
    const startIndex = (this.currentPage - 1) * this.recipesPerPage;
    return this.filteredRecipes.slice(startIndex, startIndex + this.recipesPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  navigateToCreateRecipe(): void {
    this.router.navigate(['/admin-create-recipe']);
  }

  editRecipe(id: number): void {
    this.router.navigate(['/edit-recipe', id]);
  }

  trackByRecipe(index: number, item: Recipe): number {
    return item.id;
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
      this.isSearchVisible = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (this.isMobile && !target.closest('.search-container')) {
      this.isSearchVisible = false;
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

  viewRecipeDetails(id: number): void {
    this.openRecipeModal(id);
  }

  // New method with SweetAlert confirmation
  confirmDeleteRecipe(id: number, recipeName: string = ''): void {
    const recipe = this.recipes.find(r => r.id === id);
    const name = recipeName || (recipe ? recipe.name : 'this recipe');
    
    Swal.fire({
      title: 'Are you sure?',
      html: `You are about to delete recipe: <strong>${name}</strong>.<br>This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      heightAuto: false,
      buttonsStyling: true,
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRecipe(id);
      }
    });
  }

  // Updated deleteRecipe with SweetAlert notifications
  deleteRecipe(id: number): void {
    this.isLoading = true;
    this.dataService.deleteRecipe(id).subscribe({
      next: (response) => {
        if (response.success) {
          // Filter out the deleted recipe
          this.recipes = this.recipes.filter(recipe => recipe.id !== id);
          this.allRecipes = [...this.recipes];
          this.filterRecipes();
          
          // Show success message with SweetAlert
          Swal.fire({
            title: 'Deleted!',
            text: 'Recipe has been deleted successfully.',
            icon: 'success',
            confirmButtonColor: '#e09f56',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
        } else {
          this.error = 'Failed to delete the recipe';
          this.showErrorToast('Failed to delete the recipe');
        }
      },
      error: (error) => {
        this.error = 'Error deleting recipe. Please try again.';
        console.error('Error deleting recipe:', error);
        
        // Show error message
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete recipe. Please try again.',
          icon: 'error',
          confirmButtonColor: '#e09f56'
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Toast notifications with SweetAlert
  showSuccessToast(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    
    Toast.fire({
      icon: 'success',
      title: message
    });
  }

  showErrorToast(message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
    
    Toast.fire({
      icon: 'error',
      title: message
    });
  }
  
  getRecentlyAddedCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.recipes.filter(recipe => {
      const createdDate = new Date(recipe.created_at);
      return createdDate > oneWeekAgo;
    }).length;
  }

  getUniqueCategories(): number {
    return this.uniqueCategories.length;
  }

  applyFilters(): void {
    this.filterRecipes();
  }

  // Add this method to your component
  @HostListener('swipe', ['$event'])
  onSwipe(event: any): void {
    // Detect swipe direction (2 is right to left, 4 is left to right)
    if (event.direction === 2) {
      this.nextPage();
    } else if (event.direction === 4) {
      this.prevPage();
    }
  }
}
