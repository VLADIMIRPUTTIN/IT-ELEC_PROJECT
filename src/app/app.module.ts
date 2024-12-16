import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './parts/home/home.component';
import { AboutComponent } from './parts/about/about.component';
import { RecipeComponent } from './parts/recipe/recipe.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavComponent } from './nav/nav.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RecipeModalComponent } from './parts/recipe-modal/recipe-modal.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { CreateRecipeComponent } from './create-recipe/create-recipe.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { RecipeConfirmationModalComponent } from './create-recipe/recipe-confirmation-modal/recipe-confirmation-modal.component';
import { UserRecipeComponent } from './parts/user-recipe/user-recipe.component';
import { UserCreateRecipeComponent } from './user-create-recipe/user-create-recipe.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';
import { AdminComponent } from './admin-side/admin/admin.component';
import { CommonModule } from '@angular/common';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';
// import { RecipeViewComponent } from './recipe-view/recipe-view.component';
// import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    RecipeComponent,
    NavComponent,
    RecipeModalComponent,
    RegisterComponent,
    LoginComponent,
    CreateRecipeComponent,
    RecipeConfirmationModalComponent,
    UserRecipeComponent,
    UserCreateRecipeComponent,
    UserProfileComponent,
    EditRecipeComponent,
    AdminComponent,
    ViewRecipeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule, // Import FontAwesomeModule
    ReactiveFormsModule, 
    // BrowserAnimationsModule,
    MatAutocompleteModule,
    // MatInputModule,
    MatFormFieldModule,
    CommonModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent] // Bootstrapping the main component
})
export class AppModule { }
