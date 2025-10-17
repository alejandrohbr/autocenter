import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-autoservicio-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autoservicio-login.component.html',
  styleUrls: ['./autoservicio-login.component.css']
})
export class AutoservicioLoginComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  goBack() {
    this.router.navigate(['/']);
  }

  async onLogin() {
    this.errorMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Por favor ingrese su email';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Por favor ingrese su contraseña';
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.login(this.email, this.password);

      if (result.success && result.user) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = result.message || 'Email o contraseña incorrectos';
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.errorMessage = 'Error inesperado al iniciar sesión';
    } finally {
      this.isLoading = false;
    }
  }
}
