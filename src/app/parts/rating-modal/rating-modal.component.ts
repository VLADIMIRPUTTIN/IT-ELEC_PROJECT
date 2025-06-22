import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '../../data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rating-modal',
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss']
})
export class RatingModalComponent {
  @Input() visible: boolean = false;
  @Input() recipeId!: number;
  @Input() currentRating: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() rated = new EventEmitter<number>();

  selectedRating: number = 0;
  submitting: boolean = false;
  error: string = '';
  hovered: number = 0;

  constructor(private dataService: DataService) {}

  setRating(star: number) {
    this.selectedRating = star;
  }

  submitRating() {
    if (this.selectedRating < 1 || this.selectedRating > 5) {
      this.error = 'Please select a rating.';
      return;
    }
    this.submitting = true;
    this.dataService.rateRecipe(this.recipeId, this.selectedRating).subscribe({
      next: (res) => {
        this.submitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Thank you!',
          text: `You rated this recipe ${this.selectedRating} star${this.selectedRating > 1 ? 's' : ''}.`,
          timer: 1800,
          showConfirmButton: false
        });
        this.rated.emit(this.selectedRating);
        this.close.emit();
      },
      error: (err) => {
        this.error = 'Failed to save rating.';
        this.submitting = false;
      }
    });
  }

  onClose() {
    this.close.emit();
  }
}
