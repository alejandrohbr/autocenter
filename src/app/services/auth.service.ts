import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: 'admin' | 'vendedor' | 'proveedor';
  email?: string;
  telefono?: string;
  departamento?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error during login:', error);
        return { success: false, message: 'Error al conectar con el servidor' };
      }

      if (!data) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      if (data.password_hash !== password) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      const user: User = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        role: data.role,
        email: data.email
      };

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error inesperado durante el login' };
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  isVendedor(): boolean {
    return this.currentUser?.role === 'vendedor';
  }

  hasPermission(permission: 'delete_orders' | 'authorize_orders' | 'view_reports'): boolean {
    if (!this.currentUser) return false;

    if (this.currentUser.role === 'admin') {
      return true;
    }

    if (this.currentUser.role === 'vendedor') {
      switch (permission) {
        case 'delete_orders':
          return false;
        case 'authorize_orders':
          return false;
        case 'view_reports':
          return true;
        default:
          return false;
      }
    }

    return false;
  }
}
