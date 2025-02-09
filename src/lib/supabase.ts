import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dbawyooajyzbrzmpfofq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiYXd5b29hanl6YnJ6bXBmb2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2NDA1MjMsImV4cCI6MjA1NDIxNjUyM30.cYNVnQX_AbmbAhfHf7uBMcv9Vb7cEvyT810spoC_57Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
