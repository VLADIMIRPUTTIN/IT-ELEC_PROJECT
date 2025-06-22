import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
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
import { AdminLoginComponent } from './admin-side/admin-login/admin-login.component';
import { AdminRegisterComponent } from './admin-side/admin-register/admin-register.component';
import { RatingModalComponent } from './parts/rating-modal/rating-modal.component';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from 'angularx-social-login';
import { SharedRecipesComponent } from './shared-recipes/shared-recipes.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PwaInstallPromptComponent } from './pwa-install-prompt/pwa-install-prompt.component';
import { AdminCreateRecipeComponent } from './admin-side/admin-create-recipe/admin-create-recipe.component';

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
    ViewRecipeComponent,
    AdminLoginComponent,
    AdminRegisterComponent,
    RatingModalComponent,
    SharedRecipesComponent,
    PwaInstallPromptComponent,
    AdminCreateRecipeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule, 
    ReactiveFormsModule, 
    MatAutocompleteModule,
    MatFormFieldModule,
    CommonModule,
    HammerModule,
    SocialLoginModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideAnimationsAsync(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '209979773198-25s0s393sceitste72jnh3583dldq8fr.apps.googleusercontent.com'
            )
          }
        ]
      } as SocialAuthServiceConfig,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
