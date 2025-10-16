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

  tipoUsuario: string = 'vendedor';
  userName: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  tiposUsuario = [
    { value: 'admin', text: 'Administrador' },
    { value: 'vendedor', text: 'Vendedor' }
  ];

  goBack() {
    this.router.navigate(['/']);
  }

  onTipoUsuarioChange() {
    this.errorMessage = '';
  }

  async onLogin() {
    this.errorMessage = '';

    if (!this.userName.trim()) {
      this.errorMessage = 'Por favor ingrese su usuario';
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Por favor ingrese su contraseña';
      return;
    }

    this.isLoading = true;

    try {
      const result = await this.authService.login(this.userName, this.password);

      if (result.success && result.user) {
        if (result.user.role === this.tipoUsuario) {
          this.router.navigate(['/autoservicio-dashboard']);
        } else {
          this.errorMessage = `Este usuario tiene rol de ${result.user.role}, pero seleccionaste ${this.tipoUsuario}`;
          this.authService.logout();
        }
      } else {
        this.errorMessage = result.message || 'Usuario o contraseña incorrectos';
      }
    } catch (error) {
      console.error('Error during login:', error);
      this.errorMessage = 'Error inesperado al iniciar sesión';
    } finally {
      this.isLoading = false;
    }
  }
}
