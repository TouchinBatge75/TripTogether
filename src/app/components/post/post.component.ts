import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapComponent } from '../map/map.component';
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
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarViajes();
  }

  cargarViajes() {
    this.viajeService.obtenerViajes().subscribe(viajes => {
      this.viajesPublicados = viajes;
    });
  }

  async buscarCoordsOrigen() {
    this.coordsOrigen = await this.buscarCoordenadas(this.direccionOrigen);
  }

  async buscarCoordsDestino() {
    this.coordsDestino = await this.buscarCoordenadas(this.direccionDestino);
  }

  private async buscarCoordenadas(direccion: string): Promise<{ latitude: number; longitude: number } | null> {
    if (direccion.length < 3) return null;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'TuApp/1.0 (contacto@tudominio.com)'
        }
      });
      const data = await response.json();
      if (!data.length) return null;
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Error buscando coordenadas:', error);
      return null;
    }
  }

  async publicarViaje() {
    if (!this.coordsOrigen || !this.coordsDestino) {
      alert('Por favor, ingresa direcciones válidas.');
      return;
    }

    if (!this.fechaHora || this.precio == null || !this.pasajerosDisponibles) {
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
      usuarioId: usuarioActual.uid,
      usuarioEmail: usuarioActual.email
    };

    try {
      await this.viajeService.publicarViaje(viaje, usuarioActual.uid);
      alert('Viaje publicado con éxito!');
      this.reiniciarFormulario();
    } catch (error) {
      console.error('Error al publicar viaje:', error);
      alert('Hubo un error al publicar el viaje.');
    }
  }

  private reiniciarFormulario() {
    this.direccionOrigen = '';
    this.direccionDestino = '';
    this.fechaHora = '';
    this.precio = null;
    this.pasajerosDisponibles = 1;
    this.coordsOrigen = null;
    this.coordsDestino = null;
  }
}
