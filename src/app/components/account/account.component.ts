import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ViajeService } from '../../services/travel.service';
import { Firestore, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);

  userData: any = null;
  viajesRealizados: number = 0;
  saldo: number = 0;

  constructor(
    private authService: AuthService,
    private viajeService: ViajeService
  ) {}

  async ngOnInit(): Promise<void> {
    const currentUser = this.auth.currentUser;

    if (currentUser) {
      const uid = currentUser.uid;
      const email = currentUser.email;

      const userRef = doc(this.firestore, 'users', uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        this.userData = {
          ...snapshot.data(),
          uid: uid,
          email: email // Email viene de Firebase Auth
        };

        this.cargarEstadisticas();
      } else {
        console.warn('No se encontraron datos del usuario en Firestore');
      }
    }
  }

  cargarEstadisticas() {
    this.viajeService.obtenerViajes().subscribe(viajes => {
      this.viajesRealizados = viajes.filter(v => 
        v.userIdPublicador === this.userData.uid ||
        (v.pasajerosIds && v.pasajerosIds.includes(this.userData.uid))
      ).length;
    });

    // Aquí idealmente cargas el saldo desde Firestore si lo tienes guardado
    this.saldo = this.userData.saldo || 0;
  }

  async recargarSaldo() {
    const recarga = 100; // Ejemplo, monto a recargar

    if (!this.userData) return;

    try {
      const userRef = doc(this.firestore, 'users', this.userData.uid);
      this.saldo += recarga;

      await updateDoc(userRef, {
        saldo: this.saldo
      });

      alert(`Has recargado $${recarga}. Nuevo saldo: $${this.saldo.toFixed(2)}`);
    } catch (error) {
      console.error('Error al recargar saldo:', error);
      alert('No se pudo recargar el saldo. Intenta de nuevo más tarde.');
    }
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      this.userData = null;
      this.viajesRealizados = 0;
      this.saldo = 0;

      alert('Sesión cerrada correctamente.');
      this.router.navigate(['/login']); // Ajusta la ruta según tu app
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('No se pudo cerrar sesión. Intenta de nuevo.');
    }
  }

  async borrarCuenta() {
    if (!this.userData) return;

    const confirmacion = confirm('¿Estás seguro que quieres borrar tu cuenta? Esta acción no se puede deshacer.');

    if (!confirmacion) return;

    try {
      // 1. Borra el documento Firestore del usuario
      const userRef = doc(this.firestore, 'users', this.userData.uid);
      await deleteDoc(userRef);

      // 2. Borra el usuario de Firebase Auth
      if (this.auth.currentUser) {
        await this.auth.currentUser.delete();
      }

      this.userData = null;
      this.viajesRealizados = 0;
      this.saldo = 0;

      alert('Cuenta borrada correctamente.');

      this.router.navigate(['/login']); // Ajusta según tu flujo (ej: registro o inicio)
    } catch (error: any) {
      console.error('Error al borrar cuenta:', error);
      if (error.code === 'auth/requires-recent-login') {
        alert('Por seguridad, vuelve a iniciar sesión para borrar la cuenta.');
        // Aquí podrías redirigir a login o pedir reautenticación
        this.cerrarSesion();
      } else {
        alert('No se pudo borrar la cuenta. Intenta de nuevo.');
      }
    }
  }
}
