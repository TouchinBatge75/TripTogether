import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent, FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  ubicacionActual: {latitude: number, longitude: number} | null = null;
  direccionDestino: string = '';
  precio: number | null = null;
  error: string | null = null;

  mostrarFormulario = false;
  ubicacionDestino: {latitude: number, longitude: number} | null = null;

  constructor() {
    this.obtenerUbicacionActual();
  }

  obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      this.error = 'Geolocalización no soportada por tu navegador';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.ubicacionActual = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        this.error = null;
      },
      (err) => {
        this.error = 'No se pudo obtener la ubicación: ' + err.message;
      }
    );
  }

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
    this.precio = null;
    this.error = null;
    this.ubicacionDestino = null;
    this.direccionDestino = '';
  }

  async calcularPrecio() {
    if (!this.ubicacionActual) {
      this.error = 'Primero obtén tu ubicación actual.';
      return;
    }
    if (!this.direccionDestino.trim()) {
      this.error = 'Por favor, ingresa la dirección destino.';
      return;
    }

    const coordsDestino = await this.getCoordsFromAddress(this.direccionDestino);

    if (!coordsDestino) {
      this.error = 'No se pudo obtener la ubicación destino. Intenta con otra dirección.';
      return;
    }

    this.ubicacionDestino = coordsDestino;

    const distanciaKm = this.calcularDistancia(this.ubicacionActual, coordsDestino);

    this.precio = 5 + distanciaKm * 1;
    this.error = null;
  }

  calcularDistancia(coord1: {latitude: number, longitude: number}, coord2: {latitude: number, longitude: number}): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.latitude)) * Math.cos(this.deg2rad(coord2.latitude)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  async getCoordsFromAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'es', // Opcional: pedir resultados en español
          'User-Agent': 'TuApp/1.0 (contacto@tudominio.com)' // Importante para Nominatim
        }
      });
      if (!response.ok) {
        console.error('Error en respuesta de geocoding:', response.statusText);
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
    } catch (error) {
      console.error('Error al obtener coords del address:', error);
      return null;
    }
  }
}
