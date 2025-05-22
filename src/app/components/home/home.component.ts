import { Component, OnInit } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ViajeService } from '../../services/travel.service';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MapComponent, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  ubicacionActual: { latitude: number; longitude: number } | null = null;
  ubicacionDestino: { latitude: number; longitude: number } | null = null;

  direccionDestino: string = '';
  tipoPago: 'efectivo' | 'tarjeta' = 'efectivo';
  numeroPasajeros: number = 1;
  precio: number | null = null;
  error: string | null = null;

  mostrarFormulario: boolean = false;
  mostrarViajes: boolean = false;

  sugerencias: any[] = [];
  mostrarSugerencias: boolean = false;

  viajesPublicados: any[] = [];
  userId: string = '';

  constructor(
    private viajeService: ViajeService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    const user = this.authService.currentUser;
    this.userId = user?.uid || '';
    this.obtenerUbicacionActual();
  }

  ngOnInit(): void {
    // Opcional: cargar viajes desde el inicio si se desea
    // this.cargarViajes();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario) {
      this.resetFormulario();
    }
  }

  resetFormulario(): void {
    this.precio = null;
    this.error = null;
    this.direccionDestino = '';
    this.numeroPasajeros = 1;
    this.tipoPago = 'efectivo';
    this.ubicacionDestino = null;
    this.sugerencias = [];
    this.mostrarSugerencias = false;
  }

  toggleViajesPublicados(): void {
    this.mostrarViajes = !this.mostrarViajes;
    if (this.mostrarViajes) {
      this.cargarViajes();
    }
  }

  cargarViajes(): void {
    this.viajeService.obtenerViajes().subscribe(
      viajes => {
        this.viajesPublicados = viajes;
      },
      err => {
        console.error('Error al cargar viajes:', err);
        this.viajesPublicados = [];
      }
    );
  }

  async publicarViaje(): Promise<void> {
    if (!this.direccionDestino.trim() || this.numeroPasajeros < 1) {
      this.error = 'Completa todos los campos correctamente.';
      return;
    }
    if (!this.userId) {
      this.error = 'Usuario no autenticado.';
      return;
    }
    if (this.precio === null) {
      this.error = 'Calcula el precio antes de publicar.';
      return;
    }
    this.error = null;

    const nuevoViaje = {
      direccionDestino: this.direccionDestino,
      pasajeros: this.numeroPasajeros,
      tipoPago: this.tipoPago,
      precio: this.precio,
      pasajerosIds: [this.userId],
      creado: new Date().toISOString(),
      creadorId: this.userId
    };

    try {
      await this.viajeService.publicarViaje(nuevoViaje, this.userId);
      this.toggleFormulario();
      this.cargarViajes();
    } catch (err: any) {
      console.error(err);
      this.error = 'Error al publicar viaje: ' + (err.message || err);
    }
  }

  async unirseAViaje(viaje: any): Promise<void> {
    this.error = null;

    if (viaje.creadorId === this.userId) {
      this.error = 'No puedes unirte a tu propio viaje.';
      return;
    }

    if (viaje.pasajerosIds?.includes(this.userId)) {
      this.error = 'Ya estás inscrito en este viaje.';
      return;
    }

    if ((viaje.pasajerosIds?.length || 0) >= viaje.pasajeros) {
      this.error = 'No hay asientos disponibles en este viaje.';
      return;
    }

    try {
      await this.viajeService.unirseAViaje(viaje.id, this.userId);
      viaje.pasajerosIds = viaje.pasajerosIds || [];
      viaje.pasajerosIds.push(this.userId);
    } catch (err: any) {
      console.error(err);
      this.error = 'Error al unirte al viaje: ' + (err.message || err);
    }
  }

  obtenerUbicacionActual(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocalización no soportada';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        this.ubicacionActual = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
      },
      err => {
        this.error = 'No se pudo obtener ubicación: ' + err.message;
      }
    );
  }

  async calcularPrecio(): Promise<void> {
    if (!this.ubicacionActual || !this.direccionDestino.trim()) {
      this.error = 'Primero obtén ubicación y destino válidos';
      return;
    }

    const coords = await this.getCoordsFromAddress(this.direccionDestino);
    if (!coords) {
      this.error = 'Destino no válido';
      return;
    }
    this.ubicacionDestino = coords;

    const d = this.calcularDistancia(this.ubicacionActual, coords);
    const cargoDist = 2 * Math.pow(d, 1.2);
    const cargoPas = 1 + (this.numeroPasajeros - 1) * 0.5;
    let final = (30 + cargoDist) * cargoPas;

    if (this.tipoPago === 'tarjeta') final *= 1.05;

    this.precio = Math.max(15, parseFloat(final.toFixed(2)));
    this.error = null;
  }

  calcularDistancia(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(b.latitude - a.latitude);
    const dLon = this.deg2rad(b.longitude - a.longitude);
    const lat1 = this.deg2rad(a.latitude);
    const lat2 = this.deg2rad(b.latitude);

    const aa =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(lat1) *
        Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getCoordsFromAddress(
    addr: string
  ): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        addr
      )}&limit=1`;
      const response = await lastValueFrom(this.http.get<any[]>(url));
      if (response && response.length > 0) {
        return {
          latitude: parseFloat(response[0].lat),
          longitude: parseFloat(response[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
      return null;
    }
  }

  async buscarSugerencias(): Promise<void> {
    if (this.direccionDestino.trim().length < 3) {
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      this.direccionDestino
    )}&limit=5`;
    try {
      const results = await lastValueFrom(this.http.get<any[]>(url));
      this.sugerencias = results;
      this.mostrarSugerencias = this.sugerencias.length > 0;
    } catch (error) {
      console.error('Error buscando sugerencias:', error);
      this.sugerencias = [];
      this.mostrarSugerencias = false;
    }
  }

  seleccionarSugerencia(sugerencia: any): void {
    this.direccionDestino = sugerencia.display_name || '';
    this.ubicacionDestino = {
      latitude: parseFloat(sugerencia.lat),
      longitude: parseFloat(sugerencia.lon)
    };
    this.mostrarSugerencias = false;
  }

  ocultarSugerencias(): void {
    this.mostrarSugerencias = false;
  }
}
