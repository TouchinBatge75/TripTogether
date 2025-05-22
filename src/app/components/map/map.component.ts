import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine'; // Importa el plugin sin tipos oficiales

@Component({
  selector: 'app-map',
  template: `<div id="map" style="height: 400px; width: 100%;"></div>`,
})
export class MapComponent implements OnChanges {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private routeControl: any = null;

  @Input() ubicacionActual: { latitude: number; longitude: number } | null = null;
  @Input() ubicacionDestino: { latitude: number; longitude: number } | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) {
      this.initMap();
    }

    if (changes['ubicacionActual'] || changes['ubicacionDestino']) {
      this.updateRoute();
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private updateRoute(): void {
    // Elimina ruta previa si existe
    if (this.routeControl) {
      this.map.removeControl(this.routeControl);
      this.routeControl = null;
    }

    // Elimina marcadores previos
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];

    if (this.ubicacionActual) {
      const markerActual = L.marker([this.ubicacionActual.latitude, this.ubicacionActual.longitude]).addTo(this.map);
      markerActual.bindPopup('Ubicación Actual').openPopup();
      this.markers.push(markerActual);
    }

    if (this.ubicacionDestino) {
      const markerDestino = L.marker([this.ubicacionDestino.latitude, this.ubicacionDestino.longitude]).addTo(this.map);
      markerDestino.bindPopup('Destino').openPopup();
      this.markers.push(markerDestino);
    }

    if (this.ubicacionActual && this.ubicacionDestino) {
      this.routeControl = L.Routing.control({
        waypoints: [
          L.latLng(this.ubicacionActual.latitude, this.ubicacionActual.longitude),
          L.latLng(this.ubicacionDestino.latitude, this.ubicacionDestino.longitude)
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        createMarker: () => null
      }).addTo(this.map);
    } else if (this.ubicacionActual) {
      this.map.setView([this.ubicacionActual.latitude, this.ubicacionActual.longitude], 13);
    } else {
      this.map.setView([0, 0], 2);
    }
  }
}
