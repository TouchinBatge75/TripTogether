import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {
  showNavbar = false;

  // Rutas en las que NO quieres navbar
  private hideNavbarRoutes = ['', 'login', 'register'];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Extraemos la ruta sin parámetros ni query strings
      const currentRoute = event.urlAfterRedirects.split('?')[0].replace('/', '');

      // Mostrar navbar solo si la ruta NO está en hideNavbarRoutes
      this.showNavbar = !this.hideNavbarRoutes.includes(currentRoute);
    });
  }
}
