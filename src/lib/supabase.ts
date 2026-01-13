import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 ERRO CRÍTICO: Variáveis de ambiente do Supabase não encontradas!");
  console.error("Verifique se o arquivo .env.local existe na raiz e se as chaves estão lá.");
} else {
  console.log("✅ Supabase iniciado com URL:", supabaseUrl.substring(0, 15) + "...");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');