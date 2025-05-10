import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // <-- Importante

@Component({
  selector: 'app-navbar',
  imports: [RouterModule], 
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {}
