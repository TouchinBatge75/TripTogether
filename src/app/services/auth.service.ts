import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, UserCredential } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Registro de usuario con datos adicionales
  async register(email: string, password: string, userData: any): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    
    // Guardar datos adicionales en Firestore en la colección 'users', con el uid del usuario
    const userDocRef = doc(this.firestore, `users/${userCredential.user.uid}`);
    await setDoc(userDocRef, userData);

    return userCredential;
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  get currentUser() {
    return this.auth.currentUser;
  }
}
