export type TelaTipo = "login" | "cadastro" | "home" | "exercicios" | "estatisticas" | "simulado" | "resultado" | "admin"; // Adicionado "admin"

export interface SchoolDB {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
}

export interface Usuario {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
  school_id?: string | null;
  school?: SchoolDB | null;
  role?: 'super_admin' | 'school_admin' | 'student'; // <--- NOVO CAMPO
}

// ... mantenha o resto das interfaces ...
export interface AnswerDB {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface QuestionDB {
  id: string;
  text: string;
  image_url?: string;
  explanation_video_url?: string;
  answers: AnswerDB[];
}

export interface SimuladoCardType {
  id: number;
  titulo: string;
  sigla: string;
  db_category: string;
  subtitulo: string;
  questoes: number;
  tempo: string;
  minimo: number;
  icon: React.ReactNode;
}