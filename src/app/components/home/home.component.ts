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

  direccionDestino = '';
  tipoPago: 'efectivo' | 'tarjeta' = 'efectivo';
  numeroPasajeros = 1;
  precio: number | null = null;
  error: string | null = null;

  mostrarFormulario = false;
  mostrarViajes = false;
  mostrarSugerencias = false;
  mostrarAlertaProximidad = false;

  sugerencias: any[] = [];
  viajesPublicados: any[] = [];
  userId = '';

  constructor(
    private viajeService: ViajeService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    const user = this.authService.currentUser;
    this.userId = user?.uid || '';
    this.obtenerUbicacionActual();
  }

  ngOnInit(): void {}

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (this.mostrarFormulario) this.resetFormulario();
  }

  toggleViajesPublicados(): void {
    this.mostrarViajes = !this.mostrarViajes;
    if (this.mostrarViajes) this.cargarViajes();
  }

  resetFormulario(): void {
    this.direccionDestino = '';
    this.numeroPasajeros = 1;
    this.tipoPago = 'efectivo';
    this.precio = null;
    this.ubicacionDestino = null;
    this.sugerencias = [];
    this.mostrarSugerencias = false;
    this.error = null;
  }

  cargarViajes(): void {
    this.viajeService.obtenerViajes().subscribe({
      next: viajes => {
        this.viajesPublicados = viajes || [];
        this.verificarProximidad();
      },
      error: err => {
        console.error('Error al cargar viajes:', err);
        this.viajesPublicados = [];
      }
    });
  }

  async publicarViaje(): Promise<void> {
    if (!this.validarFormulario()) return;

    const nuevoViaje = {
      direccionDestino: this.direccionDestino,
      pasajeros: this.numeroPasajeros,
      tipoPago: this.tipoPago,
      precio: this.precio,
      pasajerosIds: [this.userId],
      creado: new Date().toISOString(),
      creadorId: this.userId,
      latitudDestino: this.ubicacionDestino?.latitude ?? null,
      longitudDestino: this.ubicacionDestino?.longitude ?? null,
    };

    try {
      await this.viajeService.publicarViaje(nuevoViaje, this.userId);
      this.toggleFormulario();
      this.cargarViajes();
    } catch (err: any) {
      console.error(err);
      this.error = `Error al publicar viaje: ${err.message || err}`;
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
      this.error = 'No hay asientos disponibles.';
      return;
    }

    try {
      await this.viajeService.unirseAViaje(viaje.id, this.userId);
      viaje.pasajerosIds = [...(viaje.pasajerosIds || []), this.userId];
    } catch (err: any) {
      console.error(err);
      this.error = `Error al unirte al viaje: ${err.message || err}`;
    }
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
    const distancia = this.calcularDistancia(this.ubicacionActual, coords);
    const cargoDistancia = 2 * Math.pow(distancia, 1.2);
    const cargoPasajeros = 1 + (this.numeroPasajeros - 1) * 0.5;
    let precioFinal = (30 + cargoDistancia) * cargoPasajeros;

    if (this.tipoPago === 'tarjeta') precioFinal *= 1.05;

    this.precio = Math.max(15, parseFloat(precioFinal.toFixed(2)));
    this.error = null;
  }

  calcularDistancia(
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(b.latitude - a.latitude);
    const dLon = this.deg2rad(b.longitude - a.longitude);
    const lat1 = this.deg2rad(a.latitude);
    const lat2 = this.deg2rad(b.latitude);

    const aa =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getCoordsFromAddress(addr: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(addr)}&limit=1`;
      const response: any = await lastValueFrom(this.http.get(url));
      const feature = response.features?.[0];
      return feature
        ? {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0]
          }
        : null;
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

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(this.direccionDestino)}&limit=5`;
    try {
      const response: any = await lastValueFrom(this.http.get(url));
      this.sugerencias = (response.features || []).map((f: any) => ({
        display_name: `${f.properties.name || ''}${f.properties.state ? ', ' + f.properties.state : ''}${f.properties.country ? ', ' + f.properties.country : ''}`,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0]
      }));
      this.mostrarSugerencias = this.sugerencias.length > 0;
    } catch (error) {
      console.error('Error buscando sugerencias:', error);
      this.sugerencias = [];
      this.mostrarSugerencias = false;
    }
  }

  seleccionarSugerencia(sugerencia: any): void {
    this.direccionDestino = sugerencia.display_name;
    this.ubicacionDestino = {
      latitude: sugerencia.lat,
      longitude: sugerencia.lon
    };
    this.mostrarSugerencias = false;
  }

  ocultarSugerencias(): void {
    this.mostrarSugerencias = false;
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
        this.verificarProximidad();
      },
      err => {
        this.error = `No se pudo obtener ubicación: ${err.message}`;
      }
    );
  }

  verificarProximidad(): void {
    this.mostrarAlertaProximidad = false;

    if (!this.ubicacionActual || !this.viajesPublicados.length) return;

    for (const viaje of this.viajesPublicados) {
      if (viaje.latitudDestino != null && viaje.longitudDestino != null && viaje.creadorId !== this.userId) {
        const distancia = this.calcularDistancia(this.ubicacionActual, {
          latitude: viaje.latitudDestino,
          longitude: viaje.longitudDestino
        });

        if (distancia <= 1.5) {
          this.mostrarAlertaProximidad = true;
          break;
        }
      }
    }
  }

  private validarFormulario(): boolean {
    if (!this.direccionDestino.trim() || this.numeroPasajeros < 1) {
      this.error = 'Completa todos los campos correctamente.';
      return false;
    }
    if (!this.userId) {
      this.error = 'Usuario no autenticado.';
      return false;
    }
    if (this.precio === null) {
      this.error = 'Calcula el precio antes de publicar.';
      return false;
    }
    this.error = null;
    return true;
  }
}
