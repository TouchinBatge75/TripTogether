import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../map/map.component';

// Importa los servicios
import { ViajeService } from '../../services/travel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publicar-viaje',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  direccionOrigen = '';
  direccionDestino = '';
  fechaHora = '';
  precio: number | null = null;
  pasajerosDisponibles = 1;

  coordsOrigen: { latitude: number; longitude: number } | null = null;
  coordsDestino: { latitude: number; longitude: number } | null = null;

  viajesPublicados: any[] = [];

  constructor(
    private viajeService: ViajeService,
    private authService: AuthService // Inyectar servicio Auth
  ) {}

  ngOnInit() {
    this.cargarViajes();
  }

  async cargarViajes() {
    this.viajeService.obtenerViajes().subscribe(viajes => {
      this.viajesPublicados = viajes;
    });
  }

  async buscarCoordsOrigen() {
    if (this.direccionOrigen.length < 3) {
      this.coordsOrigen = null;
      return;
    }
    this.coordsOrigen = await this.getCoordsFromAddress(this.direccionOrigen);
  }

  async buscarCoordsDestino() {
    if (this.direccionDestino.length < 3) {
      this.coordsDestino = null;
      return;
    }
    this.coordsDestino = await this.getCoordsFromAddress(this.direccionDestino);
  }

  async getCoordsFromAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'TuApp/1.0 (contacto@tudominio.com)'
        }
      });
      if (!response.ok) {
        return null;
      }
      const data = await response.json();
      if (data.length === 0) {
        return null;
      }
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } catch {
      return null;
    }
  }

  async publicarViaje() {
    if (!this.coordsOrigen || !this.coordsDestino) {
      alert('Por favor, ingresa direcciones válidas de origen y destino.');
      return;
    }
    if (!this.fechaHora || !this.precio || !this.pasajerosDisponibles) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const usuarioActual = this.authService.currentUser;
    if (!usuarioActual) {
      alert('Debes iniciar sesión para publicar un viaje.');
      return;
    }

    const viaje = {
      direccionOrigen: this.direccionOrigen,
      direccionDestino: this.direccionDestino,
      fechaHora: this.fechaHora,
      precio: this.precio,
      pasajerosDisponibles: this.pasajerosDisponibles,
      coordsOrigen: this.coordsOrigen,
      coordsDestino: this.coordsDestino,
      usuarioId: usuarioActual.uid,       // Agrega el UID del usuario
      usuarioEmail: usuarioActual.email   // Opcional: el email del usuario
    };

    try {
      await this.viajeService.publicarViaje(viaje);
      alert('Viaje publicado con éxito!');

      // Limpiar formulario
      this.direccionOrigen = '';
      this.direccionDestino = '';
      this.fechaHora = '';
      this.precio = null;
      this.pasajerosDisponibles = 1;
      this.coordsOrigen = null;
      this.coordsDestino = null;
    } catch (error) {
      console.error('Error al publicar viaje:', error);
      alert('Hubo un error al publicar el viaje. Intenta de nuevo.');
    }
  }
}
