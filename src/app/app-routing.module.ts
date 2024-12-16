import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './parts/home/home.component';
import { AboutComponent } from './parts/about/about.component';
import { RecipeComponent } from './parts/recipe/recipe.component';
import { NavComponent } from './nav/nav.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { CreateRecipeComponent } from './create-recipe/create-recipe.component';
import { UserRecipeComponent } from './parts/user-recipe/user-recipe.component';
import { UserCreateRecipeComponent } from './user-create-recipe/user-create-recipe.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { EditRecipeComponent } from './edit-recipe/edit-recipe.component';
import { AdminComponent } from './admin-side/admin/admin.component';
import { RecipeModalComponent } from './parts/recipe-modal/recipe-modal.component';
import { ViewRecipeComponent } from './view-recipe/view-recipe.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent }, 
  { path: 'recipe', component: RecipeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'nav', component: NavComponent }, 
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'create-recipe', component: CreateRecipeComponent },
  { path: 'ucreate-recipe', component: UserCreateRecipeComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'user-recipe', component: UserRecipeComponent },
  { path: 'user-profile', component: UserProfileComponent},
  { path: 'edit-recipe/:id', component: EditRecipeComponent },
  { path: 'view-recipe/:id', component: ViewRecipeComponent },
  { path: 'view-user-recipe/:id', component: ViewRecipeComponent, data: { isUserRecipe: true }}
  // { path: 'view-recipe', component: RecipeViewComponent }
  // // { path: 'view-recipe/:id', component: RecipeViewComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
