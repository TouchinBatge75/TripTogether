import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  viajeForm: FormGroup;
  viajePublicado = false;
  viajeData: any = null;

  constructor(private fb: FormBuilder) {
    this.viajeForm = this.fb.group({
      origen: ['', Validators.required],
      destino: ['', Validators.required],
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      asientosDisponibles: [1, [Validators.required, Validators.min(1)]],
      costoPorPersona: [0, [Validators.required, Validators.min(1)]],
      notas: ['']
    });
  }

  publicarViaje() {
    if (this.viajeForm.invalid) {
      this.viajeForm.markAllAsTouched();
      return;
    }

    this.viajeData = this.viajeForm.value;
    this.viajePublicado = true;

    // Aquí podrías mandar los datos a tu backend
    console.log('Viaje publicado:', this.viajeData);
  }
}
