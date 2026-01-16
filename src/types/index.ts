import { ReactNode } from "react";

// Adicionei 'admin_exercicios' na lista
export type TelaTipo = "login" | "cadastro" | "home" | "simulado" | "resultado" | "exercicios" | "estatisticas" | "admin_questoes" | "admin_alunos" | "admin_exercicios" | "apostilas" | "perfil";

export interface Usuario {
  id: string;
  email?: string;
  created_at?: string;
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
  answer_e?: string | null;
  correct_answer: string;
  explanation?: string;
  active: boolean;
  created_at?: string;
}

// NOVO TIPO
export interface ExerciseTopicDB {
  id: string;
  title: string;
  description?: string;
  topic_tag: string;
  icon_name: string;
  color_class: string;
  school_id?: string;
  active: boolean;
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
  icon: ReactNode;
}