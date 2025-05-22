import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  arrayUnion,
  getDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ViajeService {
  constructor(private firestore: Firestore) {}

  publicarViaje(viaje: any, userId: string): Promise<any> {
    const viajesRef = collection(this.firestore, 'viajes');
    const viajeConPublicador = { ...viaje, userIdPublicador: userId, pasajerosIds: [] };
    return addDoc(viajesRef, viajeConPublicador);
  }

  obtenerViajes(): Observable<any[]> {
    const viajesRef = collection(this.firestore, 'viajes');
    return collectionData(viajesRef, { idField: 'id' });
  }

  async unirseAViaje(viajeId: string, userId: string): Promise<void> {
    const viajeDoc = doc(this.firestore, `viajes/${viajeId}`);
    const viajeSnap = await getDoc(viajeDoc);

    if (!viajeSnap.exists()) {
      throw new Error('El viaje no existe');
    }

    const viajeData = viajeSnap.data();

    // No puede unirse el creador
    if (viajeData?.['userIdPublicador'] === userId) {
      throw new Error('No puedes inscribirte en tu propio viaje');
    }

    // No puede unirse si ya está inscrito
    if (viajeData?.['pasajerosIds']?.includes(userId)) {
      throw new Error('Ya estás inscrito en este viaje');
    }

    // Validar que no se haya llenado el máximo de pasajeros
    const maxPasajeros = viajeData?.['pasajerosDisponibles'] || 0;
    const pasajerosActuales = viajeData?.['pasajerosIds']?.length || 0;

    if (pasajerosActuales >= maxPasajeros) {
      throw new Error('No hay asientos disponibles en este viaje');
    }

    // Agregar al usuario en la lista de pasajeros
    await updateDoc(viajeDoc, {
      pasajerosIds: arrayUnion(userId),
    });
  }
}
