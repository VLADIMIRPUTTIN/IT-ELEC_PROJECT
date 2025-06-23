import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserProfileService } from '../user-service.service';
<<<<<<< HEAD
import Swal from 'sweetalert2';
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016

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
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  userProfile: any = {};
  userRecipes: Recipe[] = []; // Typed as Recipe array
  
  // Form fields
  username: string = '';
  email: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  profileImage: File | null = null;

  // Message handling
  successMessage: string = '';
  errorMessage: string = '';
  isEditing: boolean = false;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
<<<<<<< HEAD
    // Add this for debugging
    console.log('Debugging auth token and user ID:');
    this.authService['getCurrentUserIdDebug'](); // Call the debug method
    
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    this.loadUserProfile();
    this.loadUserRecipes();
  }

  loadUserProfile() {
<<<<<<< HEAD
    // Add debugging before making the request
    const userId = this.authService.getCurrentUserId();
    const token = this.authService.getToken();
    console.log('About to request profile with:', { userId, token });

    this.userProfileService.getUserProfile().subscribe(
      (response) => {
        console.log('User profile response:', response); // Debug line
=======
    this.userProfileService.getUserProfile().subscribe(
      (response) => {
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        if (response.success) {
          this.userProfile = response.user;
          this.username = this.userProfile.username;
          this.email = this.userProfile.email;
<<<<<<< HEAD
        } else {
          this.errorMessage = response.error || 'Failed to load profile data';
        }
      },
      (error) => {
        console.error('Profile error:', error); // Debug error
=======
        }
      },
      (error) => {
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        this.errorMessage = 'Failed to load user profile';
        this.clearMessagesAfterDelay();
      }
    );
  }

  loadUserRecipes() {
    this.userProfileService.getUserRecipes().subscribe(
      (response: { success: boolean; recipes?: any[] }) => {
        if (response.success) {
          this.userRecipes = (response.recipes || []).map((recipe: any) => {
            // Parse ingredients_list if it's a string
            let ingredientsList = [];
            if (typeof recipe.ingredients_list === 'string') {
              try {
                ingredientsList = JSON.parse(recipe.ingredients_list).map((ingredient: any) => ({
                  ingredient_name: ingredient.ingredient_name || ingredient.name,
                  amount: ingredient.amount || ingredient.quantity,
                  unit: ingredient.unit
                }));
              } catch (error) {
                console.error('Error parsing ingredients list:', error);
                ingredientsList = [];
              }
            } else if (Array.isArray(recipe.ingredients_list)) {
              ingredientsList = recipe.ingredients_list.map((ingredient: any) => ({
                ingredient_name: ingredient.ingredient_name || ingredient.name,
                amount: ingredient.amount || ingredient.quantity,
                unit: ingredient.unit
              }));
            }
  
            // Parse preparation_steps if it's a string
            let preparationSteps = [];
            if (typeof recipe.preparation_steps === 'string') {
              try {
                preparationSteps = JSON.parse(recipe.preparation_steps).map((step: any, index: number) => ({
                  step_number: step.step_number || (index + 1),
                  instruction: step.instruction,
                  preparation: step.preparation || ''
                }));
              } catch (error) {
                console.error('Error parsing preparation steps:', error);
                preparationSteps = [];
              }
            } else if (Array.isArray(recipe.preparation_steps)) {
              preparationSteps = recipe.preparation_steps.map((step: any, index: number) => ({
                step_number: step.step_number || (index + 1),
                instruction: step.instruction,
                preparation: step.preparation || ''
              }));
            }
  
            return {
              ...recipe,
              ingredients_list: ingredientsList,
              preparation_steps: preparationSteps
            };
          });
        }
      },
      (error: any) => {
        this.errorMessage = 'Failed to load user recipes';
        this.clearMessagesAfterDelay();
      }
    );
  }

  // Utility method to format ingredient amount
  formatAmount(amount: number): string {
    // Convert to number
    const numAmount = Number(amount);

    if (isNaN(numAmount)) return amount.toString();

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

    if (Number.isInteger(numAmount)) {
      return numAmount.toString();
    }

    const decimal = numAmount % 1;
    const whole = Math.floor(numAmount);
    const roundedDecimal = Math.round(decimal * 100) / 100;

    if (commonFractions[roundedDecimal]) {
      return whole ? `${whole} ${commonFractions[roundedDecimal]}` : commonFractions[roundedDecimal];
    }

    return numAmount.toFixed(2);
  }

  onProfileImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileImage = file;
    }
  }

