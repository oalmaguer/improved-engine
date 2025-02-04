import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://dbawyooajyzbrzmpfofq.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiYXd5b29hanl6YnJ6bXBmb2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NDA1MjMsImV4cCI6MjA1NDIxNjUyM30.cYNVnQX_AbmbAhfHf7uBMcv9Vb7cEvyT810spoC_57Y'
    );
  }

  async saveImage(prompt: string, imageUrl: string) {
    const { data, error } = await this.supabase
      .from('images')
      .insert([{ prompt, image_url: imageUrl }]);
    
    if (error) throw error;
    return data;
  }

  async getImages() {
    const { data, error } = await this.supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}