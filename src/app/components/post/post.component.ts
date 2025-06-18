import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, MapComponent],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  direccionOrigen = '';
  direccionDestino = '';

  origen = { latitude: 0, longitude: 0 };
  destino = { latitude: 0, longitude: 0 };

  fecha = '';
  pasajeros = 1;
  precioPorPasajero = 0;

  sugerenciasOrigen: any[] = [];
  mostrarSugerenciasOrigen = false;

  sugerenciasDestino: any[] = [];
  mostrarSugerenciasDestino = false;

  apiKey = 'pk.427a339cc31cd4d046d8149e1cc6a83a';

  viajesPublicados: any[] = []; // Aquí cargarás los viajes publicados

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarViajes();
  }

  buscarSugerencias(query: string, tipo: 'origen' | 'destino') {
    if (query.trim().length < 3) {
      if (tipo === 'origen') {
        this.sugerenciasOrigen = [];
        this.mostrarSugerenciasOrigen = false;
      } else {
        this.sugerenciasDestino = [];
        this.mostrarSugerenciasDestino = false;
      }
      return;
    }

    const url = `https://us1.locationiq.com/v1/search.php?key=${this.apiKey}&q=${encodeURIComponent(
      query
    )}&format=json&limit=5&addressdetails=1&accept-language=es`;

    this.http.get<any[]>(url).subscribe({
      next: (results) => {
        const sugerencias = results.map((item) => {
          const address = item.address || {};
          let nombre =
            address.road ||
            address.neighbourhood ||
            address.suburb ||
            address.city ||
            address.county ||
            address.state ||
            item.display_name;

          return {
            nombre,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          };
        });

        if (tipo === 'origen') {
          this.sugerenciasOrigen = sugerencias;
          this.mostrarSugerenciasOrigen = sugerencias.length > 0;
        } else {
          this.sugerenciasDestino = sugerencias;
          this.mostrarSugerenciasDestino = sugerencias.length > 0;
        }
      },
      error: (error) => {
        console.error('Error en LocationIQ API:', error);
        if (tipo === 'origen') {
          this.sugerenciasOrigen = [];
          this.mostrarSugerenciasOrigen = false;
        } else {
          this.sugerenciasDestino = [];
          this.mostrarSugerenciasDestino = false;
        }
      },
    });
  }

  seleccionarSugerencia(sugerencia: any, tipo: 'origen' | 'destino') {
    if (tipo === 'origen') {
      this.direccionOrigen = sugerencia.nombre;
      this.origen = { latitude: sugerencia.lat, longitude: sugerencia.lon };
      this.mostrarSugerenciasOrigen = false;
    } else {
      this.direccionDestino = sugerencia.nombre;
      this.destino = { latitude: sugerencia.lat, longitude: sugerencia.lon };
      this.mostrarSugerenciasDestino = false;
    }
  }

  ocultarSugerencias(tipo: 'origen' | 'destino') {
    setTimeout(() => {
      if (tipo === 'origen') {
        this.mostrarSugerenciasOrigen = false;
      } else {
        this.mostrarSugerenciasDestino = false;
      }
    }, 200);
  }

  publicarViaje() {
    if (!this.direccionOrigen || !this.direccionDestino || !this.fecha || this.pasajeros < 1 || this.precioPorPasajero <= 0) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    const nuevoViaje = {
      origen: this.direccionOrigen,
      destino: this.direccionDestino,
      origenCoords: this.origen,
      destinoCoords: this.destino,
      fecha: this.fecha,
      pasajeros: this.pasajeros,
      precioPorPasajero: this.precioPorPasajero,
      pasajerosRegistrados: [], // Aquí almacenarás los usuarios que se unan
      id: Date.now().toString(),
      // Puedes agregar un campo usuarioId para el dueño del viaje, si tienes autenticación
    };

    // Aquí debes guardar en Firestore o Firebase, pero como ejemplo, lo agregamos localmente
    this.viajesPublicados.push(nuevoViaje);

    // Limpia el formulario
    this.direccionOrigen = '';
    this.direccionDestino = '';
    this.origen = { latitude: 0, longitude: 0 };
    this.destino = { latitude: 0, longitude: 0 };
    this.fecha = '';
    this.pasajeros = 1;
    this.precioPorPasajero = 0;

    alert('Viaje publicado correctamente.');
  }

  cargarViajes() {
    // Aquí debes cargar los viajes desde Firestore/Firebase
    // Por ahora, lo dejamos vacío o con datos de prueba
    this.viajesPublicados = [];
  }

  verPasajeros(viaje: any) {
    // Aquí muestras los pasajeros registrados en el viaje
    alert(`Pasajeros inscritos: ${viaje.pasajerosRegistrados.length}`);
  }

  cancelarViaje(id: string) {
    // Aquí cancelas el viaje (eliminar de la base o marcarlo cancelado)
    this.viajesPublicados = this.viajesPublicados.filter(v => v.id !== id);
    alert('Viaje cancelado');
  }
}
