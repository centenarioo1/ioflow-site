export const CATEGORIAS = [
  "Dúvidas",
  "Tutoriais - Outdoor",
  "Tutoriais - Indoor",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const CORES_CATEGORIA: Record<string, string> = {
  "Dúvidas": "bg-amber-100 text-amber-800",
  "Tutoriais - Outdoor": "bg-green-100 text-green-800",
  "Tutoriais - Indoor": "bg-purple-100 text-purple-800",
};

export const MAX_IMAGENS = 4;
export const MAX_TAMANHO_MB = 5;