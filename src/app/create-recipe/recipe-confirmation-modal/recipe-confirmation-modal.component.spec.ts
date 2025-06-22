import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeConfirmationModalComponent } from './recipe-confirmation-modal.component';

describe('RecipeConfirmationModalComponent', () => {
  let component: RecipeConfirmationModalComponent;
  let fixture: ComponentFixture<RecipeConfirmationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecipeConfirmationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