<<<<<<< HEAD
  // Update the updateProfile method to handle profile image upload separately

  async updateProfile() {
    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to save these changes to your profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, save',
      cancelButtonText: 'Cancel'
    });
  
    if (result.isConfirmed) {
      // Validate input
      if (this.newPassword && this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'New passwords do not match';
        this.clearMessagesAfterDelay();
        return;
      }
    
      const userId = this.authService.getCurrentUserId();
      console.log('Updating profile for user ID:', userId);
    
      // Add null check for userId
      if (userId === null) {
        this.errorMessage = 'User authentication error. Please log in again.';
        this.clearMessagesAfterDelay();
        return;
      }
    
      // Handle profile image upload first if there's a new image
      if (this.profileImage) {
        this.userProfileService.uploadProfileImage(userId, this.profileImage).subscribe(
          (response) => {
            if (response.success) {
              // Image uploaded successfully, now update other profile details
              this.updateProfileDetails();
            } else {
              this.errorMessage = response.error || 'Failed to upload profile image';
              this.clearMessagesAfterDelay();
            }
          },
          (error) => {
            this.errorMessage = 'An error occurred while uploading profile image';
            this.clearMessagesAfterDelay();
          }
        );
      } else {
        // No new image, just update profile details
        this.updateProfileDetails();
      }
    }
  }
  
  // New method to handle profile details update
  private updateProfileDetails() {
    const userId = this.authService.getCurrentUserId();
    
    // Add null check here as well
    if (userId === null) {
      this.errorMessage = 'User authentication error. Please log in again.';
      this.clearMessagesAfterDelay();
      return;
    }
    
    // Prepare update data
    const updateData = {
      user_id: userId,
      username: this.username !== this.userProfile.username ? this.username : undefined,
      email: this.email !== this.userProfile.email ? this.email : undefined,
      current_password: this.currentPassword || undefined,
      new_password: this.newPassword || undefined
    };
  
=======
  updateProfile() {
    // Validate input
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match';
      this.clearMessagesAfterDelay();
      return;
    }

    // Prepare update data
    const updateData = {
      username: this.username !== this.userProfile.username ? this.username : undefined,
      email: this.email !== this.userProfile.email ? this.email : undefined,
      current_password: this.currentPassword || undefined,
      new_password: this.newPassword || undefined,
      profile_image: this.profileImage || undefined
    };

>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
    this.userProfileService.updateProfile(updateData).subscribe(
      (response) => {
        if (response.success) {
          this.successMessage = 'Profile updated successfully';
          this.isEditing = false;
          this.loadUserProfile(); // Reload profile to get updated data
          this.clearPasswords();
<<<<<<< HEAD
          
          // Calculate and store the new hash if the profile image was updated
          if (this.profileImage) {
            const newHash = this.authService.getProfileImageHash();
            if (newHash) {
              localStorage.setItem('profileImageHash', newHash);
            }
          }
          
          // Emit an event to update profile image in nav component
          window.dispatchEvent(new CustomEvent('profileUpdated'));
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
        } else {
          this.errorMessage = response.error || 'Failed to update profile';
        }
        this.clearMessagesAfterDelay();
      },
      (error) => {
        this.errorMessage = 'An error occurred while updating profile';
        this.clearMessagesAfterDelay();
      }
    );
  }

  deleteRecipe(recipeId: number) {
<<<<<<< HEAD
    Swal.fire({
      title: 'Are you sure?',
      text: 'This recipe will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.userProfileService.deleteUserRecipe(recipeId).subscribe(
          (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Recipe deleted successfully.',
                timer: 1800,
                showConfirmButton: false
              });
              this.loadUserRecipes(); // Reload recipes
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.error || 'Failed to delete recipe'
              });
            }
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while deleting the recipe'
            });
          }
        );
      }
    });
=======
    if (confirm('Are you sure you want to delete this recipe?')) {
      this.userProfileService.deleteUserRecipe(recipeId).subscribe(
        (response) => {
          if (response.success) {
            this.successMessage = 'Recipe deleted successfully';
            this.loadUserRecipes(); // Reload recipes
          } else {
            this.errorMessage = response.error || 'Failed to delete recipe';
          }
          this.clearMessagesAfterDelay();
        },
        (error) => {
          this.errorMessage = 'An error occurred while deleting the recipe';
          this.clearMessagesAfterDelay();
        }
      );
    }
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  }

  viewFullRecipe(recipeId: number) {
    // Navigate to recipe view with isUserRecipe parameter set to true
    this.router.navigate(['/view-user-recipe', recipeId], {
        state: { isUserRecipe: true }
    });
}

  editRecipe(recipeId: number) {
    // Navigate to recipe edit page
    this.router.navigate(['/edit-recipe', recipeId]);
  }

<<<<<<< HEAD
  goToCreateRecipe() {
    this.router.navigate(['/create-recipe']);
  }

  logout() {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/login']);
        });
      }
    });
=======
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
  }

  private clearPasswords() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  private clearMessagesAfterDelay() {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
<<<<<<< HEAD

  async confirmCancelEdit() {
    const result = await Swal.fire({
      title: 'Cancel Editing?',
      text: 'Are you sure you want to discard your changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No'
    });

    if (result.isConfirmed) {
      this.isEditing = false;
      // Optionally reset form fields here if needed
    }
  }

  shareRecipe(recipeId: number) {
    Swal.fire({
      title: 'Share Recipe',
      text: 'Are you sure you want to share this recipe with the community?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, share it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Add loading indicator
        Swal.fire({
          title: 'Sharing Recipe...',
          text: 'Please wait',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        this.userProfileService.shareUserRecipe(recipeId).subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: 'Shared!',
                text: response.message || 'Your recipe has been shared with the community.',
                timer: 1800,
                showConfirmButton: false
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.error || 'Failed to share recipe'
              });
            }
          },
          error: (error) => {
            console.error('Share recipe error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.message || 'An error occurred while sharing the recipe'
            });
          }
        });
      }
    });
  }
=======
>>>>>>> 9d74a4f3524541cba0a69e98e22854246b46a016
}