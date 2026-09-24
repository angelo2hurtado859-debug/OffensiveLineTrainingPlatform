import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hbchexmhizrexdsejznn.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiY2hleG1oaXpyZXhkc2Vqem5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4OTA2ODUsImV4cCI6MjEwMTQ2NjY4NX0.0UroJEj9f8Rawly1DCALv-L_Q7DHguB5kGWtnzg1B_8';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);