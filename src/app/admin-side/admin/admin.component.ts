import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../auth.service';
import { DataService } from '../../data.service';

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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes(): void {
    this.isLoading = true;
    this.error = null;

    this.dataService.getAllRecipes().subscribe({
      next: (response) => {
        if (response.success) {
          this.recipes = response.recipes;
          this.filterRecipes();
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

  filterRecipes() {
    if (!this.searchQuery) {
      this.filteredRecipes = [...this.allRecipes];
    } else {
      this.filteredRecipes = this.allRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        recipe.category.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

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
    this.router.navigate(['/create-recipe']);
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

  deleteRecipe(id: number): void {
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.isLoading = true;
      this.dataService.deleteRecipe(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.recipes = this.recipes.filter(recipe => recipe.id !== id);
            this.filterRecipes();
          } else {
            this.error = 'Failed to delete the recipe';
          }
        },
        error: (error) => {
          this.error = 'Error deleting recipe. Please try again.';
          console.error('Error deleting recipe:', error);
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
