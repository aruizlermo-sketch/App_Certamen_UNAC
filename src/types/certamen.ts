export type ConcursoEstado = "borrador" | "activo" | "cerrado";
export type UserRol = "admin" | "jurado";

export type Concurso = {
  id: string;
  nombre: string;
  descripcion: string | null;
  escalaMin: number;
  escalaMax: number;
  estado: ConcursoEstado;
};

export type Categoria = {
  id: string;
  concursoId: string;
  nombre: string;
  descripcion: string | null;
  multiplicador: number;
  tienePremio: boolean;
  orden: number;
};

export type CategoriaCriterio = {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string | null;
  peso: number;
  orden: number;
};

export type Participante = {
  id: string;
  concursoId: string;
  nombre: string;
  orden: number;
};

export type Jurado = {
  id: string;
  concursoId: string;
  nombre: string;
  email: string | null;
  userId: string | null;
  esPresidente: boolean;
  activo: boolean;
};

export type Calificacion = {
  id: string;
  juradoId: string;
  participanteId: string;
  categoriaCriterioId: string;
  puntaje: number;
};

export type CategoriaConCriterios = Categoria & {
  criterios: CategoriaCriterio[];
  jurados: Jurado[];
};

export type ConcursoCompleto = Concurso & {
  categorias: CategoriaConCriterios[];
  participantes: Participante[];
  jurados: Jurado[];
};

export type PuntajeParticipanteCategoria = {
  participanteId: string;
  participanteNombre: string;
  puntaje: number;
  desglose: { criterioId: string; criterioNombre: string; promedio: number; peso: number; contribucion: number }[];
};

export type RankingCategoria = {
  categoria: Categoria;
  ranking: PuntajeParticipanteCategoria[];
  ganador: PuntajeParticipanteCategoria | null;
};

export type PuntajeTotalParticipante = {
  participanteId: string;
  participanteNombre: string;
  puntajeTotal: number;
  porCategoria: { categoriaId: string; categoriaNombre: string; puntaje: number; multiplicador: number; contribucion: number }[];
};

export type ResultadosConcurso = {
  concurso: Concurso;
  rankingGeneral: PuntajeTotalParticipante[];
  porCategoria: RankingCategoria[];
};

export type AdminInvite = {
  email: string;
  nombre: string;
};
