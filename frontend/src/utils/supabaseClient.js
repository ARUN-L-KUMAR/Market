import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yongxcdipsfjprtdvscx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvbmd4Y2RpcHNmanBydGR2c2N4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NzY4MDEsImV4cCI6MjA2ODE1MjgwMX0.b4eVyodTmjBRkriPFkwGzG7-KWkNpPDJqT5R_vXfSTI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);