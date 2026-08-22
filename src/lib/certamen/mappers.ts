import type {
  Calificacion,
  Categoria,
  CategoriaCriterio,
  Concurso,
  Jurado,
  Participante,
} from "@/types/certamen";

type DbRow = Record<string, unknown>;

export function mapConcurso(row: DbRow): Concurso {
  return {
    id: String(row.id),
    nombre: String(row.nombre),
    descripcion: row.descripcion ? String(row.descripcion) : null,
    escalaMin: Number(row.escala_min),
    escalaMax: Number(row.escala_max),
    estado: row.estado as Concurso["estado"],
  };
}

export function mapCategoria(row: DbRow): Categoria {
  return {
    id: String(row.id),
    concursoId: String(row.concurso_id),
    nombre: String(row.nombre),
    descripcion: row.descripcion ? String(row.descripcion) : null,
    pesoTotal: Number(row.peso_total),
    orden: Number(row.orden),
  };
}

export function mapCriterio(row: DbRow): CategoriaCriterio {
  return {
    id: String(row.id),
    categoriaId: String(row.categoria_id),
    nombre: String(row.nombre),
    descripcion: row.descripcion ? String(row.descripcion) : null,
    peso: Number(row.peso),
    orden: Number(row.orden),
  };
}

export function mapParticipante(row: DbRow): Participante {
  return {
    id: String(row.id),
    concursoId: String(row.concurso_id),
    nombre: String(row.nombre),
    orden: Number(row.orden),
  };
}

export function mapJurado(row: DbRow): Jurado {
  return {
    id: String(row.id),
    concursoId: String(row.concurso_id),
    nombre: String(row.nombre),
    email: row.email ? String(row.email) : null,
    userId: row.user_id ? String(row.user_id) : null,
    esPresidente: Boolean(row.es_presidente),
    activo: Boolean(row.activo),
  };
}

export function mapCalificacion(row: DbRow): Calificacion {
  return {
    id: String(row.id),
    juradoId: String(row.jurado_id),
    participanteId: String(row.participante_id),
    categoriaCriterioId: String(row.categoria_criterio_id),
    puntaje: Number(row.puntaje),
  };
}

export function mapJuradoCategoria(row: DbRow) {
  return {
    juradoId: String(row.jurado_id),
    categoriaId: String(row.categoria_id),
  };
}
