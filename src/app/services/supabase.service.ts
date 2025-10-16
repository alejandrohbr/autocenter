import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = 'https://ldomgkpkpcgiuojszqur.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkb21na3BrcGNnaXVvanN6cXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Nzc0NjMsImV4cCI6MjA3NTA1MzQ2M30.9lESj-Keb_I2-Dhah2OUYodbU-HhDi3PGbkBRUZOd2Y';

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }
}
