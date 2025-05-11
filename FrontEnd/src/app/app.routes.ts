import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AccountComponent } from './pages/account/account.component';
import { SeachComponent } from './pages/seach/seach.component';
import { PostComponent } from './pages/post/post.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent },
  { path: 'search', component: SeachComponent },
  { path: 'post', component: PostComponent },
];
