import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showPassword = false;
  errorMessage = '';
  successMessage = '';

  registerForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    birthdate: ['', Validators.required],
    gender: ['', Validators.required],
    hasDisability: [false],
    disabilityType: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onDisabilityChange(hasDisability: boolean) {
    this.registerForm.patchValue({ disabilityType: '' });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  isPasswordStrong(password: string): boolean {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return strongPasswordRegex.test(password);
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Por favor completa el formulario correctamente.';
      this.successMessage = '';
      return;
    }

    const {
      name = '',
      lastName = '',
      birthdate = '',
      gender = '',
      hasDisability = false,
      disabilityType = '',
      email = '',
      password = '',
    } = this.registerForm.value;

    const emailStr = email ?? '';
    const passwordStr = password ?? '';

    if (!this.isPasswordStrong(passwordStr)) {
      this.errorMessage =
        'La contraseña debe tener al menos 6 caracteres, incluir mayúsculas, minúsculas y números.';
      this.successMessage = '';
      return;
    }

    try {
      await this.authService.register(emailStr, passwordStr, {
        name,
        lastName,
        birthdate,
        gender,
        hasDisability,
        disabilityType,
      });
      this.successMessage = 'Registro exitoso';
      this.errorMessage = '';
      this.registerForm.reset();

      // Redirigir a login después del registro exitoso
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Error en registro';
      this.successMessage = '';
    }
  }
}
