import { Component, Input, Output, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recipe-confirmation-modal',
  templateUrl: `./recipe-confirmation-modal.component.html`,
  styleUrls: [`./recipe-confirmation-modal.component.scss`]
})
export class RecipeConfirmationModalComponent {
  @Input() isVisible = false;
  @Input() recipeData: any = {};
  @Output() confirmEvent = new EventEmitter<boolean>();

  confirm() {
    // Use SweetAlert2 for the confirmation
    Swal.fire({
      title: 'Save Recipe',
      text: 'Are you sure you want to save this recipe?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, go back'
    }).then((result) => {
      if (result.isConfirmed) {
        // Show success message
        Swal.fire({
          title: 'Saving Recipe!',
          text: 'Your recipe is being saved...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        // Emit the confirm event
        this.confirmEvent.emit(true);
      }
    });
  }

  cancel() {
    Swal.fire({
      title: 'Return to Editing?',
      text: 'You can continue editing your recipe',
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go back to edit',
      cancelButtonText: 'Stay here'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmEvent.emit(false);
      }
    });
  }
}