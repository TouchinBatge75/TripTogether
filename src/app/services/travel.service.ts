import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViajeService {
  constructor(private firestore: Firestore) {}

  publicarViaje(viaje: any): Promise<any> {
    const viajesRef = collection(this.firestore, 'viajes');
    return addDoc(viajesRef, viaje);
  }

  obtenerViajes(): Observable<any[]> {
    const viajesRef = collection(this.firestore, 'viajes');
    return collectionData(viajesRef, { idField: 'id' });
  }
}
