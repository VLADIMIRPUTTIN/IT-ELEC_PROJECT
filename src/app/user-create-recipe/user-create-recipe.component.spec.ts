import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCreateRecipeComponent } from './user-create-recipe.component';

describe('UserCreateRecipeComponent', () => {
  let component: UserCreateRecipeComponent;
  let fixture: ComponentFixture<UserCreateRecipeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserCreateRecipeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserCreateRecipeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
