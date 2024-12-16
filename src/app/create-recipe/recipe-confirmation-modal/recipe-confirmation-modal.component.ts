import { Component, Input, Output, EventEmitter } from '@angular/core';

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
    this.confirmEvent.emit(true);
  }

  cancel() {
    this.confirmEvent.emit(false);
  }
}