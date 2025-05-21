import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.errorMessage = 'Esta funcionalidad no está disponible en el servidor.';
      this.successMessage = '';
      return;
    }

    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor completa el formulario correctamente.';
      this.successMessage = '';
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      await signInWithEmailAndPassword(this.auth, email!, password!);
      this.successMessage = 'Login exitoso';
      this.errorMessage = '';
      // Redirige a dashboard después del login exitoso
      this.router.navigate(['/home']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error en login';
      this.successMessage = '';
    }
  }
}
