// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { environment } from './enviroment/enviroment'; // Asegúrate de que esta ruta sea correcta: '/enviroment/enviroment' o '/environments/environment'

import { importProvidersFrom } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

bootstrapApplication(AppComponent, {
  providers: [
    // Mueve provideRouter(routes) al inicio o asegúrate de que AngularFire se inicialice primero
    provideRouter(routes), // Lo ideal es que el router se provea antes si hay componentes que dependen de él inmediatamente.
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebase),
      AngularFireAuthModule
    ),
    // Cualquier otro provider global de tu aplicación iría aquí
  ]
});