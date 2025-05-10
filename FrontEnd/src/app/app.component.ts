import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Importar RouterOutlet

// Importa los componentes
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { AccountComponent } from './pages/account/account.component';
import { SeachComponent } from './pages/seach/seach.component';
import { PostComponent } from './pages/post/post.component';

import { NavbarComponent } from './complement/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,     // Importar RouterOutlet
    NavbarComponent,  // Importar el componente de la barra de navegación
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Mi Proyecto Angular Standalone';
}
