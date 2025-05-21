import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  template: `<div id="map" style="height: 100%; width: 100%;"></div>`,
})
export class MapComponent implements OnInit {
  private map!: L.Map;

  ngOnInit(): void {
    this.map = L.map('map').setView([0, 0], 2); // Vista inicial global

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.locateUser();
  }

  locateUser() {
    if (navigator.geolocation) {
      console.log('Intentando obtener ubicación...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log(`Ubicación obtenida: ${lat}, ${lng}`);

          this.map.setView([lat, lng], 13);

          const marker = L.marker([lat, lng]).addTo(this.map);
          marker.bindPopup('Estás aquí').openPopup();
        },
        (error) => {
          console.error('Error obteniendo la ubicación:', error);
          alert('No se pudo obtener la ubicación. Por favor, revisa los permisos y que estés en HTTPS.');
        }
      );
    } else {
      console.error('Geolocalización no soportada en este navegador.');
      alert('Tu navegador no soporta geolocalización.');
    }
  }
}
