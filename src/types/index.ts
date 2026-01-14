import { ReactNode } from "react";

export type TelaTipo = "login" | "cadastro" | "home" | "simulado" | "resultado" | "exercicios" | "estatisticas" | "admin_questoes" | "admin_alunos" | "apostilas" | "perfil";

export interface Usuario {
  id: string;
  email?: string;
  created_at?: string; // Adicionado para evitar erro no AdminStudents
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
  };
  school_id?: string;
  school?: {
    name: string;
    slug: string;
    logo_url: string;
    primary_color: string;
  };
}

export interface QuestionDB {
  id: string;
  category: string;
  topic?: string;
  text: string;
  image_url?: string;
  explanation_video_url?: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  answer_e?: string | null; // Opcional
  correct_answer: string; // 'A', 'B', 'C', 'D', 'E'
  explanation?: string;
  active: boolean;
  created_at?: string;
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
  icon: ReactNode; // Tipagem correta para ícones React
}