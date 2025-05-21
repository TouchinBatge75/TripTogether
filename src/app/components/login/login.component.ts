import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm;

  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private afAuth: AngularFireAuth) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }
  
  async onSubmit() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    try {
      await this.afAuth.signInWithEmailAndPassword(email!, password!);
      this.successMessage = 'Login exitoso';
      this.errorMessage = '';
    } catch (error: any) {
      this.errorMessage = error.message;
      this.successMessage = '';
    }
  }
}
