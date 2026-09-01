import type {
  Calificacion,
  Categoria,
  CategoriaCriterio,
  Concurso,
  Jurado,
  Participante,
} from "@/types/certamen";

export const MOCK_CONCURSO_ID = "a0000000-0000-4000-8000-000000000001";

export const mockConcurso: Concurso = {
  id: MOCK_CONCURSO_ID,
  nombre: "Certamen UNAC 2026",
  descripcion: "Concurso de tunas universitarias — UNAC 2026",
  escalaMin: 1,
  escalaMax: 10,
  estado: "activo",
};

export const mockParticipantes: Participante[] = [
  { id: "b0000001-0000-4000-8000-000000000001", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna Universidad de Ciencias Aplicadas", escudoUrl: null, orden: 1 },
  { id: "b0000001-0000-4000-8000-000000000002", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna Universidad Inca Garcilazo de la Vega", escudoUrl: null, orden: 2 },
  { id: "b0000001-0000-4000-8000-000000000003", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna Universidad Nacional Federico Villarreal", escudoUrl: null, orden: 3 },
  { id: "b0000001-0000-4000-8000-000000000004", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna Universidad Cesar Vallejo", escudoUrl: null, orden: 4 },
  { id: "b0000001-0000-4000-8000-000000000005", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna Universidad Nacional Agraria de la Molina", escudoUrl: null, orden: 5 },
  { id: "b0000001-0000-4000-8000-000000000006", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna Universidad San Ignacio de Loyola", escudoUrl: null, orden: 6 },
];

export const mockJurados: Jurado[] = [
  { id: "c0000001-0000-4000-8000-000000000001", concursoId: MOCK_CONCURSO_ID, nombre: "Municipalidad Carmen de la Legua", email: null, userId: null, esPresidente: false, activo: true },
  { id: "c0000001-0000-4000-8000-000000000002", concursoId: MOCK_CONCURSO_ID, nombre: "Ministerio de Cultura", email: null, userId: null, esPresidente: false, activo: true },
  { id: "c0000001-0000-4000-8000-000000000003", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna UNAC - Marco Perez", email: null, userId: null, esPresidente: false, activo: true },
  { id: "c0000001-0000-4000-8000-000000000004", concursoId: MOCK_CONCURSO_ID, nombre: "Tuna UNAC - Henry Lopez", email: null, userId: null, esPresidente: false, activo: true },
];

export const mockCategorias: Categoria[] = [
  { id: "d0000001-0000-4000-8000-000000000001", concursoId: MOCK_CONCURSO_ID, nombre: "Mejor Instrumental", descripcion: "Evalúa la ejecución musical centrada en calidad y coordinación de instrumentos.", multiplicador: 1, tienePremio: true, orden: 1 },
  { id: "d0000001-0000-4000-8000-000000000002", concursoId: MOCK_CONCURSO_ID, nombre: "Mejor Solista", descripcion: "Evalúa la actuación del solista vocal.", multiplicador: 1, tienePremio: true, orden: 2 },
  { id: "d0000001-0000-4000-8000-000000000003", concursoId: MOCK_CONCURSO_ID, nombre: "Mejor Pandereta", descripcion: "Evalúa el manejo de la pandereta.", multiplicador: 1, tienePremio: true, orden: 3 },
  { id: "d0000001-0000-4000-8000-000000000004", concursoId: MOCK_CONCURSO_ID, nombre: "Mejor Bandera", descripcion: "Evalúa el manejo de la bandera.", multiplicador: 1, tienePremio: true, orden: 4 },
  { id: "d0000001-0000-4000-8000-000000000005", concursoId: MOCK_CONCURSO_ID, nombre: "Mejor Capa", descripcion: "Evalúa la ejecución con capa.", multiplicador: 1, tienePremio: true, orden: 5 },
];

export const mockCriterios: CategoriaCriterio[] = [
  { id: "e0000001-0000-4000-8000-000000000001", categoriaId: "d0000001-0000-4000-8000-000000000001", nombre: "Calidad y precisión de los instrumentos", descripcion: "Afinación, calidad sonora y ejecución precisa.", peso: 0.4, orden: 1 },
  { id: "e0000001-0000-4000-8000-000000000002", categoriaId: "d0000001-0000-4000-8000-000000000001", nombre: "Coordinación y armonía entre los músicos", descripcion: "Sincronización y trabajo en equipo.", peso: 0.3, orden: 2 },
  { id: "e0000001-0000-4000-8000-000000000003", categoriaId: "d0000001-0000-4000-8000-000000000001", nombre: "Dificultad de la composición", descripcion: "Complejidad de las piezas interpretadas.", peso: 0.3, orden: 3 },
  { id: "e0000001-0000-4000-8000-000000000004", categoriaId: "d0000001-0000-4000-8000-000000000002", nombre: "Calidad de Técnica Vocal", descripcion: "Afinación, proyección, potencia y control.", peso: 0.4, orden: 1 },
  { id: "e0000001-0000-4000-8000-000000000005", categoriaId: "d0000001-0000-4000-8000-000000000002", nombre: "Interpretación y Expresividad", descripcion: "Emoción, carisma y presencia escénica.", peso: 0.3, orden: 2 },
  { id: "e0000001-0000-4000-8000-000000000006", categoriaId: "d0000001-0000-4000-8000-000000000002", nombre: "Dificultad de la pieza musical", descripcion: "Complejidad melódica y rango vocal.", peso: 0.3, orden: 3 },
  { id: "e0000001-0000-4000-8000-000000000007", categoriaId: "d0000001-0000-4000-8000-000000000003", nombre: "Manejo técnico y Habilidad", descripcion: "Dominio de movimientos, giros y lanzamientos.", peso: 0.4, orden: 1 },
  { id: "e0000001-0000-4000-8000-000000000008", categoriaId: "d0000001-0000-4000-8000-000000000003", nombre: "Coreografía y Originalidad", descripcion: "Creatividad y sincronización con la música.", peso: 0.3, orden: 2 },
  { id: "e0000001-0000-4000-8000-000000000009", categoriaId: "d0000001-0000-4000-8000-000000000003", nombre: "Vistosidad y Espectacularidad", descripcion: "Impacto visual, elegancia y fluidez.", peso: 0.3, orden: 3 },
  { id: "e0000001-0000-4000-8000-000000000010", categoriaId: "d0000001-0000-4000-8000-000000000004", nombre: "Manejo técnico y Habilidad", descripcion: "Dominio de movimientos, giros y lanzamientos.", peso: 0.4, orden: 1 },
  { id: "e0000001-0000-4000-8000-000000000011", categoriaId: "d0000001-0000-4000-8000-000000000004", nombre: "Coreografía y Originalidad", descripcion: "Creatividad y sincronización con la música.", peso: 0.3, orden: 2 },
  { id: "e0000001-0000-4000-8000-000000000012", categoriaId: "d0000001-0000-4000-8000-000000000004", nombre: "Vistosidad y Espectacularidad", descripcion: "Impacto visual, elegancia y fluidez.", peso: 0.3, orden: 3 },
  { id: "e0000001-0000-4000-8000-000000000013", categoriaId: "d0000001-0000-4000-8000-000000000005", nombre: "Precisión y Sincronización", descripcion: "Precisión y sincronización en el manejo de la capa.", peso: 0.4, orden: 1 },
  { id: "e0000001-0000-4000-8000-000000000014", categoriaId: "d0000001-0000-4000-8000-000000000005", nombre: "Calidad de Sonido", descripcion: "Calidad sonora de la ejecución.", peso: 0.3, orden: 2 },
  { id: "e0000001-0000-4000-8000-000000000015", categoriaId: "d0000001-0000-4000-8000-000000000005", nombre: "Arreglo y Riqueza instrumental", descripcion: "Arreglo musical y riqueza instrumental.", peso: 0.3, orden: 3 },
];

export const mockJuradoCategorias: { juradoId: string; categoriaId: string }[] = [
  { juradoId: "c0000001-0000-4000-8000-000000000001", categoriaId: "d0000001-0000-4000-8000-000000000001" },
  { juradoId: "c0000001-0000-4000-8000-000000000002", categoriaId: "d0000001-0000-4000-8000-000000000001" },
  { juradoId: "c0000001-0000-4000-8000-000000000003", categoriaId: "d0000001-0000-4000-8000-000000000001" },
  { juradoId: "c0000001-0000-4000-8000-000000000002", categoriaId: "d0000001-0000-4000-8000-000000000002" },
  { juradoId: "c0000001-0000-4000-8000-000000000004", categoriaId: "d0000001-0000-4000-8000-000000000002" },
  { juradoId: "c0000001-0000-4000-8000-000000000003", categoriaId: "d0000001-0000-4000-8000-000000000002" },
  { juradoId: "c0000001-0000-4000-8000-000000000001", categoriaId: "d0000001-0000-4000-8000-000000000003" },
  { juradoId: "c0000001-0000-4000-8000-000000000002", categoriaId: "d0000001-0000-4000-8000-000000000003" },
  { juradoId: "c0000001-0000-4000-8000-000000000003", categoriaId: "d0000001-0000-4000-8000-000000000003" },
  { juradoId: "c0000001-0000-4000-8000-000000000001", categoriaId: "d0000001-0000-4000-8000-000000000004" },
  { juradoId: "c0000001-0000-4000-8000-000000000002", categoriaId: "d0000001-0000-4000-8000-000000000004" },
  { juradoId: "c0000001-0000-4000-8000-000000000003", categoriaId: "d0000001-0000-4000-8000-000000000004" },
  { juradoId: "c0000001-0000-4000-8000-000000000001", categoriaId: "d0000001-0000-4000-8000-000000000005" },
  { juradoId: "c0000001-0000-4000-8000-000000000002", categoriaId: "d0000001-0000-4000-8000-000000000005" },
  { juradoId: "c0000001-0000-4000-8000-000000000003", categoriaId: "d0000001-0000-4000-8000-000000000005" },
];

let mockCalificaciones: Calificacion[] = [];

export function getMockCalificaciones(): Calificacion[] {
  return mockCalificaciones;
}

export function upsertMockCalificacion(input: Omit<Calificacion, "id"> & { id?: string }): Calificacion {
  const existing = mockCalificaciones.find(
    (c) =>
      c.juradoId === input.juradoId &&
      c.participanteId === input.participanteId &&
      c.categoriaCriterioId === input.categoriaCriterioId,
  );

  if (existing) {
    existing.puntaje = input.puntaje;
    return existing;
  }

  const created: Calificacion = {
    id: input.id ?? crypto.randomUUID(),
    juradoId: input.juradoId,
    participanteId: input.participanteId,
    categoriaCriterioId: input.categoriaCriterioId,
    puntaje: input.puntaje,
  };
  mockCalificaciones.push(created);
  return created;
}
