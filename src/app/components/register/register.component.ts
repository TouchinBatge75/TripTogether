import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa el formulario correctamente.';
      this.successMessage = '';
      return;
    }

const email = this.registerForm.get('email')?.value ?? '';
const password = this.registerForm.get('password')?.value ?? '';


    try {
      await createUserWithEmailAndPassword(this.auth, email!, password!);
      this.successMessage = 'Registro exitoso';
      this.errorMessage = '';
      this.registerForm.reset();
    } catch (error: any) {
      this.errorMessage = error.message || 'Error en registro';
      this.successMessage = '';
    }
  }
}
