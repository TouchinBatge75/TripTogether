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
  ubicacionActual: { latitude: number, longitude: number } | null = null;
  direccionDestino: string = '';
  precio: number | null = null;
  error: string | null = null;

  mostrarFormulario = false;
  ubicacionDestino: { latitude: number, longitude: number } | null = null;

  tipoPago: string = 'efectivo';
  numeroPasajeros: number = 1;

  sugerencias: any[] = [];
  mostrarSugerencias: boolean = false;

  private debounceTimeout: any;

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
    this.numeroPasajeros = 1;
    this.tipoPago = 'efectivo';
    this.sugerencias = [];
    this.mostrarSugerencias = false;
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

  // Parámetros para la tarifa
  const tarifaBase = 30;             // Cargo base fijo
  const costoPorKm = 2;              // Costo por km
  const costoPorPasajeroExtra = 0.5; // 50% extra por pasajero adicional

  // Cargo por distancia: crece más agresivamente con la distancia
  const cargoDistancia = costoPorKm * Math.pow(distanciaKm, 1.2);  // <- cambio aplicado aquí

  // Cargo por pasajeros (el primero 100%, los demás 50% cada uno)
  const cargoPasajeros = 1 + (this.numeroPasajeros - 1) * costoPorPasajeroExtra;

  let precioFinal = (tarifaBase + cargoDistancia) * cargoPasajeros;

  // Recargo por pago con tarjeta
  if (this.tipoPago === 'tarjeta') {
    precioFinal *= 1.05; // +5%
  }

  // Precio mínimo garantizado
  const precioMinimo = 15;
  if (precioFinal < precioMinimo) {
    precioFinal = precioMinimo;
  }

  this.precio = parseFloat(precioFinal.toFixed(2));
  this.error = null;
}

  calcularDistancia(coord1: { latitude: number, longitude: number }, coord2: { latitude: number, longitude: number }): number {
    const R = 6371;
    const dLat = this.deg2rad(coord2.latitude - coord1.latitude);
    const dLon = this.deg2rad(coord2.longitude - coord1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(coord1.latitude)) * Math.cos(this.deg2rad(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getCoordsFromAddress(address: string): Promise<{ latitude: number, longitude: number } | null> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'es',
          'User-Agent': 'TuApp/1.0 (contacto@tudominio.com)'
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

  buscarSugerencias() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    if (this.direccionDestino.trim().length < 3) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      return;
    }

    this.debounceTimeout = setTimeout(async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.direccionDestino)}&addressdetails=1&limit=5`;

      try {
        const res = await fetch(url, {
          headers: {
            'Accept-Language': 'es',
            'User-Agent': 'TuApp/1.0 (contacto@tudominio.com)'
          }
        });

        const data = await res.json();
        this.sugerencias = data;
        this.mostrarSugerencias = data.length > 0;
      } catch (error) {
        console.error('Error buscando sugerencias:', error);
        this.sugerencias = [];
        this.mostrarSugerencias = false;
      }
    }, 300);
  }

  seleccionarSugerencia(sugerencia: any) {
    this.direccionDestino = sugerencia.display_name;
    this.sugerencias = [];
    this.mostrarSugerencias = false;
  }

  ocultarSugerencias() {
    setTimeout(() => {
      this.mostrarSugerencias = false;
    }, 200);
  }
}
