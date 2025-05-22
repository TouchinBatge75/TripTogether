import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { PostComponent } from './components/post/post.component';


export const routes: Routes = [
      { path: '', component: LoginComponent },
      { path: 'login', component: LoginComponent}, 
      { path: 'register', component: RegisterComponent },
      { path: 'home', component: HomeComponent },
      { path: 'post', component: PostComponent },
];
